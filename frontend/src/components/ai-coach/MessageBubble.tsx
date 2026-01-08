'use client';

import { useState, useEffect } from 'react';
import { ChatMessage } from '@/store/chat-store';
import { User, Bot, Copy, Check, ThumbsUp, ThumbsDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageBubbleProps {
  message: ChatMessage;
  isNew?: boolean;
  onSuggestionClick?: (suggestion: string) => void;
}

// Typing animation hook
function useTypingAnimation(text: string, isEnabled: boolean, speed: number = 15) {
  const [displayedText, setDisplayedText] = useState(isEnabled ? '' : text);
  const [isTyping, setIsTyping] = useState(isEnabled);

  useEffect(() => {
    if (!isEnabled) {
      setDisplayedText(text);
      setIsTyping(false);
      return;
    }

    setDisplayedText('');
    setIsTyping(true);
    let index = 0;

    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, isEnabled, speed]);

  return { displayedText, isTyping };
}

// Extract follow-up suggestions from AI response
function extractSuggestions(content: string): string[] {
  // Look for common patterns or generate contextual suggestions
  const suggestions: string[] = [];
  
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('exercise') || lowerContent.includes('workout')) {
    suggestions.push('Show me the proper form');
    suggestions.push('What are alternatives?');
  }
  if (lowerContent.includes('set') || lowerContent.includes('rep')) {
    suggestions.push('How do I progress this?');
  }
  if (lowerContent.includes('nutrition') || lowerContent.includes('eat') || lowerContent.includes('protein')) {
    suggestions.push('Give me meal ideas');
    suggestions.push('What about supplements?');
  }
  if (lowerContent.includes('muscle') || lowerContent.includes('strength')) {
    suggestions.push('Create a workout plan');
  }
  if (lowerContent.includes('rest') || lowerContent.includes('recovery')) {
    suggestions.push('How much sleep do I need?');
  }
  
  // Default suggestions if none matched
  if (suggestions.length === 0) {
    suggestions.push('Tell me more');
    suggestions.push('Create a workout for this');
  }
  
  return suggestions.slice(0, 3);
}

export default function MessageBubble({ message, isNew = false, onSuggestionClick }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [reaction, setReaction] = useState<'up' | 'down' | null>(null);
  
  // Only animate new assistant messages
  const { displayedText, isTyping } = useTypingAnimation(
    message.content,
    isNew && !isUser
  );
  
  const suggestions = !isUser ? extractSuggestions(message.content) : [];
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div
      className={cn(
        'flex gap-3 mb-4 group',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg">
          <Bot className={cn("h-5 w-5 text-white", isTyping && "animate-pulse")} />
        </div>
      )}
      
      <div className={cn("flex flex-col gap-2", isUser ? "max-w-[75%]" : "max-w-[90%]")}>
        <div
          className={cn(
            'rounded-2xl px-4 py-3 shadow-sm',
            isUser
              ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-br-md'
              : 'bg-card border border-border rounded-bl-md'
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-headings:my-2 prose-table:w-full prose-th:bg-muted prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:border prose-th:border-border prose-td:px-3 prose-td:py-2 prose-td:border prose-td:border-border">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  // Custom paragraph to handle inline cursor
                  p: ({ children }) => (
                    <p>
                      {children}
                      {isTyping && <span className="inline-block w-1.5 h-4 bg-primary animate-pulse ml-0.5 align-middle" />}
                    </p>
                  ),
                }}
              >
                {displayedText}
              </ReactMarkdown>
              {/* Show cursor at end if no paragraphs rendered yet */}
              {isTyping && !displayedText.includes('\n') && displayedText.length < 10 && (
                <span className="inline-block w-1.5 h-4 bg-primary animate-pulse" />
              )}
            </div>
          )}
          
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
            <span className={cn(
              "text-xs",
              isUser ? "text-primary-foreground/70" : "text-muted-foreground"
            )}>
              {new Date(message.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            
            {/* Action buttons for AI messages */}
            {!isUser && !isTyping && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-6 w-6", reaction === 'up' && "text-green-500")}
                  onClick={() => setReaction(reaction === 'up' ? null : 'up')}
                >
                  <ThumbsUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-6 w-6", reaction === 'down' && "text-red-500")}
                  onClick={() => setReaction(reaction === 'down' ? null : 'down')}
                >
                  <ThumbsDown className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {/* Suggested follow-ups */}
        {!isUser && !isTyping && suggestions.length > 0 && onSuggestionClick && (
          <div className="flex flex-wrap gap-2 ml-1">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => onSuggestionClick(suggestion)}
                className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/20"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center shadow-lg">
          <User className="h-5 w-5 text-secondary-foreground" />
        </div>
      )}
    </div>
  );
}
