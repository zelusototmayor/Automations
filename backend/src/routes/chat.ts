import { Router, Request, Response } from 'express';
import { prisma } from '../services/database';
import { authenticate } from '../middleware/auth';
import { canSendMessage, recordFreeTrial, getFreeTrialUsage, hasCoachAccess } from '../services/subscription';
import { generateCoachResponse, ChatMessage, AssessmentResultForPrompt } from '../services/llm';
import { retrieveRelevantChunks, hasKnowledgeSources } from '../services/retrieval';
import { getInsightsForPrompt, processConversationForInsights } from '../services/insightExtractor';
import type { AssessmentConfig, AssessmentQuestion } from '../validation/assessments';

const router = Router();

// Type for agent with model config
interface AgentWithConfig {
  id: string;
  systemPrompt: string;
  greetingMessage: string;
  personalityConfig: any;
  modelConfig: any;
  exampleConversations: any[];
}

/**
 * POST /chat/message - Send a message and get streaming response
 */
router.post('/message', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { agent_id, conversation_id, message, voice_mode } = req.body;

    if (!agent_id || !message) {
      res.status(400).json({ error: 'Missing agent_id or message' });
      return;
    }

    // Check if user can send message (premium or free trial)
    const { allowed, reason, freeTrialRemaining, freeTrialLimit, usedFreeTrial } = await canSendMessage(userId, agent_id);
    if (!allowed) {
      if (reason === 'AGENT_NOT_FOUND') {
        res.status(404).json({ error: 'Agent not found' });
        return;
      }
      res.status(403).json({
        error: 'Free trial exhausted. Subscribe to continue.',
        code: reason,
        freeTrialRemaining: 0,
        freeTrialLimit: freeTrialLimit,
      });
      return;
    }

    // Get agent details
    const agent = await prisma.agent.findUnique({
      where: { id: agent_id },
    });

    if (!agent) {
      res.status(404).json({ error: 'Agent not found' });
      return;
    }

    // Get or create conversation
    let convId = conversation_id;
    if (!convId) {
      const newConv = await prisma.conversation.create({
        data: {
          userId,
          agentId: agent_id,
        },
      });
      convId = newConv.id;
    }

    // Save user message
    await prisma.message.create({
      data: {
        conversationId: convId,
        role: 'USER',
        content: message,
      },
    });

    // Get conversation history
    const history = await prisma.message.findMany({
      where: { conversationId: convId },
      orderBy: { createdAt: 'asc' },
      select: { role: true, content: true },
    });

    const messages: ChatMessage[] = history.map((m) => ({
      role: m.role.toLowerCase() as 'user' | 'assistant',
      content: m.content,
    }));

    // Get user context
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { context: true },
    });

    const userContext = user?.context || null;

    // Get user insights (memory) for this agent
    let userInsightsPrompt: string | null = null;
    try {
      userInsightsPrompt = await getInsightsForPrompt(userId, agent_id);
    } catch (error) {
      console.error('Error fetching user insights:', error);
    }

    // Retrieve relevant knowledge from agent's knowledge sources
    let retrievedKnowledge = null;
    try {
      const hasKnowledge = await hasKnowledgeSources(agent_id);
      if (hasKnowledge) {
        retrievedKnowledge = await retrieveRelevantChunks(agent_id, message, {
          limit: 5,
          minSimilarity: 0.7,
        });
      }
    } catch (error) {
      // Log error but continue without knowledge - don't block the chat
      console.error('Error retrieving knowledge:', error);
    }

    // Fetch assessment results for this user/agent
    let assessmentResults: AssessmentResultForPrompt[] | null = null;
    try {
      const assessmentResponses = await prisma.assessmentResponse.findMany({
        where: {
          userId,
          agentId: agent_id,
        },
        orderBy: { completedAt: 'desc' },
        take: 5, // Limit to most recent 5 assessments
      });

      if (assessmentResponses.length > 0) {
        // Get assessment configs from agent
        const assessmentConfigs = (agent.assessmentConfigs as AssessmentConfig[]) || [];

        assessmentResults = [];
        for (const response of assessmentResponses) {
          const config = assessmentConfigs.find((c) => c.id === response.assessmentId);
          if (!config) continue;

          const answers = response.answers as Record<string, string | number>;
          const formattedAnswers: AssessmentResultForPrompt['answers'] = config.questions
            .filter((q) => answers[q.id] !== undefined)
            .map((q) => ({
              question: q.text,
              questionType: q.type,
              category: q.category,
              answer: answers[q.id],
            }));

          assessmentResults.push({
            assessmentName: config.name,
            answers: formattedAnswers,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching assessment results:', error);
      // Continue without assessments
    }

    // Set up streaming response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Conversation-Id', convId);

    let fullResponse = '';

    try {
      // Convert Prisma agent to the format expected by LLM service
      const agentForLLM = {
        id: agent.id,
        system_prompt: agent.systemPrompt,
        greeting_message: agent.greetingMessage,
        personality_config: agent.personalityConfig,
        model_config: agent.modelConfig,
        example_conversations: agent.exampleConversations,
        knowledge_context: agent.knowledgeContext,
        user_insights_prompt: userInsightsPrompt,
      };

      // Stream the response (pass voice_mode for conversational responses)
      for await (const chunk of generateCoachResponse(agentForLLM as any, messages, userContext as any, retrievedKnowledge, assessmentResults, voice_mode)) {
        fullResponse += chunk;
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      }

      // Save assistant message
      await prisma.message.create({
        data: {
          conversationId: convId,
          role: 'ASSISTANT',
          content: fullResponse,
        },
      });

      // Update conversation timestamp
      await prisma.conversation.update({
        where: { id: convId },
        data: { updatedAt: new Date() },
      });

      // Increment agent usage count
      await prisma.agent.update({
        where: { id: agent_id },
        data: { usageCount: { increment: 1 } },
      });

      // Record free trial usage only when trial was used
      if (usedFreeTrial) {
        await recordFreeTrial(userId, agent_id);
      }

      // Extract insights in the background (non-blocking)
      // Only process every 5 messages to avoid excessive API calls
      const messageCount = messages.length;
      if (messageCount > 0 && messageCount % 5 === 0) {
        processConversationForInsights(convId).catch((err) => {
          console.error('Background insight extraction failed:', err);
        });
      }

      // Send completion signal with free trial info
      const completionData: any = { done: true, conversation_id: convId };
      if (freeTrialRemaining !== undefined) {
        completionData.freeTrialRemaining = freeTrialRemaining;
        completionData.freeTrialLimit = freeTrialLimit;
      }
      res.write(`data: ${JSON.stringify(completionData)}\n\n`);
      res.end();
    } catch (streamError: any) {
      console.error('Streaming error:', streamError);
      // Provide more helpful error message
      let errorMessage = 'Streaming failed';
      if (streamError.message?.includes('API key')) {
        errorMessage = 'AI service configuration error. Please contact support.';
      } else if (streamError.message?.includes('model')) {
        errorMessage = 'Invalid AI model configuration. Please contact support.';
      } else if (streamError.code === 'ECONNREFUSED' || streamError.code === 'ETIMEDOUT') {
        errorMessage = 'Could not connect to AI service. Please try again.';
      }
      console.error('Error details:', streamError.message || streamError);
      res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
      res.end();
    }
  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

/**
 * GET /chat/conversations - Get user's conversations
 */
router.get('/conversations', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const conversations = await prisma.conversation.findMany({
      where: { userId },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            tagline: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({ conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

/**
 * GET /chat/conversations/:id - Get conversation with messages
 */
router.get('/conversations/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const id = req.params.id as string;

    // Verify ownership and get conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            tagline: true,
            greetingMessage: true,
          },
        },
      },
    });

    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    // Get messages
    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        role: true,
        content: true,
        createdAt: true,
      },
    });

    res.json({ conversation, messages });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

/**
 * DELETE /chat/conversations/:id - Delete a conversation
 */
router.delete('/conversations/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const id = req.params.id as string;

    // Verify ownership
    const existing = await prisma.conversation.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(403).json({ error: 'Not authorized to delete this conversation' });
      return;
    }

    // Delete conversation (messages will cascade)
    await prisma.conversation.delete({ where: { id } });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

/**
 * GET /chat/trial/:agentId - Get free trial usage for a specific agent
 */
router.get('/trial/:agentId', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const agentId = req.params.agentId as string;

    const hasAccess = await hasCoachAccess(userId, agentId);
    if (hasAccess) {
      res.json({ hasAccess: true });
      return;
    }

    const { used, remaining, limit } = await getFreeTrialUsage(userId, agentId);
    res.json({ hasAccess: false, used, remaining, limit });
  } catch (error) {
    console.error('Error fetching trial usage:', error);
    res.status(500).json({ error: 'Failed to fetch trial usage' });
  }
});

/**
 * GET /chat/suggestions/:agentId - Get conversation starters for an agent
 */
router.get('/suggestions/:agentId', async (req: Request, res: Response) => {
  try {
    const agentId = req.params.agentId as string;

    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      select: {
        conversationStarters: true,
        greetingMessage: true,
      },
    });

    if (!agent) {
      res.status(404).json({ error: 'Agent not found' });
      return;
    }

    res.json({
      greeting: agent.greetingMessage,
      suggestions: agent.conversationStarters || [],
    });
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

export default router;
