export interface CustomerOrderItem { id: string; productId?: string; name: string; image?: string; quantity?: number; price?: number }
export interface CustomerOrder {
  id: string; userId: string; orderNumber: string; status: string; createdAt?: string;
  items: CustomerOrderItem[];
  subtotal?: number; shipping?: number; tax?: number; discount?: number; total?: number;
  shippingAddress: { name?: string; street?: string; city?: string; state?: string; phone?: string; country?: string; zipCode?: string };
  paymentMethod?: string; trackingNumber?: string;
}
export class OrderDetailError extends Error {
  code: 'invalid' | 'auth' | 'permission' | 'load';
  constructor(code: OrderDetailError['code'], message: string) { super(message); this.code = code; }
}
export const isOrderId = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
const record = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
const text = (value: unknown) => typeof value === 'string' && value.trim() ? value : undefined;
const amount = (value: unknown) => (typeof value === 'number' || typeof value === 'string' && value.trim() !== '') && Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : undefined;

export function mapCustomerOrder(value: unknown): CustomerOrder {
  const row = record(value);
  const address = record(row.shipping_address);
  const pricing = record(row.pricing);
  return {
    id: text(row.id) ?? '', userId: text(row.user_id) ?? '',
    orderNumber: text(row.order_number) ?? text(row.orderNumber) ?? text(row.id) ?? '',
    status: text(row.status) ?? 'unknown', createdAt: text(row.created_at),
    items: (Array.isArray(row.items) ? row.items : []).map((value, index) => {
      const item = record(value);
      const productId = text(item.productId) ?? text(item.product_id) ?? text(record(item.productId)._id);
      return { id: `${productId ?? 'item'}-${index}`, productId,
        name: text(item.name) ?? 'Item name not recorded', image: text(item.image),
        quantity: amount(item.quantity), price: amount(item.price) };
    }),
    subtotal: amount(row.subtotal ?? pricing.subtotal), shipping: amount(row.shipping ?? pricing.shipping),
    tax: amount(row.tax ?? pricing.tax), discount: amount(row.discount ?? pricing.discount), total: amount(row.total),
    shippingAddress: {
      name: text(address.name), street: text(address.street) ?? text(address.address),
      city: text(address.city), state: text(address.state), phone: text(address.phone),
      country: text(address.country), zipCode: text(address.zipCode),
    },
    paymentMethod: text(row.payment_method), trackingNumber: text(row.tracking_number),
  };
}
