import { useState, useEffect } from "react";
import { couponService, Coupon, CreateCouponPayload, UpdateCouponPayload } from "../services/coupon-service";
import { toast } from "sonner";

// A API devolve a mensagem crua da excecao (ActiveRecord/Postgres, em ingles)
export function translateCouponError(raw: string | undefined, fallback: string): string {
  if (!raw) return fallback;
  const s = raw.toLowerCase();
  if (s.includes("already been taken")) return "Este código já está em uso";
  if (s.includes("code") && s.includes("blank")) return "O código do cupom é obrigatório";
  if (s.includes("máximo 100")) return "Percentual não pode ser maior que 100";
  if (s.includes("expires at") || s.includes("expires_at")) return "A data de fim deve ser posterior à data de início";
  if (s.includes("value") && s.includes("greater than")) return "O valor do desconto deve ser maior que zero";
  if (s.includes("foreign key")) return "Este cupom já foi usado em pedidos e não pode ser excluído. Desative-o.";
  return fallback;
}

export function useCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await couponService.getCoupons();
      setCoupons(response.data);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar cupons");
      console.error("Erro ao buscar cupons:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const createCoupon = async (data: CreateCouponPayload) => {
    try {
      setError(null);
      await couponService.createCoupon(data);
      toast.success("Cupom criado com sucesso!");
      await fetchCoupons();
    } catch (err: any) {
      const errorMessage = translateCouponError(err.response?.data?.error, "Erro ao criar cupom");
      setError(errorMessage);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateCoupon = async (id: string, data: UpdateCouponPayload) => {
    try {
      setError(null);
      await couponService.updateCoupon(id, data);
      toast.success("Cupom atualizado com sucesso!");
      await fetchCoupons();
    } catch (err: any) {
      const errorMessage = translateCouponError(err.response?.data?.error, "Erro ao atualizar cupom");
      setError(errorMessage);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteCoupon = async (id: string) => {
    try {
      setError(null);
      await couponService.deleteCoupon(id);
      toast.success("Cupom excluído com sucesso!");
      await fetchCoupons();
    } catch (err: any) {
      const errorMessage = translateCouponError(err.response?.data?.error, "Erro ao excluir cupom");
      setError(errorMessage);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    coupons,
    loading,
    error,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    refetch: fetchCoupons,
  };
}
