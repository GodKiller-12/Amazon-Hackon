'use client';

import { Message } from '@/types';
import { CartPreview } from '@/components/shared/CartPreview';

interface AIMessageProps {
  message: Message;
}

export function AIMessage({ message }: AIMessageProps) {
  return (
    <div className="flex justify-start mb-3">
      <div className="flex gap-2 max-w-[85%]">
        {/* AI Avatar */}
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-amazon-orange to-yellow-400 flex items-center justify-center text-sm mt-0.5">
          ✨
        </div>

        <div className="flex flex-col gap-2">
          {/* Message bubble */}
          <div className="bg-white border border-gray-100 px-4 py-2.5 rounded-2xl rounded-bl-md shadow-sm">
            <p className="text-sm leading-relaxed text-gray-800">{message.content}</p>
            <p className="text-[10px] text-gray-400 mt-1">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          {/* Cart Preview with enhanced fields */}
          {message.cartPreview && message.cartPreview.length > 0 && (
            <CartPreview
              items={message.cartPreview}
              cartName={message.cartMeta?.cartName}
              reasoning={message.cartMeta?.reasoning}
              categories={message.cartMeta?.categories}
              estimatedCost={message.cartMeta?.estimatedCost}
              estimatedDelivery={message.cartMeta?.estimatedDelivery}
            />
          )}
        </div>
      </div>
    </div>
  );
}
