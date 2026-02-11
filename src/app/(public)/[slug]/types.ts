export interface ShopData {
  data: {
    id: string;
    type: string;
    attributes: {
      cellphone: string;
      name: string;
      slug: string;
      catalog_groups: {
        data: CatalogGroup[];
      };
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
    item_type: 'unit' | 'weight_per_kg';
    price: number;
    price_with_discount: number | null;
    measure_interval: number | null;
    min_weight: number | null;
    max_weight: number | null;
    priority: number;
    image_url: string | null;
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
    highlight?: boolean;
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