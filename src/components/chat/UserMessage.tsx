'use client';

import { Message } from '@/types';

interface UserMessageProps {
  message: Message;
}

export function UserMessage({ message }: UserMessageProps) {
  return (
    <div className="flex justify-end mb-3">
      <div className="max-w-[80%] bg-amazon-dark text-white px-4 py-2.5 rounded-2xl rounded-br-md shadow-sm">
        <p className="text-sm leading-relaxed">{message.content}</p>
        <p className="text-[10px] text-gray-300 mt-1 text-right">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
