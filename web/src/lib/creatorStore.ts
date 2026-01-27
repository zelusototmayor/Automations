import { create } from 'zustand';

// Types
export type LLMProvider = 'anthropic' | 'openai' | 'google';
export type CoachingApproach = 'socratic' | 'direct' | 'supportive' | 'adaptive';
export type ResponseStyle = 'concise' | 'balanced' | 'detailed';

export interface PersonalityConfig {
  approach: CoachingApproach;
  tone: number; // 0-100
  responseStyle: ResponseStyle;
  traits: string[];
}

export interface LLMConfig {
  provider: LLMProvider;
  model: string;
  temperature: number;
}

export interface ExampleConversation {
  user: string;
  assistant: string;
}

export interface KnowledgeDocument {
  id: string;
  type: 'notion' | 'file';
  name: string;
  url?: string;
  fileName?: string;
  content?: string;
  characterCount?: number;
  status: 'pending' | 'loading' | 'ready' | 'error';
  error?: string;
}

export interface AgentDraft {
  // Step 1: Identity
  name: string;
  tagline: string;
  description: string;
  avatar: string;
  category: string;
  tags: string[];

  // Step 2: Personality
  personalityConfig: PersonalityConfig;

  // Step 3: Expertise & Boundaries
  expertise: string;
  boundaries: string;
  exampleTopics: string[];

  // Step 4: Knowledge
  knowledgeDocuments: KnowledgeDocument[];

