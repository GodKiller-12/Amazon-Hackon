import { type NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { productsQuerySchema } from '@/schemas/products.schema';
import { successResponse, errorResponse } from '@/lib/api-response';
import productsData from '@/data/products.json';

interface ProductRecord {
  id: string;
  name: string;
  price: number;
  category: string;
  tags: string[];
  inStock: boolean;
  deliveryMinutes: number;
  imageUrl: string;
  brand: string;
  unit?: string;
  description?: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const queryObj = Object.fromEntries(searchParams.entries());
    const validated = productsQuerySchema.parse(queryObj);

    let products = productsData as ProductRecord[];

    // Filter by category
    if (validated.category) {
      products = products.filter((p) => p.category === validated.category);
    }

    // Filter by search (name or tags)
    if (validated.search) {
      const term = validated.search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.tags.some((tag) => tag.toLowerCase().includes(term))
      );
    }

    // Filter by stock status
    if (validated.inStock !== undefined) {
      const inStockBool = validated.inStock === 'true';
      products = products.filter((p) => p.inStock === inStockBool);
    }

    const total = products.length;
    const limit = parseInt(validated.limit, 10);
    const offset = parseInt(validated.offset, 10);
    const paginated = products.slice(offset, offset + limit);

    return successResponse({
      products: paginated,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      const details = error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return errorResponse('VALIDATION_ERROR', 'Invalid query parameters', 400, details);
    }

    console.error('[products] Unexpected error:', error);
    return errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
  }
}
