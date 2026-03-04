import { supabase } from '../lib/supabase';
import type { Payment, PaginationMeta } from '../types';

interface InitializePaymentResponse {
  authorizationUrl: string;
  reference: string;
  accessCode: string;
}

interface VerifyPaymentResponse {
  status: string;
  amount: number;
  orderId: string;
  reference: string;
}

interface PaymentsResponse {
  data: Payment[];
  meta: PaginationMeta;
}

export const paymentService = {
  // Initialize payment (Simulated)
  initializePayment: async (orderId: string): Promise<InitializePaymentResponse> => {
    // In a real app, this would call a backend function to initialize with Paystack
    // Here we simulate it by returning a fake success and redirecting to a success page
    const reference = `REF_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    return {
      authorizationUrl: `/checkout/success?reference=${reference}&orderId=${orderId}`,
      reference,
      accessCode: 'SIMULATED_ACCESS_CODE'
    };
  },

  // Verify payment (Simulated)
  verifyPayment: async (reference: string): Promise<VerifyPaymentResponse> => {
    // Verify reference and update order in Supabase
    const { data: order } = await supabase.from('orders').select('id, total').limit(1).single();

    return {
      status: 'success',
      amount: order?.total || 0,
      orderId: order?.id || '',
      reference
    };
  },

  // Get payment history
  getPayments: async (page = 1, limit = 10): Promise<PaymentsResponse> => {
    const offset = (page - 1) * limit;
    const { data, count, error } = await supabase
      .from('payments')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      data: data as any[],
      meta: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    };
  },

  // Get single payment
  getPayment: async (id: string): Promise<Payment> => {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as any;
  },

  // Refund payment (admin)
  refundPayment: async (id: string, _reason: string): Promise<Payment> => {
    const { data, error } = await supabase
      .from('payments')
      .update({ status: 'refunded', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as any;
  }
};
