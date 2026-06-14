import { CartItem } from '@/types';
import { AIProvider, GenerateCartResult, ModifyCartResult } from './types';
import { MockProvider } from './mockProvider';
import { BedrockProvider } from './bedrockProvider';

export type { AIProvider, GenerateCartResult, ModifyCartResult, CartDiff } from './types';

/**
 * Factory function that returns the configured AI provider.
 * Reads NEXT_PUBLIC_AI_PROVIDER env var:
 * - "bedrock" → BedrockProvider (requires AWS credentials)
 * - "mock" or undefined → MockProvider (default)
 *
 * Falls back to MockProvider if BedrockProvider initialization fails.
 */
export function getAIProvider(): AIProvider {
  const providerName = process.env.NEXT_PUBLIC_AI_PROVIDER || 'mock';

  if (providerName === 'bedrock') {
    try {
      const provider = new BedrockProvider();
      console.log('[AI Provider] Using Bedrock');
      return new ResilientProvider(provider);
    } catch (error) {
      console.warn(
        '[AI Provider] Failed to initialize Bedrock provider, falling back to mock:',
        error instanceof Error ? error.message : error
      );
      return new MockProvider();
    }
  }

  return new MockProvider();
}

/**
 * Wraps a primary provider with automatic fallback to MockProvider on runtime errors.
 * This ensures the app remains functional even if Bedrock calls fail.
 */
class ResilientProvider implements AIProvider {
  private primary: AIProvider;
  private fallback: MockProvider;

  constructor(primary: AIProvider) {
    this.primary = primary;
    this.fallback = new MockProvider();
  }

  async generateCart(
    situation: string,
    preferences?: { dietary: string[]; householdSize: number }
  ): Promise<GenerateCartResult> {
    try {
      return await this.primary.generateCart(situation, preferences);
    } catch (error) {
      console.error(
        '[AI Provider] Bedrock generateCart failed, falling back to mock:',
        error instanceof Error ? error.message : error
      );
      console.log('[AI Provider] Falling back to mock');
      return this.fallback.generateCart(situation);
    }
  }

  async modifyCart(currentCart: CartItem[], message: string): Promise<ModifyCartResult> {
    try {
      return await this.primary.modifyCart(currentCart, message);
    } catch (error) {
      console.error(
        '[AI Provider] Bedrock modifyCart failed, falling back to mock:',
        error instanceof Error ? error.message : error
      );
      console.log('[AI Provider] Falling back to mock');
      return this.fallback.modifyCart(currentCart, message);
    }
  }
}
