import type { Cart, CartItem } from '../types';

export interface CartLine extends Omit<CartItem, 'productId'> { productId: string }
export interface CatalogPrice { id: string; name: string; price: number; image?: string | null; stock?: number }
const record = (value: unknown): Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
export function quantity(value: unknown): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 1 || value > 9999) {
    throw new Error('Quantity must be a whole number between 1 and 9,999.');
  }
  return value;
}
export function toMinorUnits(value: number): number {
  const minor = Math.round(value * 100);
  if (!Number.isFinite(value) || value < 0 || !Number.isSafeInteger(minor)) throw new Error('A product price is unavailable. Please retry.');
  return minor;
}
export const lineKey = (item: { productId: string; variantId?: string }) => JSON.stringify([item.productId, item.variantId ?? null]);

// Stored names/prices are snapshots, never the source for a new cart estimate.
export function readCartLines(value: unknown): CartLine[] {
  if (value == null) return [];
  if (!Array.isArray(value)) throw new Error('The saved cart could not be read. Please contact support.');
  const merged = new Map<string, CartLine>();
  for (const raw of value) {
    const item = record(raw);
    const productId = typeof item.productId === 'string' ? item.productId : record(item.productId)._id;
    if (typeof productId !== 'string' || !productId) throw new Error('A saved cart item has no product ID.');
    const variantId = typeof item.variantId === 'string' && item.variantId ? item.variantId : undefined;
    const line = { productId, variantId, quantity: quantity(item.quantity), name: '', image: '', price: 0 };
    const key = lineKey(line);
    const previous = merged.get(key);
    merged.set(key, { ...line, quantity: quantity(line.quantity + (previous?.quantity ?? 0)) });
  }
  return [...merged.values()];
}

export function priceCartLines(lines: CartLine[], catalog: CatalogPrice[]) {
  const products = new Map(catalog.map(product => [product.id, product]));
  const items: CartLine[] = [];
  const notices: string[] = [];
  let stockAvailable = true;
  for (const line of lines) {
    const product = products.get(line.productId);
    if (!product) { notices.push('An unavailable product was removed from this cart estimate.'); continue; }
    // The current catalog has no verified variant-pricing contract.
    if (line.variantId) throw new Error('This cart contains a product variant that needs store support before checkout.');
    toMinorUnits(product.price);
    if (product.stock !== undefined && (!Number.isFinite(product.stock) || product.stock < line.quantity)) {
      stockAvailable = false;
      notices.push(`${product.name} does not have enough stock. Reduce the quantity or remove it before checkout.`);
    }
    items.push({ ...line, name: product.name, image: product.image || '', price: toMinorUnits(product.price) / 100 });
  }
  return { items, notices, canCheckout: items.length > 0 && stockAvailable };
}

// Display estimates only. Retain the existing checkout assumptions, not a verified
// tax/shipping policy: 7.5% of subtotal, ₦2,500 delivery, free above ₦10,000.
// A future trusted backend must independently price and settle every payment.
export function calculateCartTotals(items: Pick<CartItem, 'price' | 'quantity'>[], discountAmount = 0) {
  const subtotalMinor = items.reduce((sum, item) => sum + toMinorUnits(item.price) * quantity(item.quantity), 0);
  if (!Number.isSafeInteger(subtotalMinor)) throw new Error('Cart amount is too large.');
  const discountMinor = items.length ? Math.min(toMinorUnits(discountAmount), subtotalMinor) : 0;
  const taxMinor = Math.round(subtotalMinor * 75 / 1000);
  const shippingMinor = !items.length || subtotalMinor > 1_000_000 ? 0 : 250_000;
  const totalMinor = subtotalMinor + taxMinor + shippingMinor - discountMinor;
  if (!Number.isSafeInteger(totalMinor)) throw new Error('Cart amount is too large.');
  return { subtotal: subtotalMinor / 100, tax: taxMinor / 100, shipping: shippingMinor / 100,
    discount: discountMinor / 100, total: totalMinor / 100 };
}

export interface ResolvedCart extends Cart { userId: string; items: CartLine[]; notices: string[]; canCheckout: boolean }
export function resolveCart(row: Record<string, unknown>, userId: string, priced: ReturnType<typeof priceCartLines>): ResolvedCart {
  const coupon = typeof row.coupon === 'string' ? row.coupon : undefined;
  const rawDiscount = coupon ? row.discount_amount ?? 0 : 0;
  const discount = Number(rawDiscount);
  if (!Number.isFinite(discount) || discount < 0) throw new Error('The cart discount could not be read. Please retry.');
  return { id: typeof row.id === 'string' ? row.id : '', userId, ...priced, coupon, couponCode: coupon,
    ...calculateCartTotals(priced.items, discount) };
}
