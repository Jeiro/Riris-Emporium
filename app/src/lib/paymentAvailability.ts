// No environment setting or browser callback can enable payments in the WhatsApp checkout workflow.
export const PAYMENTS_UNAVAILABLE_MESSAGE = 'Online payment processing is unavailable. Place your order through WhatsApp; our team will confirm payment details.';

export class PaymentUnavailableError extends Error {
  readonly code = 'PAYMENTS_UNAVAILABLE';
  constructor() { super(PAYMENTS_UNAVAILABLE_MESSAGE); this.name = 'PaymentUnavailableError'; }
}

// Keep legacy callers compatible, but never inspect or act on their payment data.
export async function rejectUnverifiedPayment(...request: unknown[]): Promise<never> {
  void request;
  throw new PaymentUnavailableError();
}
