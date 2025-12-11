import { create } from 'zustand';

export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  metadata?: any;
}

export interface UserContext {
  username: string;
  fitness_goal: string;
  level: number;
  total_points: number;
  current_streak: number;
  total_workouts: number;
  recent_workouts: any[];
  favorite_muscle_groups: string[];
  recent_achievements: any[];
  nutrition_goal?: any;
}

interface ChatStore {
  messages: ChatMessage[];
  isLoading: boolean;
  userContext: UserContext | null;
  
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  setIsLoading: (loading: boolean) => void;
  setUserContext: (context: UserContext | null) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isLoading: false,
  userContext: null,
  
  setMessages: (messages) => set({ messages }),
  
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  setUserContext: (context) => set({ userContext: context }),
  
  clearMessages: () => set({ messages: [] }),
}));
