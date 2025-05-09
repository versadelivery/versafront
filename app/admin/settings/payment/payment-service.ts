import api from "@/app/lib/api";

export type ShopPaymentConfig = {
  data: {
    id: string;
    type: "shop_payment_config";
    attributes: {
      cash: boolean;
      debit: boolean;
      credit: boolean;
      manual_pix: boolean;
    };
  };
};


export const getPaymentMethods = async (): Promise<ShopPaymentConfig> => {
  const response = await api.get("/shop_payment_configs");
  return response.data;
};

export const updatePaymentMethods = async (paymentMethods: ShopPaymentConfig): Promise<ShopPaymentConfig> => {
  console.log(
    {
      shop_payment_config: paymentMethods.data.attributes
    }
  )
  const response = await api.put("/shop_payment_configs", {
    shop_payment_config: paymentMethods.data.attributes
  });
  return response.data;
};
