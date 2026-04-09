import { useState, useEffect, useCallback } from "react";
import {
  tableService,
  TableSession,
  OpenTableSessionPayload,
  CloseTableSessionPayload,
  TableSessionFilters,
} from "../services/table-service";
import { toast } from "sonner";

export function useTableSessions(initialFilters?: TableSessionFilters) {
  const [sessions, setSessions] = useState<TableSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TableSessionFilters>(initialFilters || {});

  const fetchSessions = useCallback(async (currentFilters?: TableSessionFilters) => {
    try {
      setLoading(true);
      setError(null);
      const response = await tableService.getTableSessions(currentFilters || filters);
      setSessions(response.data);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar comandas");
      console.error("Erro ao buscar comandas:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const openSession = async (data: OpenTableSessionPayload) => {
    try {
      setError(null);
      await tableService.openTableSession(data);
      toast.success("Comanda aberta com sucesso!");
      await fetchSessions();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || "Erro ao abrir comanda";
      setError(errorMessage);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const closeSession = async (id: string, data: CloseTableSessionPayload) => {
    try {
      setError(null);
      await tableService.closeTableSession(id, data);
      toast.success("Comanda fechada com sucesso!");
      await fetchSessions();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || "Erro ao fechar comanda";
      setError(errorMessage);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateFilters = (newFilters: TableSessionFilters) => {
    setFilters(newFilters);
  };

  return {
    sessions,
    loading,
    error,
    filters,
    openSession,
    closeSession,
    updateFilters,
    refetch: fetchSessions,
  };
}
