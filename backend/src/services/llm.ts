import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { LLMConfig, LLMProvider, UserContext, Agent } from '../types';
import { RetrievedChunk } from './retrieval';

// Initialize clients (lazy loaded)
let anthropicClient: Anthropic | null = null;
let openaiClient: OpenAI | null = null;
let googleClient: GoogleGenerativeAI | null = null;

function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return anthropicClient;
}

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

function getGoogleClient(): GoogleGenerativeAI {
  if (!googleClient) {
    googleClient = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
  }
  return googleClient;
}

// Supported models configuration
// Pricing per million tokens (input/output):
// Claude Haiku 4.5: $1/$5 | Sonnet 4.5: $3/$15 | Opus 4.5: $5/$25
// GPT-5.2: Latest flagship
export const SUPPORTED_MODELS: Record<LLMProvider, Array<{ id: string; name: string; recommended?: boolean }>> = {
  anthropic: [
    { id: 'claude-sonnet-4-5-20250929', name: 'Claude (Latest)', recommended: true },
  ],
  openai: [
    { id: 'gpt-5.2', name: 'GPT (Latest)', recommended: true },
  ],
  google: [
    { id: 'gemini-2.5-flash', name: 'Gemini (Latest)', recommended: true },
  ],
};

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Interface for inline knowledge documents
interface KnowledgeContextDoc {
  type: 'notion' | 'google_doc' | 'file';
  title: string;
  content: string;
}

// Interface for assessment responses with question context
export interface AssessmentResultForPrompt {
  assessmentName: string;
  answers: Array<{
    question: string;
    questionType: 'scale_1_10' | 'multiple_choice' | 'open_text';
    category?: string;
    answer: string | number;
  }>;
}

/**
 * Build the complete system prompt with user context, assessment results, and retrieved knowledge
 */
