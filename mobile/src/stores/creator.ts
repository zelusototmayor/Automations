import { create } from 'zustand';
import * as api from '../services/api';
import type { Agent, LLMConfig, PersonalityConfig, ExampleConversation } from '../types';

// Draft agent being created/edited
export interface AgentDraft {
  // Step 1: Identity
  name: string;
  tagline: string;
  description: string;
  avatar: string; // emoji or URL
  category: string;
  tags: string[];

  // Step 2: Personality
  personalityConfig: PersonalityConfig;

  // Step 3: Expertise & Boundaries
  expertise: string;
  boundaries: string;
  exampleTopics: string[];

  // Step 4: Model & Advanced
  modelConfig: LLMConfig;
  systemPrompt: string;
  greetingMessage: string;
  conversationStarters: string[];
  exampleConversations: ExampleConversation[];

  // Meta
  isPublished?: boolean;
}

const DEFAULT_DRAFT: AgentDraft = {
  name: '',
  tagline: '',
  description: '',
  avatar: 'A',
  category: '',
  tags: [],
  personalityConfig: {
    approach: 'direct',
    tone: 50,
    responseStyle: 'balanced',
    traits: [],
  },
  expertise: '',
  boundaries: '',
  exampleTopics: [],
  modelConfig: {
    provider: 'anthropic',
    model: 'claude-sonnet-4-20250514',
    temperature: 0.7,
  },
  systemPrompt: '',
  greetingMessage: '',
  conversationStarters: [],
  exampleConversations: [],
};

interface CreatorState {
  // Current draft
  draft: AgentDraft;
  editingAgentId: string | null;

  // Wizard state
  currentStep: number;
  totalSteps: number;

  // Loading states
  isSaving: boolean;
  isPublishing: boolean;
  isLoading: boolean;

  // Supported models (fetched from API)
  supportedModels: Record<string, Array<{ id: string; name: string; recommended?: boolean }>>;

  // Actions
  setDraft: (updates: Partial<AgentDraft>) => void;
  resetDraft: () => void;
  loadAgentForEditing: (agentId: string) => Promise<void>;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  saveDraft: () => Promise<string>;
  publishAgent: () => Promise<void>;
  fetchSupportedModels: () => Promise<void>;
  generateSystemPrompt: () => string;
}

