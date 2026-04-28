import { useState, useEffect } from "react";
import { couponService, Coupon, CreateCouponPayload, UpdateCouponPayload } from "../services/coupon-service";
import { toast } from "sonner";

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
      const errorMessage = err.response?.data?.error || err.message || "Erro ao criar cupom";
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
      const errorMessage = err.response?.data?.error || err.message || "Erro ao atualizar cupom";
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
      const errorMessage = err.response?.data?.error || err.message || "Erro ao excluir cupom";
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
