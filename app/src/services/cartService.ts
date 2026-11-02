import { supabase, getAuthUser } from '../lib/supabase';
import { lineKey, priceCartLines, quantity, readCartLines, resolveCart } from '../lib/cartCalculations';
import type { CartLine, CatalogPrice, ResolvedCart } from '../lib/cartCalculations';

export interface CartRequest { userId: string; isCurrent: () => boolean }
export interface AddCartItem { name: string; price: number; image: string; quantity: number }
type CartRow = Record<string, unknown>;

async function assertAccount(context: CartRequest) {
  if (!context.isCurrent()) throw new Error('Your account changed. Please retry.');
  const user = await getAuthUser();
  if (!context.isCurrent() || !user || user.id !== context.userId) throw new Error('Your account changed. Please sign in again.');
}
function checkOwner(row: CartRow | null, context: CartRequest) {
  if (!context.isCurrent() || row && row.user_id !== context.userId) throw new Error('This cart is not available for your account.');
}
async function readRow(context: CartRequest): Promise<CartRow> {
  await assertAccount(context);
  const { data, error } = await supabase.from('carts').select('*').eq('user_id', context.userId).maybeSingle();
  if (error) throw new Error('Could not load your cart. Please retry.');
  checkOwner(data, context);
  return data ?? { user_id: context.userId, items: [] };
}
async function price(row: CartRow, context: CartRequest): Promise<ResolvedCart> {
  const lines = readCartLines(row.items);
  let catalog: CatalogPrice[] = [];
  if (lines.length) {
    const { data, error } = await supabase.from('products').select('id,name,price,image,stock').in('id', [...new Set(lines.map(item => item.productId))]);
    if (error) throw new Error('Could not refresh cart prices. Please retry.');
    catalog = data ?? [];
  }
  await assertAccount(context);
  return resolveCart(row, context.userId, priceCartLines(lines, catalog));
}
async function changeCart(context: CartRequest, change: (row: CartRow, lines: CartLine[]) => CartRow, requiredProductId?: string): Promise<ResolvedCart> {
  const row = await readRow(context);
  const next = change(row, readCartLines(row.items));
  const resolved = await price(next, context);
  if (requiredProductId && !resolved.items.some(item => item.productId === requiredProductId)) throw new Error('This product is no longer available.');
  if (requiredProductId && !resolved.canCheckout) throw new Error('There is not enough stock for this quantity.');
  await assertAccount(context);
  // Existing columns only. Stored total is a display estimate, never settlement authority.
  const payload = { items: resolved.items, total: resolved.total, coupon: resolved.coupon ?? null,
    discount_amount: resolved.discount ?? 0, updated_at: new Date().toISOString() };
  if (!row.id && !resolved.items.length) return resolved;
  let saved: CartRow | null;
  if (!row.id) {
    const { data, error } = await supabase.from('carts').insert({ ...payload, user_id: context.userId, created_at: payload.updated_at }).select().single();
    if (error) throw new Error('Could not save your cart. Please retry.');
    saved = data;
  } else {
    let query = supabase.from('carts').update(payload).eq('id', row.id).eq('user_id', context.userId);
    // Reject concurrent edits rather than overwriting another tab's newer cart.
    query = typeof row.updated_at === 'string' ? query.eq('updated_at', row.updated_at) : query.is('updated_at', null);
    const { data, error } = await query.select().maybeSingle();
    if (error) throw new Error('Could not save your cart. Please retry.');
    if (!data) throw new Error('Your cart changed elsewhere. Reload it before trying again.');
    saved = data;
  }
  await assertAccount(context);
  checkOwner(saved, context);
  if (!saved) throw new Error('Your cart could not be confirmed. Please retry.');
  return price(saved, context);
}

export const cartService = {
  getCart: async (context: CartRequest) => price(await readRow(context), context),
  addItem: async (productId: string, item: AddCartItem, context: CartRequest) => {
    if (!productId) throw new Error('Invalid product: missing ID.');
    const count = quantity(item.quantity);
    return changeCart(context, (row, lines) => {
      const previous = lines.find(line => line.productId === productId && !line.variantId);
      const updated = previous ? lines.map(line => line === previous ? { ...line, quantity: quantity(line.quantity + count) } : line)
        : [...lines, { productId, quantity: count, name: '', image: '', price: 0 }];
      return { ...row, items: updated };
    }, productId);
  },
  updateItem: (productId: string, count: number, variantId: string | undefined, context: CartRequest) => {
    quantity(count);
    const key = lineKey({ productId, variantId });
    return changeCart(context, (row, lines) => ({ ...row, items: lines.map(line => lineKey(line) === key ? { ...line, quantity: count } : line) }));
  },
  removeItem: (productId: string, variantId: string | undefined, context: CartRequest) => {
    const key = lineKey({ productId, variantId });
    return changeCart(context, (row, lines) => ({ ...row, items: lines.filter(line => lineKey(line) !== key) }));
  },
  clearCart: (context: CartRequest) => changeCart(context, row => ({ ...row, items: [], coupon: null, discount_amount: 0 })),
  applyCoupon: async (code: string, context: CartRequest) => {
    await assertAccount(context);
    const { data, error } = await supabase.from('coupons').select('*').eq('code', code).single();
    if (error || !data) throw new Error('Could not apply this coupon.');
    // Preserve the existing flat-discount contract; server validation is still required for payment.
    return changeCart(context, row => ({ ...row, coupon: code, discount_amount: data.discount }));
  },
  removeCoupon: (context: CartRequest) => changeCart(context, row => ({ ...row, coupon: null, discount_amount: 0 })),
};
