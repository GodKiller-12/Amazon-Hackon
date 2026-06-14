/**
 * Amazon Bedrock AI Provider — Production Implementation
 *
 * Uses Claude 3 Sonnet via Amazon Bedrock for AI-powered cart generation.
 * Includes retry logic with exponential backoff and robust JSON parsing.
 */

import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import { CartItem, Product } from '@/types';
import { AIProvider, GenerateCartResult, ModifyCartResult } from './types';
import { GENERATE_CART_SYSTEM_PROMPT, MODIFY_CART_SYSTEM_PROMPT } from './prompts';
import productsData from '@/data/products.json';

const products = productsData as unknown as Product[];

const DEFAULT_MODEL_ID = 'anthropic.claude-3-sonnet-20240229-v1:0';
const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 1000;

/** Errors that are safe to retry */
const RETRYABLE_ERRORS = [
  'ThrottlingException',
  'TooManyRequestsException',
  'ServiceUnavailableException',
];

/** Errors that should NOT be retried */
const NON_RETRYABLE_ERRORS = [
  'ValidationException',
  'AccessDeniedException',
  'ModelNotReadyException',
];

/** Valid product IDs from the catalog for validation */
const VALID_PRODUCT_IDS = new Set(products.map((p) => p.id));

/** Product lookup map for enriching Bedrock responses */
const PRODUCT_MAP = new Map(products.map((p) => [p.id, p]));

/**
 * Build a condensed catalog string for inclusion in prompts.
 * Only includes id, name, price, category, and tags to conserve tokens.
 */
function getCondensedCatalog(): string {
  const condensed = products
    .filter((p) => p.inStock)
    .map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      category: p.category,
      tags: p.tags,
    }));
  return JSON.stringify(condensed);
}

/** Singleton Bedrock client instance */
let clientInstance: BedrockRuntimeClient | null = null;

function getClient(): BedrockRuntimeClient {
  if (!clientInstance) {
    const region = process.env.AWS_REGION;
    if (!region) {
      throw new Error(
        '[BedrockProvider] Missing environment variable: AWS_REGION. ' +
        'Please set AWS_REGION in your .env.local file.'
      );
    }

    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    if (!accessKeyId || !secretAccessKey) {
      throw new Error(
        '[BedrockProvider] Missing AWS credentials. ' +
        'Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in your .env.local file.'
      );
    }

    clientInstance = new BedrockRuntimeClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }
  return clientInstance;
}

function getModelId(): string {
  return process.env.BEDROCK_MODEL_ID || DEFAULT_MODEL_ID;
}

/**
 * Determines if an error is retryable based on its error code.
 */
function isRetryableError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'name' in error) {
    const errorName = (error as { name: string }).name;
    if (NON_RETRYABLE_ERRORS.includes(errorName)) return false;
    if (RETRYABLE_ERRORS.includes(errorName)) return true;
  }
  return false;
}

/**
 * Sleep for a specified number of milliseconds.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Invoke Bedrock with retry logic and exponential backoff.
 */
async function invokeWithRetry(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const client = getClient();
  const modelId = getModelId();

  const payload = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  };

  const command = new InvokeModelCommand({
    modelId,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(payload),
  });

  let lastError: unknown = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await client.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      const content = responseBody.content?.[0]?.text;

      if (!content) {
        throw new Error('[BedrockProvider] Empty response from Bedrock model');
      }

      return content;
    } catch (error: unknown) {
      lastError = error;

      if (!isRetryableError(error)) {
        console.error('[BedrockProvider] Non-retryable error:', error);
        throw error;
      }

      const backoffMs = BASE_BACKOFF_MS * Math.pow(2, attempt);
      console.warn(
        `[BedrockProvider] Retryable error on attempt ${attempt + 1}/${MAX_RETRIES}. ` +
        `Retrying in ${backoffMs}ms...`,
        error instanceof Error ? error.message : error
      );

      if (attempt < MAX_RETRIES - 1) {
        await sleep(backoffMs);
      }
    }
  }

  throw lastError || new Error('[BedrockProvider] All retry attempts exhausted');
}

