// Synthetic boundary, not a database or RLS emulator. No SDK, URL, key or network.
export const ids = {
  a: '00000000-0000-4000-8000-000000000001',
  b: '00000000-0000-4000-8000-000000000002',
  product: '00000000-0000-4000-8000-000000000101',
  cart: '00000000-0000-4000-8000-000000000201',
};
export const product = {
  id: ids.product, name: 'Synthetic audit bag', description: 'Local fixture only',
  price: 2500, image: 'https://assets.invalid/bag.png', category: 'bags',
  stock: 8, featured: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z',
};
export const profile = { id: ids.a, email: 'customer-a@example.invalid', name: 'Synthetic', last_name: 'A', role: 'customer' };
export const state = { calls: [], replies: [], authReplies: {}, userId: ids.a };
export function reset() {
  state.calls = []; state.replies = []; state.authReplies = {}; state.userId = ids.a;
}
export function reply(value) { state.replies.push(value); }
function query(table) {
  const call = { table, steps: [] };
  const builder = {};
  for (const method of ['select', 'insert', 'update', 'delete', 'eq', 'in', 'is', 'or', 'gte', 'gt', 'lte', 'order', 'range', 'limit', 'single', 'maybeSingle', 'not']) {
    builder[method] = (...args) => { call.steps.push([method, ...args]); return builder; };
  }
  builder.then = (resolve, reject) => {
    state.calls.push(call);
    return Promise.resolve().then(() => {
      if (!state.replies.length) throw new Error(`Unexpected synthetic query: ${table}`);
      const result = state.replies.shift();
      return typeof result === 'function' ? result(call) : result;
    }).then(resolve, reject);
  };
  return builder;
}
async function auth(method, args) {
  state.calls.push({ auth: method, args });
  if (method in state.authReplies) return state.authReplies[method];
  if (method === 'getUser') return { data: { user: state.userId ? { id: state.userId, email: profile.email } : null }, error: null };
  throw new Error(`Unexpected synthetic Auth call: ${method}`);
}
export const supabase = {
  from: query,
  auth: Object.fromEntries(['getUser', 'signUp', 'signInWithPassword', 'signOut', 'updateUser'].map(method => [method, args => auth(method, args)])),
};
export async function getAuthUser() { return (await supabase.auth.getUser()).data.user; }
