import { calculateCartTotals, toMinorUnits } from './cartCalculations.ts';
import type { CartLine } from './cartCalculations';

export const WHATSAPP_NUMBER = '2348072105878';
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
export const WHATSAPP_CHECKOUT_NOTICE = 'Your order will be sent through WhatsApp. Our team will confirm the final amount and provide payment details.';
export interface CheckoutCustomer {
  firstName: string; lastName: string; email: string; phone: string;
  address: string; city: string; state: string; zipCode: string;
}
const money = (value: number) => `₦${value.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
function text(value: string, label: string, limit: number, required = true) {
  const cleaned = value.trim();
  if (required && !cleaned) throw new Error(`Please enter ${label}.`);
  const hasControl = [...cleaned].some(char => {
    const code = char.charCodeAt(0);
    return (code < 32 && ![9, 10, 13].includes(code)) || code === 127;
  });
  if (cleaned.length > limit || hasControl) throw new Error(`Please check ${label}.`);
  return cleaned.replace(/\s+/g, ' ');
}
export function createWhatsAppOrder(items: CartLine[], customer: CheckoutCustomer, available: boolean) {
  if (!available || !items.length) throw new Error('Your cart must contain available products before ordering. Please review your cart.');
  if (items.length > 100) throw new Error('This order is too large for a WhatsApp draft. Please reduce the number of items.');
  const name = [text(customer.firstName, 'your first name', 80), text(customer.lastName, 'your last name', 80, false)].filter(Boolean).join(' ');
  const phone = text(customer.phone, 'your phone number', 30);
  if (!/^\+?\d{7,15}$/.test(phone.replace(/[ ()-]/g, ''))) throw new Error('Please enter a valid phone number, including the country code if applicable.');
  const email = text(customer.email, 'your email address', 254);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Please enter a valid email address.');
  const address = text(customer.address, 'your delivery address', 300);
  const city = text(customer.city, 'your city', 100);
  const state = text(customer.state, 'your state', 100);
  const zip = text(customer.zipCode, 'your postal code', 20, false);
  // Task 3 remains the arithmetic source. Only its merchandise subtotal is quoted:
  // shipping, tax and discounts have not been approved as final business charges.
  const { subtotal } = calculateCartTotals(items);
  const lines = items.map((item, index) => {
    if (!item.productId || item.variantId) throw new Error('A cart item needs review before ordering.');
    const product = text(item.name, 'the product name', 200);
    const unit = toMinorUnits(item.price) / 100;
    return `${index + 1}. ${product}\nQuantity: ${item.quantity}\nUnit Price: ${money(unit)}\nTotal: ${money(toMinorUnits(unit) * item.quantity / 100)}`;
  });
  const message = [
    'Hello Riris Emporium!', 'I would like to place an order.', 'ORDER SUMMARY', lines.join('\n\n'),
    `Subtotal: ${money(subtotal)}\nDelivery: To be confirmed\nTaxes and discounts: To be confirmed\nEstimated Total (items only): ${money(subtotal)}`,
    'CUSTOMER INFORMATION',
    `Name: ${name}\nPhone: ${phone}\nEmail: ${email}\nDelivery Address: ${address}\nCity: ${city}\nState: ${state}${zip ? `\nPostal Code: ${zip}` : ''}`,
    'Please confirm the final total, including any delivery fee, and send your bank account details so I can make payment.',
    'Thank you!',
  ].join('\n\n');
  const url = `${WHATSAPP_URL}?text=${encodeURIComponent(message)}`;
  // Conservative handoff limit: no truncation of an incomplete order.
  if (url.length > 12000) throw new Error('This order is too long for a WhatsApp link. Please reduce the number of items or shorten your delivery details.');
  return { message, url, subtotal };
}