export const useCreatorStore = create<CreatorState>((set, get) => ({
  draft: { ...DEFAULT_DRAFT },
  editingAgentId: null,
  currentStep: 1,
  totalSteps: 5,
  isSaving: false,
  isPublishing: false,
  isLoading: false,
  supportedModels: {},

  setDraft: (updates) => {
    set((state) => ({
      draft: { ...state.draft, ...updates },
    }));
  },

  resetDraft: () => {
    set({
      draft: { ...DEFAULT_DRAFT },
      editingAgentId: null,
      currentStep: 1,
    });
  },

  loadAgentForEditing: async (agentId: string) => {
    set({ isLoading: true });
    try {
      const { agent } = await api.getAgent(agentId);

      // Convert agent to draft format
      const draft: AgentDraft = {
        name: agent.name,
        tagline: agent.tagline || '',
        description: agent.description || '',
        avatar: agent.avatar_url || 'A',
        category: agent.category,
        tags: agent.tags,
        personalityConfig: agent.personality_config || DEFAULT_DRAFT.personalityConfig,
        expertise: '', // Will be derived from system prompt
        boundaries: '',
        exampleTopics: [],
        modelConfig: agent.model_config || DEFAULT_DRAFT.modelConfig,
        systemPrompt: agent.system_prompt || '',
        greetingMessage: agent.greeting_message,
        conversationStarters: agent.conversation_starters || [],
        exampleConversations: agent.example_conversations || [],
        isPublished: agent.is_published,
      };

      set({
        draft,
        editingAgentId: agentId,
        currentStep: 1,
      });
    } catch (error) {
      console.error('Error loading agent for editing:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  setStep: (step) => {
    const { totalSteps } = get();
    if (step >= 1 && step <= totalSteps) {
      set({ currentStep: step });
    }
  },

  nextStep: () => {
    const { currentStep, totalSteps } = get();
    if (currentStep < totalSteps) {
      set({ currentStep: currentStep + 1 });
    }
  },

  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 1) {
      set({ currentStep: currentStep - 1 });
    }
  },

  saveDraft: async () => {
    const { draft, editingAgentId, generateSystemPrompt } = get();
    set({ isSaving: true });

    try {
      // Generate system prompt if not manually edited
      const systemPrompt = draft.systemPrompt || generateSystemPrompt();

      const agentData = {
        name: draft.name,
        tagline: draft.tagline,
        description: draft.description,
        avatar_url: draft.avatar,
        category: draft.category,
        tags: draft.tags,
        personality_config: draft.personalityConfig,
        model_config: draft.modelConfig,
        system_prompt: systemPrompt,
        greeting_message: draft.greetingMessage,
        conversation_starters: draft.conversationStarters.filter(Boolean),
        example_conversations: draft.exampleConversations.filter(
          (e) => e.user && e.assistant
        ),
      };

      let result;
      if (editingAgentId) {
        result = await api.updateAgent(editingAgentId, agentData);
      } else {
        result = await api.createAgent(agentData);
        set({ editingAgentId: result.agent.id });
      }

      return result.agent.id;
    } finally {
      set({ isSaving: false });
    }
  },

  publishAgent: async () => {
    const { editingAgentId, saveDraft } = get();
    set({ isPublishing: true });

    try {
      // Save first
      const agentId = await saveDraft();

      // Then publish
      await api.publishAgent(agentId);

      set((state) => ({
        draft: { ...state.draft, isPublished: true },
      }));
    } finally {
      set({ isPublishing: false });
    }
  },

  fetchSupportedModels: async () => {
    try {
      const { models } = await api.getSupportedModels();
      set({ supportedModels: models });
    } catch (error) {
      console.error('Error fetching supported models:', error);
    }
  },

  generateSystemPrompt: () => {
    const { draft } = get();

    // Generate system prompt from structured inputs
    let prompt = `You are ${draft.name}, a coaching assistant.`;

    if (draft.tagline) {
      prompt += ` ${draft.tagline}`;
    }

    prompt += '\n\n## Your Role\n';
    prompt += draft.description || 'Help users achieve their goals through thoughtful guidance.';

    // Coaching approach
    prompt += '\n\n## Coaching Approach\n';
    const approaches = {
      socratic: 'Use the Socratic method - ask thoughtful questions to help users discover insights themselves.',
      direct: 'Provide clear, direct advice and actionable recommendations.',
      supportive: 'Be empathetic and supportive, focusing on emotional validation and encouragement.',
      custom: 'Adapt your approach based on what the user needs.',
    };
    prompt += approaches[draft.personalityConfig.approach];

    // Tone
    const toneDescriptions = {
      formal: 'Maintain a professional, formal tone.',
      balanced: 'Strike a balance between professional and friendly.',
      casual: 'Be conversational and casual in your responses.',
    };
    const toneLevel = draft.personalityConfig.tone;
    const toneKey = toneLevel < 33 ? 'formal' : toneLevel < 66 ? 'balanced' : 'casual';
    prompt += ` ${toneDescriptions[toneKey]}`;

    // Response style
    const styleDescriptions = {
      concise: 'Keep responses brief and to the point.',
      balanced: 'Provide thorough but focused responses.',
      detailed: 'Give comprehensive, detailed explanations.',
    };
    prompt += ` ${styleDescriptions[draft.personalityConfig.responseStyle]}`;

    // Traits
    if (draft.personalityConfig.traits.length > 0) {
      prompt += `\n\nKey personality traits: ${draft.personalityConfig.traits.join(', ')}.`;
    }

    // Expertise
    if (draft.expertise) {
      prompt += '\n\n## Areas of Expertise\n';
      prompt += draft.expertise;
    }

    // Boundaries
    if (draft.boundaries) {
      prompt += '\n\n## Boundaries\n';
      prompt += 'You should NOT:\n';
      prompt += draft.boundaries;
    }

    // Example topics
    if (draft.exampleTopics.length > 0) {
      prompt += '\n\n## Example Topics You Can Help With\n';
      prompt += draft.exampleTopics.map((t) => `- ${t}`).join('\n');
    }

    // Guidelines
    prompt += '\n\n## Guidelines\n';
    prompt += '- Always be respectful and supportive\n';
    prompt += '- Ask clarifying questions when needed\n';
    prompt += '- Provide actionable advice when appropriate\n';
    prompt += '- Acknowledge when something is outside your expertise';

    return prompt;
  },
}));
