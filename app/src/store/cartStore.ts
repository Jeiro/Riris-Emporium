import { create } from 'zustand';
import { cartService } from '../services/cartService';
import type { AddCartItem, CartRequest } from '../services/cartService';
import type { ResolvedCart } from '../lib/cartCalculations';
import { verifiedSession } from '../lib/verifiedSession';

type Status = 'loading' | 'idle' | 'ready' | 'error' | 'guest';
interface CartState {
  cart: ResolvedCart | null;
  ownerId: string | null;
  status: Status;
  isLoading: boolean;
  error: string | null;
  itemCount: number;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, item: AddCartItem) => Promise<void>;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => Promise<void>;
  removeItem: (productId: string, variantId?: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
  mergeCart: (sessionId: string) => Promise<void>;
}
let epoch = 0;
let readVersion = 0;
let pending = 0;
let inFlight: Promise<void> | null = null;
let queue: Promise<void> = Promise.resolve();
const message = (error: unknown) => error instanceof Error ? error.message : 'Your cart could not be updated. Please retry.';
function context(): CartRequest {
  const userId = verifiedSession.getState().userId;
  if (!userId || verifiedSession.getState().isLoading) throw new Error('Please sign in before changing your cart.');
  const started = epoch;
  return { userId, isCurrent: () => started === epoch && verifiedSession.getState().userId === userId };
}
function ready(cart: ResolvedCart) {
  useCartStore.setState({ cart, status: 'ready', error: null, itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0) });
}
function fail(error: unknown) {
  // A failed write may have reached the server: require a fresh read before checkout.
  useCartStore.setState({ cart: null, status: 'error', error: message(error), itemCount: 0 });
}
function mutate(operation: (request: CartRequest) => Promise<ResolvedCart>) {
  let request: CartRequest;
  try { request = context(); } catch (error) { return Promise.reject(error); }
  ++readVersion;
  ++pending;
  useCartStore.setState({ isLoading: true, error: null });
  const work = queue.catch(() => {}).then(async () => {
    if (!request.isCurrent()) throw new Error('Your account changed. Please retry.');
    try {
      const cart = await operation(request);
      if (!request.isCurrent()) throw new Error('Your account changed. Please retry.');
      ready(cart);
    } catch (error) {
      if (request.isCurrent()) fail(error);
      throw error;
    } finally {
      if (request.isCurrent()) { pending--; useCartStore.setState({ isLoading: pending > 0 }); }
    }
  });
  queue = work.catch(() => {});
  return work;
}

export const useCartStore = create<CartState>()(() => ({
  cart: null, ownerId: null, status: 'loading', isLoading: true, error: null, itemCount: 0,
  fetchCart: () => {
    if (inFlight) return inFlight;
    if (pending) return queue;
    let request: CartRequest;
    try { request = context(); } catch { return Promise.resolve(); }
    const version = ++readVersion;
    useCartStore.setState({ isLoading: true, status: 'loading', error: null });
    const work = (async () => {
      try {
        const cart = await cartService.getCart(request);
        if (request.isCurrent() && version === readVersion) ready(cart);
      } catch (error) {
        if (request.isCurrent() && version === readVersion) fail(error);
      } finally {
        if (request.isCurrent() && version === readVersion) useCartStore.setState({ isLoading: false });
      }
    })();
    inFlight = work;
    void work.finally(() => { if (inFlight === work) inFlight = null; });
    return work;
  },
  addItem: (id, item) => mutate(request => cartService.addItem(id, item, request)),
  updateQuantity: (id, count, variant) => mutate(request => cartService.updateItem(id, count, variant, request)),
  removeItem: (id, variant) => mutate(request => cartService.removeItem(id, variant, request)),
  clearCart: () => mutate(request => cartService.clearCart(request)),
  applyCoupon: code => mutate(request => cartService.applyCoupon(code, request)),
  removeCoupon: () => mutate(request => cartService.removeCoupon(request)),
  // Guest merging has no implementation. Reload the real account cart; never erase it.
  mergeCart: (): Promise<void> => useCartStore.getState().fetchCart(),
}));

verifiedSession.subscribe(identity => {
  epoch++;
  readVersion++;
  inFlight = null;
  queue = Promise.resolve();
  pending = 0;
  useCartStore.setState({ cart: null, ownerId: identity.userId, itemCount: 0, error: identity.error,
    isLoading: identity.isLoading || Boolean(identity.userId),
    status: identity.isLoading ? 'loading' : identity.error ? 'error' : identity.userId ? 'idle' : 'guest' });
});
