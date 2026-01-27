import { create } from 'zustand';
import * as api from '../services/api';
import type { Agent, Category } from '../types';

interface AgentsState {
  // Data
  featured: Agent[];
  agents: Agent[];
  categories: Category[];
  currentAgent: Agent | null;
  myAgents: Agent[];

  // Loading states
  isLoadingFeatured: boolean;
  isLoadingAgents: boolean;
  isLoadingAgent: boolean;
  isLoadingMyAgents: boolean;

  // Filters
  selectedCategory: string | null;
  searchQuery: string;

  // Actions
  fetchFeatured: () => Promise<void>;
  fetchAgents: (category?: string, search?: string) => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchAgent: (id: string) => Promise<Agent>;
  fetchMyAgents: () => Promise<void>;
  setCategory: (category: string | null) => void;
  setSearch: (query: string) => void;
  clearCurrentAgent: () => void;
}

export const useAgentsStore = create<AgentsState>((set, get) => ({
  featured: [],
  agents: [],
  categories: [],
  currentAgent: null,
  myAgents: [],

  isLoadingFeatured: false,
  isLoadingAgents: false,
  isLoadingAgent: false,
  isLoadingMyAgents: false,

  selectedCategory: null,
  searchQuery: '',

  fetchFeatured: async () => {
    set({ isLoadingFeatured: true });
    try {
      const { agents } = await api.getFeaturedAgents();
      set({ featured: agents });
    } catch (error) {
      console.error('Error fetching featured agents:', error);
    } finally {
      set({ isLoadingFeatured: false });
    }
  },

  fetchAgents: async (category?: string, search?: string) => {
    set({ isLoadingAgents: true });
    try {
      const { agents } = await api.getAgents({
        category: category || undefined,
        search: search || undefined,
      });
      set({ agents });
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      set({ isLoadingAgents: false });
    }
  },

  fetchCategories: async () => {
    try {
      const { categories } = await api.getCategories();
      set({ categories });
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  },

  fetchAgent: async (id: string) => {
    set({ isLoadingAgent: true });
    try {
      const { agent } = await api.getAgent(id);
      set({ currentAgent: agent });
      return agent;
    } catch (error) {
      console.error('Error fetching agent:', error);
      throw error;
    } finally {
      set({ isLoadingAgent: false });
    }
  },

  fetchMyAgents: async () => {
    set({ isLoadingMyAgents: true });
    try {
      const { agents } = await api.getMyAgents();
      set({ myAgents: agents });
    } catch (error) {
      console.error('Error fetching my agents:', error);
    } finally {
      set({ isLoadingMyAgents: false });
    }
  },

  setCategory: (category: string | null) => {
    set({ selectedCategory: category });
    get().fetchAgents(category || undefined, get().searchQuery || undefined);
  },

  setSearch: (query: string) => {
    set({ searchQuery: query });
    get().fetchAgents(get().selectedCategory || undefined, query || undefined);
  },

  clearCurrentAgent: () => {
    set({ currentAgent: null });
  },
}));
