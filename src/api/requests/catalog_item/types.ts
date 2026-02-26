interface CatalogItemStepOption {
  id: string;
  type: 'catalog_item_step_option';
  attributes: {
    name: string;
  };
}

interface CatalogItemStep {
  id: string;
  type: 'catalog_item_step';
  attributes: {
    name: string;
    options: {
      data: CatalogItemStepOption[];
    };
  };
}

interface CatalogItemPrepareMethod {
  id: string;
  type: 'catalog_item_prepare_method';
  attributes: {
    name: string;
  };
}

interface CatalogItemExtra {
  id: string;
  type: 'catalog_item_extra';
  attributes: {
    name: string;
    price: string;
  };
}

export interface Item {
  name: string;
  active: boolean;
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
  shared_complements: {
    data: any[];
  };
}

export interface CatalogItemAttributes {
  name: string;
  active: boolean;
  description: string;
  item_type: string;
  price: number;
  price_with_discount: number;
  measure_interval: number | null;
  min_weight: number | null;
  max_weight: number | null;
  priority: number;
  image_url: string;
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
  group?: {
    data: any;
  };
  extra: {
    data: CatalogItemExtra[];
  };
  prepare_method: {
    data: CatalogItemPrepareMethod[];
  };
  steps: {
    data: CatalogItemStep[];
  };
  shared_complements: {
    data: any[];
  };
}


export interface CatalogItemResponse {
  data: {
    id: string;
    type: 'catalog_item_with_group';
    attributes: CatalogItemAttributes
  }
}

interface CatalogItem {
  id: string;
  type: 'catalog_item';
  attributes: Item
}