  // Step 5: Model & Advanced
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
  knowledgeDocuments: [],
  modelConfig: {
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
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

  // Supported models
  supportedModels: Record<string, Array<{ id: string; name: string; recommended?: boolean }>>;

  // Actions
  setDraft: (updates: Partial<AgentDraft>) => void;
  resetDraft: () => void;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setSupportedModels: (models: Record<string, Array<{ id: string; name: string; recommended?: boolean }>>) => void;
  setIsSaving: (saving: boolean) => void;
  setIsPublishing: (publishing: boolean) => void;
  setEditingAgentId: (id: string | null) => void;
  generateSystemPrompt: () => string;
}

export const useCreatorStore = create<CreatorState>((set, get) => ({
  draft: { ...DEFAULT_DRAFT },
  editingAgentId: null,
  currentStep: 1,
  totalSteps: 6,
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

  setSupportedModels: (models) => {
    set({ supportedModels: models });
  },

  setIsSaving: (saving) => {
    set({ isSaving: saving });
  },

  setIsPublishing: (publishing) => {
    set({ isPublishing: publishing });
  },

  setEditingAgentId: (id) => {
    set({ editingAgentId: id });
  },

  generateSystemPrompt: () => {
    const { draft } = get();

    let prompt = `You are ${draft.name}, a coaching assistant.`;

    if (draft.tagline) {
      prompt += ` ${draft.tagline}`;
    }

    prompt += '\n\n## Your Role\n';
    prompt += draft.description || 'Help users achieve their goals through thoughtful guidance.';

    // Coaching approach
    prompt += '\n\n## Coaching Approach\n';
    const approaches: Record<CoachingApproach, string> = {
      socratic: 'Use the Socratic method - ask thoughtful questions to help users discover insights themselves.',
      direct: 'Provide clear, direct advice and actionable recommendations.',
      supportive: 'Be empathetic and supportive, focusing on emotional validation and encouragement.',
      adaptive: 'Adapt your approach based on what the user needs.',
    };
    prompt += approaches[draft.personalityConfig.approach];

    // Tone
    const toneDescriptions: Record<string, string> = {
      formal: 'Maintain a professional, formal tone.',
      balanced: 'Strike a balance between professional and friendly.',
      casual: 'Be conversational and casual in your responses.',
    };
    const toneLevel = draft.personalityConfig.tone;
    const toneKey = toneLevel < 33 ? 'formal' : toneLevel < 66 ? 'balanced' : 'casual';
    prompt += ` ${toneDescriptions[toneKey]}`;

    // Response style
    const styleDescriptions: Record<ResponseStyle, string> = {
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

// Constants
export const AVATAR_OPTIONS = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
  'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
  'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
];

export const CATEGORIES = [
  { id: 'productivity', name: 'Productivity & Systems' },
  { id: 'career', name: 'Career & Growth' },
  { id: 'wellness', name: 'Wellness & Mindset' },
  { id: 'creativity', name: 'Creativity & Writing' },
  { id: 'relationships', name: 'Relationships & Communication' },
  { id: 'finance', name: 'Finance & Business' },
  { id: 'learning', name: 'Learning & Education' },
];

export const SUGGESTED_TAGS: Record<string, string[]> = {
  productivity: ['goals', 'habits', 'time-management', 'focus', 'organization', 'planning'],
  career: ['leadership', 'networking', 'interviews', 'promotion', 'skills', 'transition'],
  wellness: ['mindfulness', 'stress', 'sleep', 'energy', 'balance', 'self-care'],
  creativity: ['writing', 'brainstorming', 'art', 'music', 'storytelling', 'innovation'],
  relationships: ['communication', 'conflict', 'boundaries', 'dating', 'family', 'friendship'],
  finance: ['budgeting', 'investing', 'saving', 'debt', 'business', 'freelance'],
  learning: ['study', 'memory', 'languages', 'skills', 'reading', 'courses'],
};

export const APPROACHES = [
  {
    id: 'socratic' as CoachingApproach,
    name: 'Socratic',
    description: 'Ask questions to help users discover insights themselves',
  },
  {
    id: 'direct' as CoachingApproach,
    name: 'Direct',
    description: 'Give clear, actionable advice and recommendations',
  },
  {
    id: 'supportive' as CoachingApproach,
    name: 'Supportive',
    description: 'Focus on empathy, validation, and encouragement',
  },
  {
    id: 'adaptive' as CoachingApproach,
    name: 'Adaptive',
    description: 'Adapt approach based on what the user needs',
  },
];

export const RESPONSE_STYLES = [
  { id: 'concise' as ResponseStyle, name: 'Concise', description: 'Brief and to the point' },
  { id: 'balanced' as ResponseStyle, name: 'Balanced', description: 'Thorough but focused' },
  { id: 'detailed' as ResponseStyle, name: 'Detailed', description: 'Comprehensive explanations' },
];

export const PERSONALITY_TRAITS = [
  'Encouraging', 'Patient', 'Analytical', 'Creative',
  'Practical', 'Challenging', 'Humorous', 'Structured',
  'Intuitive', 'Empathetic', 'Direct', 'Thoughtful',
];

export const PROVIDERS = [
  {
    id: 'anthropic' as LLMProvider,
    name: 'Claude',
    company: 'Anthropic',
    description: 'Great for nuanced, thoughtful conversations',
  },
  {
    id: 'openai' as LLMProvider,
    name: 'GPT-4',
    company: 'OpenAI',
    description: 'Versatile and widely capable',
  },
  {
    id: 'google' as LLMProvider,
    name: 'Gemini',
    company: 'Google',
    description: 'Fast and efficient responses',
  },
];

export const DEFAULT_MODELS: Record<LLMProvider, string> = {
  anthropic: 'claude-3-5-sonnet-20241022',
  openai: 'gpt-4o',
  google: 'gemini-1.5-pro',
};

export const EXPERTISE_TEMPLATES: Record<string, string> = {
  productivity: `I specialize in:
- Goal setting and achievement
- Time management and prioritization
- Building effective habits and routines
- Overcoming procrastination
- Creating systems for productivity`,
  career: `I specialize in:
- Career planning and transitions
- Interview preparation
- Leadership development
- Networking strategies
- Negotiation and communication`,
  wellness: `I specialize in:
- Stress management techniques
- Mindfulness and meditation
- Work-life balance
- Building healthy habits
- Emotional regulation`,
  creativity: `I specialize in:
- Overcoming creative blocks
- Brainstorming techniques
- Writing and storytelling
- Developing creative projects
- Building a creative practice`,
  relationships: `I specialize in:
- Communication skills
- Conflict resolution
- Setting healthy boundaries
- Building meaningful connections
- Navigating relationship challenges`,
  finance: `I specialize in:
- Personal budgeting
- Financial goal setting
- Debt management strategies
- Building wealth habits
- Business and freelance finances`,
  learning: `I specialize in:
- Study techniques and strategies
- Memory and retention methods
- Learning new skills efficiently
- Academic planning
- Self-directed learning`,
};

export const BOUNDARY_TEMPLATES: Record<string, string> = {
  productivity: `- Provide medical or mental health diagnoses
- Give legal or financial advice
- Make decisions for you
- Judge or criticize your past choices`,
  career: `- Make job decisions for you
- Guarantee specific outcomes
- Provide legal employment advice
- Share confidential information`,
  wellness: `- Diagnose mental health conditions
- Replace professional therapy
- Prescribe medications or treatments
- Provide medical advice`,
  creativity: `- Create content on your behalf
- Guarantee creative success
- Judge the worth of your work
- Make artistic decisions for you`,
  relationships: `- Make relationship decisions for you
- Provide couples therapy
- Take sides in conflicts
- Share information with others`,
  finance: `- Provide specific investment advice
- Recommend financial products
- Make financial decisions for you
- Give tax or legal advice`,
  learning: `- Complete assignments for you
- Guarantee academic results
- Replace professional tutoring
- Make educational decisions`,
};