/**
 * Attempts to parse JSON from a response string using multiple strategies:
 * 1. Direct parse of the full string
 * 2. Regex extraction of JSON object
 * 3. Extraction from ```json code blocks
 */
function parseJsonResponse<T>(response: string): T {
  // Strategy 1: Direct parse
  try {
    return JSON.parse(response) as T;
  } catch {
    // Continue to next strategy
  }

  // Strategy 2: Regex extraction of JSON object
  const jsonObjectMatch = response.match(/\{[\s\S]*\}/);
  if (jsonObjectMatch) {
    try {
      return JSON.parse(jsonObjectMatch[0]) as T;
    } catch {
      // Continue to next strategy
    }
  }

  // Strategy 3: Extract from ```json code blocks
  const codeBlockMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch && codeBlockMatch[1]) {
    try {
      return JSON.parse(codeBlockMatch[1]) as T;
    } catch {
      // All strategies failed
    }
  }

  throw new Error(
    '[BedrockProvider] Failed to parse JSON from Bedrock response. ' +
    `Response starts with: "${response.substring(0, 100)}..."`
  );
}

/**
 * Validates and enriches a generate-cart response.
 * Filters out invalid product IDs and ensures required fields exist.
 */
function validateGenerateCartResponse(parsed: Record<string, unknown>): GenerateCartResult {
  if (!parsed.items || !Array.isArray(parsed.items)) {
    throw new Error('[BedrockProvider] Response missing required field: items');
  }
  if (!parsed.reply || typeof parsed.reply !== 'string') {
    throw new Error('[BedrockProvider] Response missing required field: reply');
  }

  // Filter items to only those with valid product IDs from our catalog
  const validItems: CartItem[] = [];
  for (const item of parsed.items as Record<string, unknown>[]) {
    const id = item.id as string;
    if (!id || !VALID_PRODUCT_IDS.has(id)) {
      console.warn(`[BedrockProvider] Skipping invalid product ID: ${id}`);
      continue;
    }

    // Enrich with catalog data to ensure accuracy
    const catalogProduct = PRODUCT_MAP.get(id)!;
    validItems.push({
      id: catalogProduct.id,
      name: catalogProduct.name,
      price: catalogProduct.price,
      category: catalogProduct.category,
      tags: catalogProduct.tags,
      inStock: catalogProduct.inStock,
      deliveryMinutes: catalogProduct.deliveryMinutes,
      imageUrl: catalogProduct.imageUrl,
      brand: catalogProduct.brand,
      description: catalogProduct.description,
      quantity: Math.min(Math.max(Number(item.quantity) || 1, 1), 3),
      reason: (item.reason as string) || 'Recommended for your situation',
    });
  }

  if (validItems.length === 0) {
    throw new Error('[BedrockProvider] No valid items in Bedrock response');
  }

  const estimatedCost = validItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const estimatedDelivery = Math.max(...validItems.map((i) => i.deliveryMinutes));

  return {
    items: validItems,
    situationLabel: (parsed.situationLabel as string) || 'Smart Cart',
    reply: parsed.reply as string,
    cartName: (parsed.cartName as string) || '🛒 Smart Cart',
    reasoning: (parsed.reasoning as string) || 'Curated based on your situation',
    categories: Array.isArray(parsed.categories)
      ? (parsed.categories as string[]).slice(0, 4)
      : ['Essentials'],
    estimatedCost,
    estimatedDelivery,
  };
}

/**
 * Validates and enriches a modify-cart response.
 * Filters out invalid product IDs from additions.
 */
