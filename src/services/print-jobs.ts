import api from '@/api/config';
import { ReceiptMode } from '@/utils/order-receipt';

export async function enqueuePrintJob(orderId: string, receiptMode: ReceiptMode) {
  const response = await api.post(`/orders/${orderId}/print_jobs`, { receipt_mode: receiptMode });
  return response.data as { id: number; status: string };
}
