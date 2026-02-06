import { create } from 'zustand';
import * as api from '../services/api';
import type { Conversation, Message } from '../types';

interface ChatState {
  // Data
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];

  // Streaming state
  isStreaming: boolean;
  streamingContent: string;

  // Free trial tracking
  freeTrialRemaining: number | undefined;
  freeTrialLimit: number | undefined;

  // Loading states
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isSending: boolean;

  // Actions
  fetchConversations: () => Promise<void>;
  fetchConversation: (id: string) => Promise<void>;
  sendMessage: (agentId: string, message: string, conversationId?: string, voiceMode?: boolean) => Promise<{ conversationId: string; response: string }>;
  deleteConversation: (id: string) => Promise<void>;
  clearCurrentConversation: () => void;
  startNewConversation: (agentId: string, greeting: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  currentConversation: null,
  messages: [],

  isStreaming: false,
  streamingContent: '',

  freeTrialRemaining: undefined,
  freeTrialLimit: undefined,

  isLoadingConversations: false,
  isLoadingMessages: false,
  isSending: false,

  fetchConversations: async () => {
    set({ isLoadingConversations: true });
    try {
      const { conversations } = await api.getConversations();
      set({ conversations });
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      set({ isLoadingConversations: false });
    }
  },

  fetchConversation: async (id: string) => {
    set({ isLoadingMessages: true });
    try {
      const { conversation, messages } = await api.getConversation(id);
      set({ currentConversation: conversation, messages });
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw error;
    } finally {
      set({ isLoadingMessages: false });
    }
  },

  sendMessage: async (agentId: string, message: string, conversationId?: string, voiceMode?: boolean) => {
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: conversationId || '',
      role: 'user',
      content: message,
      created_at: new Date().toISOString(),
    };

    // Optimistically add user message
    set((state) => ({
      messages: [...state.messages, userMessage],
      isSending: true,
      isStreaming: true,
      streamingContent: '',
    }));

    try {
      const { conversationId: newConvId, fullResponse, freeTrialRemaining, freeTrialLimit } = await api.sendMessage(
        agentId,
        message,
        conversationId,
        (chunk) => {
          set((state) => ({
            streamingContent: state.streamingContent + chunk,
          }));
        },
        voiceMode
      );

      // Add assistant message
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        conversation_id: newConvId,
        role: 'assistant',
        content: fullResponse,
        created_at: new Date().toISOString(),
      };

      set((state) => ({
        messages: [...state.messages, assistantMessage],
        streamingContent: '',
        isStreaming: false,
        isSending: false,
        freeTrialRemaining,
        freeTrialLimit,
      }));

      // Update conversation ID if new
      if (!conversationId) {
        set((state) => ({
          currentConversation: state.currentConversation
            ? { ...state.currentConversation, id: newConvId }
            : null,
        }));
      }

      return { conversationId: newConvId, response: fullResponse };
    } catch (error: any) {
      // Remove optimistic user message on error
      set((state) => ({
        messages: state.messages.filter((m) => m.id !== userMessage.id),
        isStreaming: false,
        isSending: false,
        streamingContent: '',
      }));
      throw error;
    }
  },

  deleteConversation: async (id: string) => {
    try {
      await api.deleteConversation(id);
      set((state) => ({
        conversations: state.conversations.filter((c) => c.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  },

  clearCurrentConversation: () => {
    set({
      currentConversation: null,
      messages: [],
      streamingContent: '',
      isStreaming: false,
      freeTrialRemaining: undefined,
      freeTrialLimit: undefined,
    });
  },

  startNewConversation: (agentId: string, greeting: string) => {
    // Initialize with greeting message
    const greetingMessage: Message = {
      id: 'greeting',
      conversation_id: '',
      role: 'assistant',
      content: greeting,
      created_at: new Date().toISOString(),
    };

    set({
      currentConversation: null,
      messages: [greetingMessage],
      streamingContent: '',
      isStreaming: false,
    });
  },
}));
