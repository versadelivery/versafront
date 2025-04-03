export interface CatalogItemAttributes {
  name: string;
  description?: string;
  item_type?: string;
  unit_of_measurement?: string;
  price?: string;
  price_with_discount?: string;
  measure_interval?: string;
  min_weight?: string;
  max_weight?: string;
  priority?: number;
  image_url?: string | null;
}

export interface ItemAttributes {
  name?: string;
  description?: string;
  item_type?: string;
  unit_of_measurement?: string;
  price?: string;
  price_with_discount?: string;
  measure_interval?: string;
  min_weight?: string;
  max_weight?: string;
  image_url?: string;
}

export interface Item {
  id: string;
  attributes?: ItemAttributes;
}

export interface CatalogItem {
  id: string;
  type: string;
  attributes: CatalogItemAttributes;
}

export interface CatalogGroupAttributes {
  name: string;
  description?: string;
  priority?: number;
  image_url?: string;
  items: {
    data: CatalogItem[];
  }[];
}

export interface CatalogGroupData {
  id: string;
  type: string;
  attributes: CatalogGroupAttributes;
}

export interface CatalogListResponse {
  data: CatalogGroupData[];
}

export interface SingleCatalogResponse {
  data: CatalogGroupData;
}

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  item_type?: string;
  unit?: string;
  price: number;
  price_with_discount?: number;
  measure_interval?: number;
  min_weight?: number;
  max_weight?: number;
  image?: string;
  active: boolean;
};

export type CatalogGroup = {
  id: number;
  name: string;
  description: string;
  priority: number;
  image?: string;
  products: Product[];
};

export type ProductGroup = {
  id: string;
  name: string;
  description: string;
  priority: number;
  image?: string;
  products: Product[];
};

export type CatalogType = 'catalog_group' | 'catalog_item';

export type CatalogTab = 'catalog' | 'stock';

export type Additional = {
  id: string;
  name: string;
  price: string;
};

export type PreparationMode = {
  id: string;
  description: string;
};

export type StepItem = {
  id: string;
  name: string;
};

export type Step = {
  id: string;
  title: string;
  items: StepItem[];
};

export type NewItemModalProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};