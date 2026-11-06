import type { Product } from '../types';

// Existing flat catalog contract used by reads, carts and product creation.
// Gallery/threshold persistence needs a verified schema; do not send nested UI data.
export function productWritePayload(data: Partial<Product>) {
  const payload: Record<string, unknown> = {};
  for (const field of ['name', 'description', 'category', 'sku'] as const) {
    if (data[field] !== undefined) payload[field] = data[field];
  }
  if (data.price !== undefined) {
    if (!Number.isFinite(data.price) || data.price < 0) throw new Error('Product price must be a non-negative number.');
    payload.price = data.price;
  }
  if (data.compareAtPrice !== undefined) {
    if (!Number.isFinite(data.compareAtPrice) || data.compareAtPrice < 0) throw new Error('Compare price must be a non-negative number.');
    payload.compare_at_price = data.compareAtPrice;
  }
  if (data.images !== undefined) payload.image = data.images[0] ?? null;
  if (data.inventory?.quantity !== undefined) {
    const stock = data.inventory.quantity;
    if (!Number.isSafeInteger(stock) || stock < 0) throw new Error('Stock must be a non-negative whole number.');
    payload.stock = stock;
  }
  if (data.isFeatured !== undefined) payload.featured = data.isFeatured;
  return payload;
}
