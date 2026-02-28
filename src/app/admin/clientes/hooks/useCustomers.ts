import { useState, useEffect, useRef, useCallback } from "react";
import { customerService, Customer, CreateCustomerRequest, UpdateCustomerRequest } from "../services/customerService";

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchCustomers = useCallback(async (search?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await customerService.getCustomers(search || undefined);
      setCustomers(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      fetchCustomers(term);
    }, 300);
  }, [fetchCustomers]);

  const createCustomer = async (data: CreateCustomerRequest["customer"]) => {
    try {
      setError(null);
      const response = await customerService.createCustomer({ customer: data });
      await fetchCustomers(searchTerm || undefined);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || "Erro ao criar cliente";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateCustomer = async (id: string, data: UpdateCustomerRequest["customer"]) => {
    try {
      setError(null);
      const response = await customerService.updateCustomer(id, { customer: data });
      await fetchCustomers(searchTerm || undefined);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || "Erro ao atualizar cliente";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const toggleBlock = async (id: string, blocked: boolean) => {
    try {
      setError(null);
      await customerService.toggleBlock(id, blocked);
      await fetchCustomers(searchTerm || undefined);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || "Erro ao alterar bloqueio do cliente";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    customers,
    loading,
    error,
    searchTerm,
    handleSearch,
    createCustomer,
    updateCustomer,
    toggleBlock,
    refetch: () => fetchCustomers(searchTerm || undefined),
  };
}
