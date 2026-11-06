import type { ProductFilters } from '../types';

export function catalogQuery(filters: ProductFilters = {}) {
  const page = Number.isSafeInteger(filters.page) && filters.page! > 0 ? Math.min(filters.page!, 1_000_000) : 1;
  const limit = Number.isSafeInteger(filters.limit) && filters.limit! > 0 ? Math.min(filters.limit!, 100) : 12;
  for (const value of [filters.minPrice, filters.maxPrice]) {
    if (value !== undefined && (!Number.isFinite(value) || value < 0)) throw new Error('Price filters must be non-negative numbers.');
  }
  if (filters.minPrice !== undefined && filters.maxPrice !== undefined && filters.minPrice > filters.maxPrice) throw new Error('Minimum price cannot exceed maximum price.');
  const sorts: Record<string, { column: string; ascending: boolean }> = {
    '-createdAt': { column: 'created_at', ascending: false }, createdAt: { column: 'created_at', ascending: true },
    price: { column: 'price', ascending: true }, '-price': { column: 'price', ascending: false },
    name: { column: 'name', ascending: true }, '-name': { column: 'name', ascending: false },
  };
  const search = filters.search?.trim() || '';
  if (search.length > 200) throw new Error('Search must be 200 characters or fewer.');
  // Quote the entire filter value so punctuation cannot introduce another filter.
  // Supabase URL-encodes it. LIKE wildcards retain their PostgREST meaning.
  const pattern = JSON.stringify(`%${search}%`);
  return { page, limit, offset: (page - 1) * limit, sort: sorts[filters.sort || ''] ?? sorts['-createdAt'],
    searchExpression: search ? `name.ilike.${pattern},description.ilike.${pattern}` : undefined };
}
