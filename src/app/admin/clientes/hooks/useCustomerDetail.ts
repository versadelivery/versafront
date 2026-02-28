import { useState, useEffect, useCallback } from "react";
import { customerService, Customer, CustomerOrderSummary } from "../services/customerService";

export function useCustomerDetail(id: string) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<CustomerOrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomer = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await customerService.getCustomer(id);
      setCustomer(response.customer.data);
      setOrders(response.orders.data || []);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Erro ao carregar cliente");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchCustomer();
    }
  }, [id, fetchCustomer]);

  const toggleBlock = async (blocked: boolean) => {
    try {
      setError(null);
      await customerService.toggleBlock(id, blocked);
      await fetchCustomer();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || "Erro ao alterar bloqueio do cliente";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    customer,
    orders,
    loading,
    error,
    toggleBlock,
    refetch: fetchCustomer,
  };
}
