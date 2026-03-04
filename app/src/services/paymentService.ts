import api from './api';
import type { ApiResponse, Payment, PaginationMeta } from '../types';

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
  // Initialize payment
  initializePayment: async (orderId: string): Promise<InitializePaymentResponse> => {
    const response = await api.post<ApiResponse<InitializePaymentResponse>>(
      '/payments/initialize',
      { orderId }
    );
    return response.data.data;
  },

  // Verify payment
  verifyPayment: async (reference: string): Promise<VerifyPaymentResponse> => {
    const response = await api.post<ApiResponse<VerifyPaymentResponse>>('/payments/verify', {
      reference
    });
    return response.data.data;
  },

  // Get payment history
  getPayments: async (page = 1, limit = 10): Promise<PaymentsResponse> => {
    const response = await api.get<ApiResponse<Payment[]>>(
      `/payments?page=${page}&limit=${limit}`
    );
    return {
      data: response.data.data,
      meta: response.data.meta!
    };
  },

  // Get single payment
  getPayment: async (id: string): Promise<Payment> => {
    const response = await api.get<ApiResponse<Payment>>(`/payments/${id}`);
    return response.data.data;
  },

  // Refund payment (admin)
  refundPayment: async (id: string, reason: string): Promise<Payment> => {
    const response = await api.post<ApiResponse<Payment>>(`/payments/${id}/refund`, { reason });
    return response.data.data;
  }
};
