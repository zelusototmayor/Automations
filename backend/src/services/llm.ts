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
export const SUPPORTED_MODELS: Record<LLMProvider, Array<{ id: string; name: string; recommended?: boolean }>> = {
  anthropic: [
    { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', recommended: true },
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet' },
    { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku (faster)' },
  ],
  openai: [
    { id: 'gpt-4o', name: 'GPT-4o', recommended: true },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini (faster)' },
  ],
  google: [
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', recommended: true },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (faster)' },
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

/**
 * Build the complete system prompt with user context and retrieved knowledge
 */
export function buildSystemPrompt(
  agent: Agent,
  userContext?: UserContext | null,
  retrievedKnowledge?: RetrievedChunk[] | null
): string {
  let prompt = agent.system_prompt;

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

  // Add example conversations as few-shot examples
  if (agent.example_conversations?.length) {
    prompt += `\n\n## Example Conversations\n`;
    for (const example of agent.example_conversations) {
      prompt += `User: ${example.user}\nAssistant: ${example.assistant}\n\n`;
    }
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
  retrievedKnowledge?: RetrievedChunk[] | null
): AsyncGenerator<string, void, unknown> {
  const systemPrompt = buildSystemPrompt(agent, userContext, retrievedKnowledge);
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
  retrievedKnowledge?: RetrievedChunk[] | null
): Promise<string> {
  let fullResponse = '';
  for await (const chunk of generateCoachResponse(agent, messages, userContext, retrievedKnowledge)) {
    fullResponse += chunk;
  }
  return fullResponse;
}
