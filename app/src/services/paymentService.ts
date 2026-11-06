import { supabase } from '../lib/supabase';
import { rejectUnverifiedPayment } from '../lib/paymentAvailability';
import type { Payment, PaginationMeta } from '../types';

interface PaymentsResponse {
  data: Payment[];
  meta: PaginationMeta;
}

export const paymentService = {
  // Disabled until an independently verified server payment flow is approved.
  initializePayment: rejectUnverifiedPayment,
  verifyPayment: rejectUnverifiedPayment,

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

  // A database status update is not a refund. No provider refund is implemented.
  refundPayment: rejectUnverifiedPayment,
};
