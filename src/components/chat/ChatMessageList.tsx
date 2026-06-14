'use client';

import { useEffect, useRef } from 'react';
import { Message } from '@/types';
import { AIMessage } from './AIMessage';
import { UserMessage } from './UserMessage';

interface ChatMessageListProps {
  messages: Message[];
  isAITyping: boolean;
}

export function ChatMessageList({ messages, isAITyping }: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAITyping]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
      {/* Welcome message */}
      {messages.length === 0 && (
        <div className="flex justify-start mb-3">
          <div className="flex gap-2 max-w-[85%]">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-amazon-orange to-yellow-400 flex items-center justify-center text-sm mt-0.5">
              ✨
            </div>
            <div className="bg-white border border-gray-100 px-4 py-2.5 rounded-2xl rounded-bl-md shadow-sm">
              <p className="text-sm leading-relaxed text-gray-800">
                Hi! Tell me your situation and I&apos;ll build your cart instantly. 🚀
              </p>
              <p className="text-xs text-gray-400 mt-1.5">
                Try: &quot;Guests arriving in 30 minutes&quot; or &quot;Movie night with friends&quot;
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.map((msg) =>
        msg.role === 'ai' ? (
          <AIMessage key={msg.id} message={msg} />
        ) : (
          <UserMessage key={msg.id} message={msg} />
        )
      )}

      {/* Typing indicator */}
      {isAITyping && (
        <div className="flex justify-start mb-3">
          <div className="flex gap-2 max-w-[85%]">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-amazon-orange to-yellow-400 flex items-center justify-center text-sm mt-0.5">
              ✨
            </div>
            <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
