import { useState, useEffect } from "react";
import {
  tableService,
  Table,
  CreateTablePayload,
  UpdateTablePayload,
  UpdatePositionsPayload,
} from "../services/table-service";
import { toast } from "sonner";

export function useTables() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTables = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tableService.getTables();
      setTables(response.data);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar mesas");
      console.error("Erro ao buscar mesas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const createTable = async (data: CreateTablePayload) => {
    try {
      setError(null);
      await tableService.createTable(data);
      toast.success("Mesa criada com sucesso!");
      await fetchTables();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || "Erro ao criar mesa";
      setError(errorMessage);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateTable = async (id: string, data: UpdateTablePayload) => {
    try {
      setError(null);
      await tableService.updateTable(id, data);
      toast.success("Mesa atualizada com sucesso!");
      await fetchTables();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || "Erro ao atualizar mesa";
      setError(errorMessage);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteTable = async (id: string) => {
    try {
      setError(null);
      await tableService.deleteTable(id);
      toast.success("Mesa excluída com sucesso!");
      await fetchTables();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || "Erro ao excluir mesa";
      setError(errorMessage);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updatePositions = async (data: UpdatePositionsPayload) => {
    try {
      setError(null);
      await tableService.updatePositions(data);
      await fetchTables();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || "Erro ao atualizar posições";
      setError(errorMessage);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    tables,
    loading,
    error,
    createTable,
    updateTable,
    deleteTable,
    updatePositions,
    refetch: fetchTables,
  };
}
