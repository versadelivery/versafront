import api from "@/api/config";

export type AdjustmentType = "none" | "discount" | "surcharge";
export type ValueType = "fixed" | "percentage";
export type ManualPixPaymentMoment = "on_delivery" | "on_order";

export type ShopPaymentConfig = {
  data: {
    id: string;
    type: "shop_payment_config";
    attributes: {
      cash: boolean;
      debit: boolean;
      credit: boolean;
      manual_pix: boolean;
      manual_pix_payment_moment: ManualPixPaymentMoment;
      pix_key: string | null;
      cash_adjustment_type: AdjustmentType;
      cash_adjustment_value: string;
      cash_value_type: ValueType;
      debit_adjustment_type: AdjustmentType;
      debit_adjustment_value: string;
      debit_value_type: ValueType;
      credit_adjustment_type: AdjustmentType;
      credit_adjustment_value: string;
      credit_value_type: ValueType;
      manual_pix_adjustment_type: AdjustmentType;
      manual_pix_adjustment_value: string;
      manual_pix_value_type: ValueType;
      service_fee_enabled: boolean;
      service_fee_percentage: string;
      asaas_pix: boolean;
      asaas_api_key: string | null;
      asaas_webhook_token: string | null;
      asaas_document: string | null;
      asaas_pix_adjustment_type: AdjustmentType;
      asaas_pix_adjustment_value: string;
      asaas_pix_value_type: ValueType;
      asaas_pix_expiration_minutes: number;
    };
  };
};


export const getPaymentMethods = async (): Promise<ShopPaymentConfig> => {
  const response = await api.get("/shop_payment_configs");
  return response.data;
};

export const updatePaymentMethods = async (paymentMethods: ShopPaymentConfig): Promise<ShopPaymentConfig> => {
  const response = await api.put("/shop_payment_configs", {
    shop_payment_config: paymentMethods.data.attributes
  });
  return response.data;
};

export const generatePixKeyOtp = async (): Promise<void> => {
  await api.post("/shop_payment_configs/generate_pix_key_otp");
};

export const updatePixKey = async (pixKey: string, otpCode: string): Promise<ShopPaymentConfig> => {
  const response = await api.put("/shop_payment_configs/update_pix_key", {
    shop_payment_config: { pix_key: pixKey, otp_code: otpCode }
  });
  return response.data;
};
