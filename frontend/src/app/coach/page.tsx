'use client';

import { useEffect, useState, useRef } from 'react';
import { useChatStore } from '@/store/chat-store';
import { aiAPI } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import MessageBubble from '@/components/ai-coach/MessageBubble';
import UserContextCard from '@/components/ai-coach/UserContextCard';
import { 
  Send, 
  Loader2, 
  Trash2, 
  Bot, 
  Dumbbell, 
  Apple, 
  Heart, 
  Brain,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';

// Categorized quick prompts
const quickPromptCategories = [
  {
    id: 'workouts',
    label: 'Workouts',
    icon: Dumbbell,
    prompts: [
      'Create a 30-minute full body workout',
      'How should I train chest today?',
      'Give me a leg day routine',
      'Best exercises for building muscle',
      'HIIT workout for fat loss',
    ],
  },
  {
    id: 'nutrition',
    label: 'Nutrition',
    icon: Apple,
    prompts: [
      'What should I eat after a workout?',
      'High protein meal ideas',
      'Best pre-workout foods',
      'How much protein do I need daily?',
      'Healthy snacks for muscle building',
    ],
  },
  {
    id: 'form',
    label: 'Form & Technique',
    icon: Heart,
    prompts: [
      'How can I improve my squat form?',
      'Proper deadlift technique',
      'Common bench press mistakes',
      'How to engage my core properly',
      'Tips for better mind-muscle connection',
    ],
  },
  {
    id: 'recovery',
    label: 'Recovery',
    icon: Brain,
    prompts: [
      'How to recover faster between workouts',
      'Best stretches after leg day',
      'How much sleep do I need for gains?',
      'Dealing with muscle soreness',
      'When should I take rest days?',
    ],
  },
];

export default function CoachPage() {
  const {
    messages,
    setMessages,
    addMessage,
    isLoading,
    setIsLoading,
    userContext,
    setUserContext,
    clearMessages,
  } = useChatStore();
  
  const [inputMessage, setInputMessage] = useState('');
  const [isInputExpanded, setIsInputExpanded] = useState(false);
  const [lastMessageId, setLastMessageId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    loadChatData();
  }, []);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, isInputExpanded ? 200 : 100);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [inputMessage, isInputExpanded]);
  
  const loadChatData = async () => {
    try {
      const [historyData, contextData] = await Promise.all([
        aiAPI.getChatHistory(),
        aiAPI.getUserContext(),
      ]);
      
      // Handle paginated response
      const history = Array.isArray(historyData) ? historyData : (historyData?.results || []);
      setMessages(history);
      setUserContext(contextData);
    } catch (error) {
      console.error('Failed to load chat data:', error);
      toast.error('Failed to load chat history');
    }
  };
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;
    
    const messageText = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);
    
    try {
      const response = await aiAPI.sendMessage(messageText);
      
      // Add both user and assistant messages
      if (response.user_message) {
        addMessage(response.user_message);
      }
      if (response.assistant_message) {
        addMessage(response.assistant_message);
        // Track the last message for typing animation
        setLastMessageId(response.assistant_message.id);
      }
      
      if (response.warning) {
        toast.warning(response.warning);
      }
    } catch (error: any) {
      console.error('Failed to send message:', error);
      toast.error(error.response?.data?.error || 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClearHistory = async () => {
    if (!confirm('Are you sure you want to clear all chat history?')) return;
    
    try {
      await aiAPI.clearHistory();
      clearMessages();
      setLastMessageId(null);
      toast.success('Chat history cleared');
    } catch (error) {
      console.error('Failed to clear history:', error);
      toast.error('Failed to clear history');
    }
  };
  
  const handleQuickPrompt = (prompt: string) => {
    setInputMessage(prompt);
    textareaRef.current?.focus();
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    textareaRef.current?.focus();
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto p-4 h-[calc(100vh-80px)] flex flex-col overflow-hidden">
      {/* Compact Header */}
      <div className="flex-shrink-0 flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary via-purple-500 to-pink-500 flex items-center justify-center shadow-md">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-lg font-semibold">AI Coach</h1>
        </div>
        
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearHistory}
            className="text-muted-foreground hover:text-foreground"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
      
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-4 min-h-0">
        {/* Chat Area - Now wider (4/5 columns) */}
        <Card className="lg:col-span-4 flex flex-col min-h-0 border">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
            {messages.length === 0 && !isLoading && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Welcome to your AI Coach!</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm">
                  Ask me anything about workouts, nutrition, form, or fitness goals.
                </p>
                
                {/* Categorized Quick Prompts */}
                <div className="max-w-2xl mx-auto">
                  <Tabs defaultValue="workouts" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 mb-4">
                      {quickPromptCategories.map((category) => (
                        <TabsTrigger 
                          key={category.id} 
                          value={category.id}
                          className="flex items-center gap-1 text-xs sm:text-sm"
                        >
                          <category.icon className="h-4 w-4" />
                          <span className="hidden sm:inline">{category.label}</span>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    
                    {quickPromptCategories.map((category) => (
                      <TabsContent key={category.id} value={category.id} className="mt-0">
                        <div className="grid gap-2">
                          {category.prompts.map((prompt, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              className="w-full justify-start text-left h-auto py-3 px-4 hover:bg-primary/5 hover:border-primary/50 transition-all"
                              onClick={() => handleQuickPrompt(prompt)}
                            >
                              <category.icon className="h-4 w-4 mr-3 text-primary flex-shrink-0" />
                              <span>{prompt}</span>
                            </Button>
                          ))}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>
              </div>
            )}
            
            {messages.map((message) => (
              <MessageBubble 
                key={message.id} 
                message={message}
                isNew={message.id === lastMessageId}
                onSuggestionClick={handleSuggestionClick}
              />
            ))}
            
            {isLoading && (
              <div className="flex justify-start gap-3 mb-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg">
                  <Bot className="h-5 w-5 text-white animate-pulse" />
                </div>
                <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Area */}
          <div className="flex-shrink-0 border-t p-3 bg-muted/30">
            <form onSubmit={handleSendMessage} className="space-y-1">
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about fitness... (Enter to send, Shift+Enter for new line)"
                  disabled={isLoading}
                  className="min-h-[44px] max-h-[200px] pr-20 resize-none rounded-lg border focus:border-primary transition-colors"
                  rows={1}
                />
                <div className="absolute right-2 bottom-1.5 flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setIsInputExpanded(!isInputExpanded)}
                  >
                    {isInputExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronUp className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    type="submit"
                    size="icon"
                    disabled={isLoading || !inputMessage.trim()}
                    className="h-7 w-7 rounded-md"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </Card>
        
        {/* Sidebar - Now 1/5 columns */}
        <div className="space-y-3 hidden lg:block overflow-y-auto">
          <UserContextCard />
          
          {/* Quick Tips */}
          <Card className="p-3 bg-gradient-to-br from-primary/5 to-purple-500/5 border-primary/20">
            <h3 className="font-semibold mb-1 text-xs">💡 Pro Tip</h3>
            <p className="text-xs text-muted-foreground">
              Be specific! Try &quot;30-min upper body workout with dumbbells&quot;.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