export function buildSystemPrompt(
  agent: Agent & { user_insights_prompt?: string | null },
  userContext?: UserContext | null,
  retrievedKnowledge?: RetrievedChunk[] | null,
  assessmentResults?: AssessmentResultForPrompt[] | null,
  voiceMode?: boolean
): string {
  let prompt = agent.system_prompt;

  // Inject user insights (memory from previous conversations) - this comes first as it's foundational
  if (agent.user_insights_prompt) {
    prompt += `\n\n${agent.user_insights_prompt}`;
  }

  // Inject inline knowledge context (from agent creation - Notion URLs/uploaded files)
  const knowledgeContext = (agent.knowledge_context || []) as KnowledgeContextDoc[];
  if (knowledgeContext.length > 0) {
    prompt += `\n\n## Your Knowledge Base\n`;
    prompt += `The following documents contain your specialized knowledge and methodology. `;
    prompt += `Use this information to provide informed, personalized responses. `;
    prompt += `Speak as if this knowledge is your own expertise.\n\n`;

    for (const doc of knowledgeContext) {
      prompt += `### ${doc.title}\n`;
      // Truncate very long content to avoid token limits
      const content = doc.content.length > 15000
        ? doc.content.substring(0, 15000) + '\n\n[Content truncated...]'
        : doc.content;
      prompt += `${content}\n\n`;
    }
  }

  // Inject retrieved knowledge from RAG if available (advanced feature)
  if (retrievedKnowledge && retrievedKnowledge.length > 0) {
    prompt += `\n\n## Additional Relevant Knowledge\n`;
    prompt += `Use the following information from your knowledge base to inform your responses. `;
    prompt += `Reference this knowledge when relevant, but don't mention that it comes from a "knowledge base" - `;
    prompt += `speak as if this is your own expertise.\n\n`;

    for (const chunk of retrievedKnowledge) {
      prompt += `### From: ${chunk.documentTitle}`;
      if (chunk.heading) {
        prompt += ` > ${chunk.heading}`;
      }
      prompt += `\n${chunk.content}\n\n`;
    }
  }

  // Inject user context if available
  if (userContext && Object.keys(userContext).length > 0) {
    prompt += `\n\n## About the Person You're Coaching\n`;
    if (userContext.name) prompt += `Name: ${userContext.name}\n`;
    if (userContext.about) prompt += `Background: ${userContext.about}\n`;
    if (userContext.values?.length) prompt += `Core Values: ${userContext.values.join(', ')}\n`;
    if (userContext.goals) prompt += `Current Goals: ${userContext.goals}\n`;
    if (userContext.challenges) prompt += `Challenges: ${userContext.challenges}\n`;
    if (userContext.additional) prompt += `Additional Context: ${userContext.additional}\n`;
    prompt += `\nUse this context to personalize your coaching. Reference their values and goals when relevant.`;
  }

  // Inject assessment results if available
  if (assessmentResults && assessmentResults.length > 0) {
    prompt += `\n\n## Assessment Results\n`;
    prompt += `The person has completed the following assessments. Use these insights to `;
    prompt += `personalize your coaching and provide targeted advice.\n\n`;

    for (const assessment of assessmentResults) {
      prompt += `### ${assessment.assessmentName}\n`;

      // Group by category if categories exist
      const categories = new Map<string, typeof assessment.answers>();
      const uncategorized: typeof assessment.answers = [];

      for (const answer of assessment.answers) {
        if (answer.category) {
          const existing = categories.get(answer.category) || [];
          existing.push(answer);
          categories.set(answer.category, existing);
        } else {
          uncategorized.push(answer);
        }
      }

      // Output categorized answers
      for (const [category, answers] of categories) {
        prompt += `\n**${category}:**\n`;
        for (const a of answers) {
          if (a.questionType === 'scale_1_10') {
            const score = a.answer as number;
            const level = score <= 3 ? 'Low' : score <= 6 ? 'Moderate' : 'High';
            prompt += `- ${a.question}: ${score}/10 (${level})\n`;
          } else {
            prompt += `- ${a.question}: ${a.answer}\n`;
          }
        }
      }

      // Output uncategorized answers
      if (uncategorized.length > 0) {
        for (const a of uncategorized) {
          if (a.questionType === 'scale_1_10') {
            const score = a.answer as number;
            const level = score <= 3 ? 'Low' : score <= 6 ? 'Moderate' : 'High';
            prompt += `- ${a.question}: ${score}/10 (${level})\n`;
          } else {
            prompt += `- ${a.question}: ${a.answer}\n`;
          }
        }
      }

      prompt += '\n';
    }

    prompt += `Reference these assessment results naturally when providing coaching. `;
    prompt += `Focus especially on areas with lower scores as potential growth opportunities.`;
  }

  // Add example conversations as few-shot examples
  if (agent.example_conversations?.length) {
    prompt += `\n\n## Example Conversations\n`;
    for (const example of agent.example_conversations) {
      prompt += `User: ${example.user}\nAssistant: ${example.assistant}\n\n`;
    }
  }

  // Voice mode instructions for conversational responses
  if (voiceMode) {
    prompt += `\n\n## IMPORTANT: Voice Conversation Mode\n`;
    prompt += `The user is speaking to you via voice. Your response will be read aloud by text-to-speech.\n\n`;
    prompt += `Adjust your response style for natural spoken conversation:\n`;
    prompt += `- Write in a conversational, flowing manner as if speaking naturally\n`;
    prompt += `- NEVER use markdown formatting (no **, no *, no bullet points, no numbered lists)\n`;
    prompt += `- Instead of bullet points, use phrases like "First...", "Second...", "Another thing is..."\n`;
    prompt += `- Instead of "**bold text**", just emphasize through word choice and phrasing\n`;
    prompt += `- Keep sentences shorter and more digestible for listening\n`;
    prompt += `- Use transitional phrases to connect ideas: "Now,", "Also,", "Here's the thing,"\n`;
    prompt += `- Speak as if having a real conversation, not reading a document\n`;
    prompt += `- It's okay to be slightly more casual and warm in tone\n\n`;
    prompt += `### CRITICAL: Voice Timing and Pauses\n`;
    prompt += `For proper pacing, INSERT pause markers where natural pauses should occur:\n`;
    prompt += `- Use [pause 0.5s] for brief pauses (between phrases, short breaths)\n`;
    prompt += `- Use [pause 1s] for medium pauses (between sentences, letting something sink in)\n`;
    prompt += `- Use [pause 2s] for longer pauses (between sections, before important points)\n`;
    prompt += `- Use [pause 3s] or [pause 4s] for extended pauses (meditations, breathing exercises, counting)\n\n`;
    prompt += `Examples of good pause usage:\n`;
    prompt += `- "Take a deep breath in... [pause 3s] and slowly exhale. [pause 3s] Now let's do that again."\n`;
    prompt += `- "First, let me share something important. [pause 1s] The key to this is..."\n`;
    prompt += `- "One. [pause 1s] Two. [pause 1s] Three. [pause 1s] Four. [pause 1s] Five."\n`;
    prompt += `- "Let that thought settle for a moment. [pause 2s] How does that feel?"\n\n`;
    prompt += `Be generous with pauses - they make spoken content feel natural and give the listener time to process. Use them especially for:\n`;
    prompt += `- Breathing exercises and meditations (longer pauses)\n`;
    prompt += `- After asking reflective questions\n`;
    prompt += `- Before and after key points\n`;
    prompt += `- Between different topics or sections\n`;
  }

  return prompt;
}

