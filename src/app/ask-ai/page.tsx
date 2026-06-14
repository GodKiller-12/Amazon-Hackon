'use client';

import { useCallback } from 'react';
import { ChatMessageList } from '@/components/chat/ChatMessageList';
import { ChatInput } from '@/components/chat/ChatInput';
import { SuggestionChips } from '@/components/chat/SuggestionChips';
import { useConversationStore } from '@/stores/conversationStore';
import { useCartStore } from '@/stores/cartStore';
import { generateCart, modifyCart } from '@/services/aiService';
import { trackEvent } from '@/services/analytics';

export default function AskAIPage() {
  const messages = useConversationStore((state) => state.messages);
  const isAITyping = useConversationStore((state) => state.isAITyping);
  const suggestions = useConversationStore((state) => state.suggestions);
  const initialSuggestions = useConversationStore((state) => state.initialSuggestions);
  const addUserMessage = useConversationStore((state) => state.addUserMessage);
  const addAIResponse = useConversationStore((state) => state.addAIResponse);
  const setAITyping = useConversationStore((state) => state.setAITyping);
  const updateSuggestionsFromCart = useConversationStore((state) => state.updateSuggestionsFromCart);

  const cartItems = useCartStore((state) => state.items);
  const setCartFromAI = useCartStore((state) => state.setCartFromAI);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);

  const hasCart = cartItems.length > 0;

  const handleSend = useCallback(
    async (text: string) => {
      // Strip emoji prefix if it came from initial suggestions
      const cleanText = text.replace(/^[^\w\s]+\s*/, '').trim() || text;
      
      addUserMessage(text);
      setAITyping(true);

      try {
        if (!hasCart) {
          // First message: generate cart
          trackEvent('situation_submitted', { situation: cleanText, source: 'ask-ai' });
          const result = await generateCart(cleanText);
          setCartFromAI(result.items, result.situationLabel);
          trackEvent('cart_generated', {
            situationLabel: result.situationLabel,
            itemCount: result.items.length,
            total: result.estimatedCost,
          });
          addAIResponse(result.reply, result.items, {
            cartName: result.cartName,
            reasoning: result.reasoning,
            categories: result.categories,
            estimatedCost: result.estimatedCost,
            estimatedDelivery: result.estimatedDelivery,
          });
          // Update suggestions based on generated cart
          updateSuggestionsFromCart(result.items);
        } else {
          // Subsequent messages: modify cart
          const result = await modifyCart(cartItems, cleanText);

          // Apply diff
          for (const id of result.cartDiff.remove) {
            removeItem(id);
          }
          for (const item of result.cartDiff.add) {
            addItem(item);
          }

          // Get updated cart for preview
          const updatedItems = [
            ...cartItems.filter((i) => !result.cartDiff.remove.includes(i.id)),
            ...result.cartDiff.add,
          ];

          trackEvent('cart_modified', {
            action: cleanText,
            itemsAdded: result.cartDiff.add.length,
            itemsRemoved: result.cartDiff.remove.length,
          });

          addAIResponse(result.reply, updatedItems);
          // Update suggestions based on new cart state
          updateSuggestionsFromCart(updatedItems);
        }
      } catch {
        addAIResponse("Oops, something went wrong. Please try again! 😅");
      } finally {
        setAITyping(false);
      }
    },
    [hasCart, cartItems, addUserMessage, setAITyping, setCartFromAI, addAIResponse, addItem, removeItem, updateSuggestionsFromCart]
  );

  // Show initial suggestions when no cart, show contextual suggestions when cart exists
  const showInitialSuggestions = !hasCart && messages.length === 0 && !isAITyping;
  const showCartSuggestions = hasCart && !isAITyping;

  return (
    <div className="flex flex-col h-[calc(100vh-7.5rem)]">
      <ChatMessageList messages={messages} isAITyping={isAITyping} />
      <SuggestionChips
        suggestions={showInitialSuggestions ? initialSuggestions : suggestions}
        onSelect={handleSend}
        show={showInitialSuggestions || showCartSuggestions}
      />
      <ChatInput onSend={handleSend} disabled={isAITyping} />
    </div>
  );
}
