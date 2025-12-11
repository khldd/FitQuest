'use client';

import { useEffect, useState, useRef } from 'react';
import { useChatStore } from '@/store/chat-store';
import { aiAPI } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import MessageBubble from '@/components/ai-coach/MessageBubble';
import UserContextCard from '@/components/ai-coach/UserContextCard';
import { Send, Loader2, Trash2, Bot, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    loadChatData();
  }, []);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
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
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      toast.success('Chat history cleared');
    } catch (error) {
      console.error('Failed to clear history:', error);
      toast.error('Failed to clear history');
    }
  };
  
  const quickPrompts = [
    'How should I train chest today?',
    'What exercises can I do for lower back pain?',
    'Give me a 30-minute workout plan',
    'How can I improve my squat form?',
    'What should I eat after a workout?',
  ];
  
  const handleQuickPrompt = (prompt: string) => {
    setInputMessage(prompt);
  };
  
  return (
    <div className="max-w-6xl mx-auto p-6 h-[calc(100vh-80px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              AI Workout Coach
              <Sparkles className="h-6 w-6 text-yellow-500" />
            </h1>
            <p className="text-muted-foreground">
              Your personal fitness assistant powered by AI
            </p>
          </div>
        </div>
        
        {messages.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearHistory}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear History
          </Button>
        )}
      </div>
      
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 overflow-hidden">
        {/* Chat Area */}
        <Card className="lg:col-span-3 flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <Bot className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Welcome to your AI Coach!</h3>
                <p className="text-muted-foreground mb-6">
                  Ask me anything about workouts, nutrition, form, or fitness goals.
                </p>
                
                <div className="max-w-md mx-auto space-y-2">
                  <p className="text-sm font-medium mb-2">Quick prompts:</p>
                  {quickPrompts.map((prompt, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-left"
                      onClick={() => handleQuickPrompt(prompt)}
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            
            {isLoading && (
              <div className="flex justify-start gap-3 mb-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <Bot className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="bg-muted rounded-lg px-4 py-3">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input */}
          <form
            onSubmit={handleSendMessage}
            className="border-t p-4 flex gap-2"
          >
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me anything about fitness..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </form>
        </Card>
        
        {/* Sidebar */}
        <div className="space-y-4">
          <UserContextCard />
          
          <Card className="p-4">
            <h3 className="font-semibold mb-3 text-sm">What I can help with:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Workout recommendations</li>
              <li>• Exercise form tips</li>
              <li>• Nutrition advice</li>
              <li>• Injury prevention</li>
              <li>• Motivation & support</li>
              <li>• Progress tracking</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