/**
 * Generate a streaming response from the LLM
 */
export async function* generateCoachResponse(
  agent: Agent,
  messages: ChatMessage[],
  userContext?: UserContext | null,
  retrievedKnowledge?: RetrievedChunk[] | null,
  assessmentResults?: AssessmentResultForPrompt[] | null,
  voiceMode?: boolean
): AsyncGenerator<string, void, unknown> {
  const systemPrompt = buildSystemPrompt(agent, userContext, retrievedKnowledge, assessmentResults, voiceMode);
  const { provider, model, temperature } = agent.model_config;

  switch (provider) {
    case 'anthropic':
      yield* generateAnthropicResponse(systemPrompt, messages, model, temperature);
      break;
    case 'openai':
      yield* generateOpenAIResponse(systemPrompt, messages, model, temperature);
      break;
    case 'google':
      yield* generateGoogleResponse(systemPrompt, messages, model, temperature);
      break;
    default:
      throw new Error(`Unsupported LLM provider: ${provider}`);
  }
}

// Helper to create an AbortController with a 60-second timeout
function createLLMAbortController(timeoutMs = 60_000): { controller: AbortController; cleanup: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return {
    controller,
    cleanup: () => clearTimeout(timer),
  };
}

async function* generateAnthropicResponse(
  systemPrompt: string,
  messages: ChatMessage[],
  model: string,
  temperature: number
): AsyncGenerator<string, void, unknown> {
  const client = getAnthropicClient();
  const { controller, cleanup } = createLLMAbortController();

  try {
    const stream = await client.messages.stream({
      model,
      max_tokens: 2048,
      temperature,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    }, { signal: controller.signal as any });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        yield event.delta.text;
      }
    }
  } finally {
    cleanup();
  }
}

async function* generateOpenAIResponse(
  systemPrompt: string,
  messages: ChatMessage[],
  model: string,
  temperature: number
): AsyncGenerator<string, void, unknown> {
  const client = getOpenAIClient();
  const { controller, cleanup } = createLLMAbortController();

  try {
    const stream = await client.chat.completions.create({
      model,
      temperature,
      max_tokens: 2048,
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ],
    }, { signal: controller.signal as any });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  } finally {
    cleanup();
  }
}

async function* generateGoogleResponse(
  systemPrompt: string,
  messages: ChatMessage[],
  model: string,
  temperature: number
): AsyncGenerator<string, void, unknown> {
  const client = getGoogleClient();
  const genModel = client.getGenerativeModel({ model });
  const { controller, cleanup } = createLLMAbortController();

  try {
    // Convert messages to Google's format
    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const chat = genModel.startChat({
      history: history as any,
      generationConfig: {
        temperature,
        maxOutputTokens: 2048,
      },
      systemInstruction: systemPrompt,
    });

    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessageStream(lastMessage.content, {
      signal: controller.signal as any,
    });

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        yield text;
      }
    }
  } finally {
    cleanup();
  }
}

/**
 * Generate a non-streaming response (for testing/previewing)
 */
export async function generateCoachResponseSync(
  agent: Agent,
  messages: ChatMessage[],
  userContext?: UserContext | null,
  retrievedKnowledge?: RetrievedChunk[] | null,
  assessmentResults?: AssessmentResultForPrompt[] | null
): Promise<string> {
  let fullResponse = '';
  for await (const chunk of generateCoachResponse(agent, messages, userContext, retrievedKnowledge, assessmentResults)) {
    fullResponse += chunk;
  }
  return fullResponse;
}
