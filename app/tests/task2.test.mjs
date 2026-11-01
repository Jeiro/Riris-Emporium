import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareContactDraft, BUSINESS_EMAIL } from '../src/lib/contact.ts';
import { isOrderId, mapCustomerOrder } from '../src/lib/orderDetails.ts';
import { parseWishlist, wishlistKey } from '../src/lib/wishlistStorage.ts';

const contact = { name: 'Test Customer', email: 'fixture@example.test', subject: 'general', message: 'A product question' };
test('contact drafts target the confirmed address and encode untrusted content', () => {
  const message = 'A & B?\ncc=attacker@example.test # tag';
  const result = prepareContactDraft({ ...contact, message });
  const url = new URL(result.mailto);
  assert.equal(url.pathname, BUSINESS_EMAIL);
  assert.equal(url.searchParams.get('subject'), 'General Inquiry');
  assert.equal(url.searchParams.get('body'), result.body);
  assert.equal(url.searchParams.get('cc'), null);
  assert.ok(result.body.endsWith(message));
});
test('contact rejects empty, whitespace, invalid, prototype, and overlong input', () => {
  for (const fields of [{ name: '  ' }, { email: 'bad' }, { subject: 'constructor' }, { message: '' }, { message: 'x'.repeat(2001) }]) {
    assert.throws(() => prepareContactDraft({ ...contact, ...fields }));
  }
});
test('wishlist keys isolate account IDs and contain only deduplicated product IDs', () => {
  assert.notEqual(wishlistKey('account-a'), wishlistKey('account-b'));
  assert.deepEqual(parseWishlist(null), []);
  assert.deepEqual(parseWishlist('["a","a","b"]'), ['a', 'b']);
  for (const raw of ['{}', 'null', '[1]', '[""]', '{broken']) assert.throws(() => parseWishlist(raw));
});
test('order IDs are UUIDs, not arbitrary database filters', () => {
  assert.equal(isOrderId('33333333-3333-4333-8333-333333333333'), true);
  for (const id of ['', '1', 'eq.123', 'not-a-uuid']) assert.equal(isOrderId(id), false);
});
test('order mapping preserves recorded values and never invents payment confirmation', () => {
  const order = mapCustomerOrder({ id: 'id', user_id: 'user', order_number: 'ORDER-1', status: 'pending', total: '8250', shipping: 0,
    items: [{ productId: 'product', name: 'Bag', price: 2500, quantity: 2 }], shipping_address: { address: 'Fixture street', city: 'Fixture city' }, payment_method: 'flutterwave' });
  assert.equal(order.orderNumber, 'ORDER-1');
  assert.equal(order.total, 8250);
  assert.equal(order.shipping, 0);
  assert.equal(order.subtotal, undefined);
  assert.equal(order.shippingAddress.street, 'Fixture street');
  assert.equal(order.shippingAddress.name, undefined);
  assert.equal(order.items[0].productId, 'product');
  assert.equal(order.paymentStatus, undefined);
});
test('missing and malformed order fields stay absent without throwing', () => {
  for (const row of [null, {}, { items: [null, {}], total: 'bad', tax: -1, shipping: false }]) {
    const order = mapCustomerOrder(row);
    assert.equal(order.total, undefined);
    assert.equal(order.createdAt, undefined);
    assert.equal(order.tax, undefined);
    assert.equal(order.shipping, undefined);
  }
});
