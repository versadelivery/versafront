export interface ShopData {
  data: {
    id: string;
    type: string;
    attributes: {
      cellphone: string;
      name: string;
      slug: string;
      address: string | null;
      email: string | null;
      image_url: string | null;
      is_closed: boolean;
      shop_status: any;
      catalog_groups: {
        data: CatalogGroup[];
      };
      shop_delivery_config: {
        data: {
          attributes: {
            delivery_fee_kind: 'to_be_agreed' | 'fixed' | 'per_neighborhood';
            amount: number;
            min_value_free_delivery: number | null;
            minimum_order_value: number | null;
            shop_delivery_neighborhoods: {
              data: Array<{
                id: string;
                type: string;
                attributes: {
                  name: string;
                  amount: number;
                  min_value_free_delivery: number | null;
                };
              }>;
            };
          };
        };
      } | null;
      shop_payment_config: {
        data: {
          attributes: {
            cash: boolean;
            debit: boolean;
            credit: boolean;
            manual_pix: boolean;
          };
        };
      } | null;
      shop_schedule_config: any;
    };
  };
}

export interface CatalogGroup {
  id: string;
  type: string;
  attributes: {
    name: string;
    description: string;
    priority: number;
    image_url: string | null;
    items: {
      data: Array<{
        data: CatalogItem
      }>;
    };
  };
}

export interface CatalogItem {
  id: string;
  type: string;
  attributes: {
    name: string;
    description: string;
    item_type: 'unit' | 'weight_per_g' | 'weight_per_kg';
    price: number;
    price_with_discount: number | null;
    measure_interval: number | null;
    min_weight: number | null;
    max_weight: number | null;
    priority: number;
    image_url: string | null;
    cost?: number | null;
    ncm_code?: string | null;
    highlight?: boolean;
    sunday_active?: boolean;
    monday_active?: boolean;
    tuesday_active?: boolean;
    wednesday_active?: boolean;
    thursday_active?: boolean;
    friday_active?: boolean;
    saturday_active?: boolean;
    promotion_tag?: boolean;
    best_seller_tag?: boolean;
    new_tag?: boolean;
    available_delivery?: boolean;
    available_dine_in?: boolean;
    extra: {
      data: CatalogItemExtra[];
    };
    prepare_method: {
      data: CatalogItemPrepareMethod[];
    };
    steps: {
      data: CatalogItemStep[];
    };
  };
}

export interface CatalogItemExtra {
  id: string;
  type: string;
  attributes: {
    name: string;
    price: string;
  };
}

export interface CatalogItemPrepareMethod {
  id: string;
  type: string;
  attributes: {
    name: string;
  };
}

export interface CatalogItemStep {
  id: string;
  type: string;
  attributes: {
    name: string;
    options: {
      data: CatalogItemStepOption[];
    };
  };
}

export interface CatalogItemStepOption {
  id: string;
  type: string;
  attributes: {
    name: string;
  };
}

export interface ClientData {
  name: string;
  email: string;
  password?: string;
  cellphone: string;
  avatar_url?: string;
}

export interface ClientAuthData {
  customer: ClientData;
  token: string;
}