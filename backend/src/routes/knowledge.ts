import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { prisma } from '../services/database';
import {
  addKnowledgeSource,
  removeKnowledgeSource,
  getAgentKnowledgeSources,
  getKnowledgeSourceStatus,
  resyncKnowledgeSource,
} from '../services/knowledgePipeline';
import { getAgentKnowledgeStats } from '../services/retrieval';
import { SourceType } from '@prisma/client';
import { z } from 'zod';

const router = Router();

// ===========================================
// Knowledge Source Management
// ===========================================

// Schema for adding knowledge source
const addKnowledgeSourceSchema = z.object({
  connectionId: z.string().uuid(),
  externalId: z.string().min(1),
  name: z.string().min(1).max(255),
  sourceType: z.enum(['NOTION_PAGE', 'GOOGLE_DOC']),
});

/**
 * POST /knowledge/agents/:agentId/sources
 * Add a knowledge source to an agent
 */
router.post('/agents/:agentId/sources', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const agentId = req.params.agentId as string;

    // Verify agent ownership
    const agent = await prisma.agent.findFirst({
      where: {
        id: agentId,
        creatorId: userId,
      },
    });

    if (!agent) {
      res.status(404).json({ error: 'Agent not found or not authorized' });
      return;
    }

    // Validate request body
    const validation = addKnowledgeSourceSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ error: 'Invalid request', details: validation.error.issues });
      return;
    }

    const { connectionId, externalId, name, sourceType } = validation.data;

    // Verify connection ownership
    const connection = await prisma.integrationConnection.findFirst({
      where: {
        id: connectionId,
        userId,
      },
    });

    if (!connection) {
      res.status(404).json({ error: 'Integration connection not found' });
      return;
    }

    // Check if source already exists
    const existingSource = await prisma.knowledgeSource.findFirst({
      where: {
        agentId,
        externalId,
      },
    });

    if (existingSource) {
      res.status(409).json({ error: 'This document is already added to this agent' });
      return;
    }

    // Check source limits (max 100 per agent)
    const sourceCount = await prisma.knowledgeSource.count({
      where: { agentId },
    });

    if (sourceCount >= 100) {
      res.status(400).json({ error: 'Maximum number of knowledge sources (100) reached for this agent' });
      return;
    }

    // Add and process the knowledge source
    const result = await addKnowledgeSource(
      agentId,
      connectionId,
      externalId,
      name,
      sourceType as SourceType
    );

    if (!result.success) {
      res.status(500).json({
        error: 'Failed to process knowledge source',
        details: result.error,
        sourceId: result.sourceId,
      });
      return;
    }

    res.status(201).json({
      success: true,
      sourceId: result.sourceId,
      message: 'Knowledge source added and processed successfully',
    });
  } catch (error) {
    console.error('Error adding knowledge source:', error);
    res.status(500).json({ error: 'Failed to add knowledge source' });
  }
});

/**
 * GET /knowledge/agents/:agentId/sources
 * List all knowledge sources for an agent
 */
router.get('/agents/:agentId/sources', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const agentId = req.params.agentId as string;

    // Verify agent ownership
    const agent = await prisma.agent.findFirst({
      where: {
        id: agentId,
        creatorId: userId,
      },
    });

    if (!agent) {
      res.status(404).json({ error: 'Agent not found or not authorized' });
      return;
    }

    const sources = await getAgentKnowledgeSources(agentId);

    res.json({
      sources: sources.map((source) => ({
        id: source.id,
        name: source.name,
        externalId: source.externalId,
        sourceType: source.sourceType,
        syncEnabled: source.syncEnabled,
        lastSyncAt: source.lastSyncAt,
        lastSyncStatus: source.lastSyncStatus,
        documentCount: source.documentCount,
        chunkCount: source.chunkCount,
        provider: source.connection.provider,
        connectionStatus: source.connection.status,
        createdAt: source.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching knowledge sources:', error);
    res.status(500).json({ error: 'Failed to fetch knowledge sources' });
  }
});

/**
 * GET /knowledge/agents/:agentId/stats
 * Get knowledge statistics for an agent
 */
router.get('/agents/:agentId/stats', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const agentId = req.params.agentId as string;

    // Verify agent ownership
    const agent = await prisma.agent.findFirst({
      where: {
        id: agentId,
        creatorId: userId,
      },
    });

    if (!agent) {
      res.status(404).json({ error: 'Agent not found or not authorized' });
      return;
    }

    const stats = await getAgentKnowledgeStats(agentId);

    res.json(stats);
  } catch (error) {
    console.error('Error fetching knowledge stats:', error);
    res.status(500).json({ error: 'Failed to fetch knowledge statistics' });
  }
});

/**
 * DELETE /knowledge/agents/:agentId/sources/:sourceId
 * Remove a knowledge source from an agent
 */
router.delete('/agents/:agentId/sources/:sourceId', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const agentId = req.params.agentId as string;
    const sourceId = req.params.sourceId as string;

    // Verify agent ownership
    const agent = await prisma.agent.findFirst({
      where: {
        id: agentId,
        creatorId: userId,
      },
    });

    if (!agent) {
      res.status(404).json({ error: 'Agent not found or not authorized' });
      return;
    }

    const success = await removeKnowledgeSource(sourceId, userId);

    if (!success) {
      res.status(404).json({ error: 'Knowledge source not found' });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error removing knowledge source:', error);
    res.status(500).json({ error: 'Failed to remove knowledge source' });
  }
});

// ===========================================
// Sync Operations
// ===========================================

/**
 * POST /knowledge/sources/:sourceId/sync
 * Trigger a manual sync for a knowledge source
 */
router.post('/sources/:sourceId/sync', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const sourceId = req.params.sourceId as string;

    // Verify ownership through agent
    const source = await prisma.knowledgeSource.findFirst({
      where: { id: sourceId },
      include: {
        agent: {
          select: { creatorId: true },
        },
      },
    });

    if (!source || source.agent.creatorId !== userId) {
      res.status(404).json({ error: 'Knowledge source not found or not authorized' });
      return;
    }

    // Check if already syncing
    if (source.lastSyncStatus === 'PROCESSING') {
      res.status(409).json({ error: 'Sync already in progress' });
      return;
    }

    // Trigger resync
    const result = await resyncKnowledgeSource(sourceId);

    res.json({
      success: result.success,
      documentsProcessed: result.documentsProcessed,
      chunksCreated: result.chunksCreated,
      errors: result.errors,
    });
  } catch (error) {
    console.error('Error syncing knowledge source:', error);
    res.status(500).json({ error: 'Failed to sync knowledge source' });
  }
});

/**
 * GET /knowledge/sources/:sourceId/status
 * Get detailed status of a knowledge source
 */
router.get('/sources/:sourceId/status', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const sourceId = req.params.sourceId as string;

    // Verify ownership through agent
    const source = await prisma.knowledgeSource.findFirst({
      where: { id: sourceId },
      include: {
        agent: {
          select: { creatorId: true },
        },
      },
    });

    if (!source || source.agent.creatorId !== userId) {
      res.status(404).json({ error: 'Knowledge source not found or not authorized' });
      return;
    }

    const status = await getKnowledgeSourceStatus(sourceId);

    res.json(status);
  } catch (error) {
    console.error('Error fetching source status:', error);
    res.status(500).json({ error: 'Failed to fetch source status' });
  }
});

export default router;
