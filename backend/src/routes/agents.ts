import { Router, Request, Response } from 'express';
import { prisma } from '../services/database';
import { authenticate, optionalAuth } from '../middleware/auth';
import { canCreateCoach } from '../services/subscription';
import { SUPPORTED_MODELS } from '../services/llm';
import { LLMProvider } from '../types';
import { Prisma } from '@prisma/client';

const router = Router();

// Agent categories
export const CATEGORIES = [
  { id: 'productivity', name: 'Productivity & Systems', emoji: '' },
  { id: 'career', name: 'Career & Growth', emoji: '' },
  { id: 'wellness', name: 'Wellness & Mindset', emoji: '' },
  { id: 'creativity', name: 'Creativity & Writing', emoji: '' },
  { id: 'relationships', name: 'Relationships & Communication', emoji: '' },
  { id: 'finance', name: 'Finance & Business', emoji: '' },
  { id: 'learning', name: 'Learning & Education', emoji: '' },
];

/**
 * GET /agents - List all published agents
 */
router.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { category, search, limit = '20', offset = '0' } = req.query;

    const where: Prisma.AgentWhereInput = {
      isPublished: true,
    };

    if (category && typeof category === 'string') {
      where.category = category;
    }

    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { tagline: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }

    const agents = await prisma.agent.findMany({
      where,
      select: {
        id: true,
        name: true,
        tagline: true,
        description: true,
        avatarUrl: true,
        category: true,
        tags: true,
        tier: true,
        priceTier: true,
        greetingMessage: true,
        conversationStarters: true,
        usageCount: true,
        ratingAvg: true,
        ratingCount: true,
        creatorId: true,
        createdAt: true,
      },
      orderBy: { usageCount: 'desc' },
      skip: Number(offset),
      take: Number(limit),
    });

    res.json({ agents });
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

/**
 * GET /agents/featured - Get featured agents for home screen
 */
router.get('/featured', async (req: Request, res: Response) => {
  try {
    const agents = await prisma.agent.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        name: true,
        tagline: true,
        avatarUrl: true,
        category: true,
        tags: true,
        tier: true,
        priceTier: true,
        greetingMessage: true,
        usageCount: true,
        ratingAvg: true,
        ratingCount: true,
        creator: {
          select: { name: true },
        },
      },
      orderBy: [
        { ratingAvg: { sort: 'desc', nulls: 'last' } },
        { usageCount: 'desc' },
      ],
      take: 10,
    });

    // Transform to include creator_name at top level
    const transformedAgents = agents.map((agent) => ({
      ...agent,
      creator_name: agent.creator?.name || null,
      creator: undefined,
    }));

    res.json({ agents: transformedAgents });
  } catch (error) {
    console.error('Error fetching featured agents:', error);
    res.status(500).json({ error: 'Failed to fetch featured agents' });
  }
});

/**
 * GET /agents/categories - Get all categories
 */
router.get('/categories', (req: Request, res: Response) => {
  res.json({ categories: CATEGORIES });
});

/**
 * GET /agents/models - Get supported LLM models
 */
router.get('/models', (req: Request, res: Response) => {
  res.json({ models: SUPPORTED_MODELS });
});

/**
 * GET /agents/mine - Get current user's agents
 * NOTE: This route MUST be defined BEFORE /:id to avoid matching 'mine' as an ID
 */
router.get('/mine', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const agents = await prisma.agent.findMany({
      where: { creatorId: userId },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({ agents });
  } catch (error) {
    console.error('Error fetching user agents:', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

/**
 * GET /agents/:id - Get agent details
 */
router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const agent = await prisma.agent.findUnique({
      where: { id },
    });

    if (!agent) {
      res.status(404).json({ error: 'Agent not found' });
      return;
    }

    // Don't expose sensitive data to non-creators
    const isCreator = agent.creatorId === req.userId;

    const responseAgent = {
      ...agent,
      // Only include these for the creator
      systemPrompt: isCreator ? agent.systemPrompt : undefined,
      modelConfig: isCreator ? agent.modelConfig : undefined,
      exampleConversations: isCreator ? agent.exampleConversations : undefined,
    };

    res.json({ agent: responseAgent });
  } catch (error) {
    console.error('Error fetching agent:', error);
    res.status(500).json({ error: 'Failed to fetch agent' });
  }
});

/**
 * POST /agents - Create a new agent
 */
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    // Check if user can create coaches
    const canCreate = await canCreateCoach(userId);
    if (!canCreate) {
      res.status(403).json({
        error: 'Creator subscription required to create coaches',
        code: 'CREATOR_REQUIRED',
      });
      return;
    }

    const {
      name,
      tagline,
      description,
      avatar_url,
      category,
      tags,
      system_prompt,
      greeting_message,
      personality_config,
      model_config,
      example_conversations,
      conversation_starters,
      knowledge_context,
      voice_id,
      price_tier,
    } = req.body;

    // Validate required fields
    if (!name || !category || !system_prompt || !greeting_message || !model_config) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Validate model config
    const { provider, model } = model_config as { provider: LLMProvider; model: string };
    const validModels = SUPPORTED_MODELS[provider]?.map((m: { id: string }) => m.id) || [];
    if (!validModels.includes(model)) {
      res.status(400).json({ error: 'Invalid model selection' });
      return;
    }

    // Validate price tier if provided
    const validPriceTiers = ['TIER_1', 'TIER_2', 'TIER_3'];
    const priceTier = price_tier && validPriceTiers.includes(price_tier) ? price_tier : 'TIER_1';

    const agent = await prisma.agent.create({
      data: {
        creatorId: userId,
        name,
        tagline,
        description,
        avatarUrl: avatar_url,
        category,
        tags: tags || [],
        tier: 'PREMIUM', // All user-created agents are premium
        priceTier,
        systemPrompt: system_prompt,
        greetingMessage: greeting_message,
        personalityConfig: personality_config || {
          approach: 'direct',
          tone: 50,
          responseStyle: 'balanced',
          traits: [],
        },
        modelConfig: model_config,
        exampleConversations: example_conversations || [],
        conversationStarters: conversation_starters || [],
        knowledgeContext: knowledge_context || [],
        voiceId: voice_id || null,
        isPublished: false,
      },
    });

    res.status(201).json({ agent });
  } catch (error) {
    console.error('Error creating agent:', error);
    res.status(500).json({ error: 'Failed to create agent' });
  }
});