function validateModifyCartResponse(parsed: Record<string, unknown>): ModifyCartResult {
  if (!parsed.reply || typeof parsed.reply !== 'string') {
    throw new Error('[BedrockProvider] Response missing required field: reply');
  }

  const cartDiff = parsed.cartDiff as Record<string, unknown> | undefined;
  if (!cartDiff) {
    throw new Error('[BedrockProvider] Response missing required field: cartDiff');
  }

  // Validate additions — only keep items with valid catalog IDs
  const addItems: CartItem[] = [];
  if (Array.isArray(cartDiff.add)) {
    for (const item of cartDiff.add as Record<string, unknown>[]) {
      const id = item.id as string;
      if (!id || !VALID_PRODUCT_IDS.has(id)) {
        console.warn(`[BedrockProvider] Skipping invalid product ID in add: ${id}`);
        continue;
      }

      const catalogProduct = PRODUCT_MAP.get(id)!;
      addItems.push({
        id: catalogProduct.id,
        name: catalogProduct.name,
        price: catalogProduct.price,
        category: catalogProduct.category,
        tags: catalogProduct.tags,
        inStock: catalogProduct.inStock,
        deliveryMinutes: catalogProduct.deliveryMinutes,
        imageUrl: catalogProduct.imageUrl,
        brand: catalogProduct.brand,
        description: catalogProduct.description,
        quantity: Math.min(Math.max(Number(item.quantity) || 1, 1), 3),
        reason: (item.reason as string) || 'Added based on your request',
      });
    }
  }

  // Validate removals — keep only string IDs
  const removeIds: string[] = [];
  if (Array.isArray(cartDiff.remove)) {
    for (const id of cartDiff.remove) {
      if (typeof id === 'string') {
        removeIds.push(id);
      }
    }
  }

  // Validate updates
  const updates: { id: string; qty: number }[] = [];
  if (Array.isArray(cartDiff.update)) {
    for (const upd of cartDiff.update as Record<string, unknown>[]) {
      if (typeof upd.id === 'string' && typeof upd.qty === 'number') {
        updates.push({ id: upd.id, qty: Math.min(Math.max(upd.qty, 1), 10) });
      }
    }
  }

  return {
    reply: parsed.reply as string,
    cartDiff: {
      add: addItems,
      remove: removeIds,
      update: updates,
    },
  };
}

export class BedrockProvider implements AIProvider {
  constructor() {
    // Validate credentials are available at construction time
    getClient();
  }

  async generateCart(
    situation: string,
    preferences?: { dietary: string[]; householdSize: number }
  ): Promise<GenerateCartResult> {
    const catalog = getCondensedCatalog();

    let userMessage = `## Available Product Catalog:\n${catalog}\n\n## User Situation:\n"${situation}"`;

    if (preferences) {
      userMessage += `\n\n## User Preferences:\n- Dietary restrictions: ${preferences.dietary.join(', ') || 'None'}\n- Household size: ${preferences.householdSize}`;
    }

    const responseText = await invokeWithRetry(GENERATE_CART_SYSTEM_PROMPT, userMessage);
    const parsed = parseJsonResponse<Record<string, unknown>>(responseText);
    return validateGenerateCartResponse(parsed);
  }

  async modifyCart(currentCart: CartItem[], message: string): Promise<ModifyCartResult> {
    // Include current cart items and a subset of available products for additions
    const cartSummary = currentCart
      .map((item) => `- ${item.name} (₹${item.price} × ${item.quantity}, id: ${item.id}, category: ${item.category})`)
      .join('\n');

    // Include condensed catalog for potential additions
    const catalog = getCondensedCatalog();

    const userMessage = `## Current Cart:\n${cartSummary}\n\n## Available Products for Additions:\n${catalog}\n\n## User Request:\n"${message}"`;

    const responseText = await invokeWithRetry(MODIFY_CART_SYSTEM_PROMPT, userMessage);
    const parsed = parseJsonResponse<Record<string, unknown>>(responseText);
    return validateModifyCartResponse(parsed);
  }
}
