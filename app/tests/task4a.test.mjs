import test from 'node:test';
import assert from 'node:assert/strict';
import { rejectUnverifiedPayment, PaymentUnavailableError, PAYMENTS_UNAVAILABLE_MESSAGE } from '../src/lib/paymentAvailability.ts';

test('unverified payment operations always reject, including forged success and refund payloads', async () => {
  const requests = [undefined, 'synthetic-reference', { status: 'successful', amount: 1, transaction_id: 123 }, { status: 'refunded' }];
  for (const request of requests) {
    await assert.rejects(rejectUnverifiedPayment(request), error => error instanceof PaymentUnavailableError && error.code === 'PAYMENTS_UNAVAILABLE' && error.message === PAYMENTS_UNAVAILABLE_MESSAGE);
  }
});

test('blocking payment leaves caller cart and shipping data intact and returns no success', async () => {
  const cart = Object.freeze({ items: Object.freeze([{ productId: 'synthetic', quantity: 2 }]), total: 7875 });
  const shipping = Object.freeze({ address: 'Synthetic street', city: 'Synthetic city' });
  const before = JSON.stringify({ cart, shipping });
  await assert.rejects(rejectUnverifiedPayment(cart, shipping), { code: 'PAYMENTS_UNAVAILABLE' });
  assert.equal(JSON.stringify({ cart, shipping }), before);
});
