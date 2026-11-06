import test from 'node:test';
import assert from 'node:assert/strict';
import { createWhatsAppOrder, WHATSAPP_URL } from '../src/lib/whatsappCheckout.ts';
const customer = { firstName: ' Synthetic ', lastName: 'Customer', email: 'fixture@example.test', phone: '+234 800 000 0000', address: '1 Synthetic Street', city: 'Fixture City', state: 'Fixture State', zipCode: '' };
const item = (price = 2500, quantity = 1, name = 'Fixture bag') => ({ productId: 'fixture-product', name, price, quantity, image: '' });

test('single product draft uses actual quantities and shared merchandise subtotal without assumed fees', () => {
  const draft = createWhatsAppOrder([item(2500, 2)], customer, true);
  assert.equal(draft.subtotal, 5000);
  assert.ok(draft.message.includes('Quantity: 2\nUnit Price: ₦2,500.00\nTotal: ₦5,000.00'));
  assert.ok(draft.message.includes('Estimated Total (items only): ₦5,000.00'));
  assert.ok(draft.message.includes('Delivery: To be confirmed'));
  assert.ok(draft.message.includes('Taxes and discounts: To be confirmed'));
});
test('multiple products and quantity changes recalculate without stale totals', () => {
  assert.equal(createWhatsAppOrder([item(2500, 2), item(1500)], customer, true).subtotal, 6500);
  assert.equal(createWhatsAppOrder([item(2500, 3), item(1500)], customer, true).subtotal, 9000);
  assert.equal(createWhatsAppOrder([item(0.1, 3), item(0.2)], customer, true).subtotal, 0.5);
});
test('fixed official WhatsApp destination uses encodeURIComponent and preserves Unicode and special characters', () => {
  const name = 'Bag & scarf #1 / 50% + 👜 <sale>';
  const draft = createWhatsAppOrder([item(25, 1, name)], { ...customer, address: 'A & B #12 + flat' }, true);
  const url = new URL(draft.url);
  assert.equal(url.origin + url.pathname, WHATSAPP_URL);
  assert.equal(url.pathname, '/2348072105878');
  assert.equal(url.searchParams.get('text'), draft.message);
  assert.equal(draft.url, `${WHATSAPP_URL}?text=${encodeURIComponent(draft.message)}`);
  assert.ok(draft.message.includes(name));
});
test('empty, unavailable, invalid quantities/prices and unsupported variants cannot generate an order', () => {
  assert.throws(() => createWhatsAppOrder([], customer, true));
  assert.throws(() => createWhatsAppOrder([item()], customer, false));
  for (const quantity of [0, -1, 1.5, NaN, Infinity]) assert.throws(() => createWhatsAppOrder([item(20, quantity)], customer, true));
  for (const price of [-1, NaN, Infinity]) assert.throws(() => createWhatsAppOrder([item(price)], customer, true));
  assert.throws(() => createWhatsAppOrder([{ ...item(), variantId: 'unknown' }], customer, true));
});
test('required customer and delivery fields are trimmed and validated', () => {
  for (const field of ['firstName','email','phone','address','city','state']) assert.throws(() => createWhatsAppOrder([item()], { ...customer, [field]: '   ' }, true));
  for (const phone of ['abc', '123', '+'.repeat(20), '12345678901234567']) assert.throws(() => createWhatsAppOrder([item()], { ...customer, phone }, true));
  assert.throws(() => createWhatsAppOrder([item()], { ...customer, email: 'invalid' }, true));
  assert.throws(() => createWhatsAppOrder([item()], { ...customer, address: 'x'.repeat(301) }, true));
  assert.throws(() => createWhatsAppOrder([item()], { ...customer, address: 'bad\u0000address' }, true));
});
test('message includes only explicit customer fields and never serializes auth or payment properties', () => {
  const draft = createWhatsAppOrder([{ ...item(), token: 'do-not-share' }], { ...customer, password: 'do-not-share', accessToken: 'do-not-share' }, true);
  assert.ok(!draft.message.includes('do-not-share'));
  assert.ok(draft.message.includes('Name: Synthetic Customer'));
  assert.ok(!draft.message.includes('Postal Code:'));
});
test('very long drafts fail explicitly instead of truncating an order', () => {
  const items = Array.from({ length: 100 }, (_, i) => ({ ...item(1, 1, '👜'.repeat(90)), productId: String(i) }));
  assert.throws(() => createWhatsAppOrder(items, customer, true), /too long/);
});