/**
 * PATCH /agents/:id - Update an agent
 */
router.patch('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.userId!;

    // Verify ownership
    const existing = await prisma.agent.findUnique({
      where: { id },
      select: { creatorId: true },
    });

    if (!existing || existing.creatorId !== userId) {
      res.status(403).json({ error: 'Not authorized to edit this agent' });
      return;
    }

    // Build update data, excluding fields that shouldn't be updated
    const {
      name,
      tagline,
      description,
      avatar_url,
      category,
      tags,
      system_prompt,
      greeting_message,
      personality_config,
      model_config,
      example_conversations,
      conversation_starters,
      knowledge_context,
      voice_id,
      is_published,
      price_tier,
    } = req.body;

    const updateData: Prisma.AgentUpdateInput = {};

    if (name !== undefined) updateData.name = name;
    if (tagline !== undefined) updateData.tagline = tagline;
    if (description !== undefined) updateData.description = description;
    if (avatar_url !== undefined) updateData.avatarUrl = avatar_url;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = tags;
    if (system_prompt !== undefined) updateData.systemPrompt = system_prompt;
    if (greeting_message !== undefined) updateData.greetingMessage = greeting_message;
    if (personality_config !== undefined) updateData.personalityConfig = personality_config;
    if (model_config !== undefined) updateData.modelConfig = model_config;
    if (example_conversations !== undefined) updateData.exampleConversations = example_conversations;
    if (conversation_starters !== undefined) updateData.conversationStarters = conversation_starters;
    if (knowledge_context !== undefined) updateData.knowledgeContext = knowledge_context;
    if (voice_id !== undefined) updateData.voiceId = voice_id;
    if (is_published !== undefined) updateData.isPublished = is_published;
    if (price_tier !== undefined) {
      const validPriceTiers = ['TIER_1', 'TIER_2', 'TIER_3'];
      if (validPriceTiers.includes(price_tier)) {
        updateData.priceTier = price_tier;
      }
    }

    const agent = await prisma.agent.update({
      where: { id },
      data: updateData,
    });

    res.json({ agent });
  } catch (error) {
    console.error('Error updating agent:', error);
    res.status(500).json({ error: 'Failed to update agent' });
  }
});

/**
 * POST /agents/:id/publish - Publish an agent
 */
router.post('/:id/publish', authenticate, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.userId!;

    // Verify ownership
    const existing = await prisma.agent.findUnique({
      where: { id },
      select: { creatorId: true },
    });

    if (!existing || existing.creatorId !== userId) {
      res.status(403).json({ error: 'Not authorized to publish this agent' });
      return;
    }

    const agent = await prisma.agent.update({
      where: { id },
      data: { isPublished: true },
    });

    res.json({ agent });
  } catch (error) {
    console.error('Error publishing agent:', error);
    res.status(500).json({ error: 'Failed to publish agent' });
  }
});

/**
 * DELETE /agents/:id - Delete an agent
 */
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.userId!;

    // Verify ownership
    const existing = await prisma.agent.findUnique({
      where: { id },
      select: { creatorId: true },
    });

    if (!existing || existing.creatorId !== userId) {
      res.status(403).json({ error: 'Not authorized to delete this agent' });
      return;
    }

    await prisma.agent.delete({ where: { id } });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting agent:', error);
    res.status(500).json({ error: 'Failed to delete agent' });
  }
});

export default router;
