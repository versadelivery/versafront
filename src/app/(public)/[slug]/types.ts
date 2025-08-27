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