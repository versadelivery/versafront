export interface CatalogItemAttributes {
  name: string;
  description?: string;
  priority?: number;
  image_url?: string;
}

export interface CatalogItem {
  id: string;
  attributes: CatalogItemAttributes;
}

export interface CatalogListResponse {
  data: CatalogItem[];
}

export interface SingleCatalogResponse {
  data: CatalogItem;
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
  price: number;
  unit: string;
  image?: string;
  active: boolean;
};

export type CatalogGroup = {
  id: number;
  name: string;
  description: string;
  priority: number;
  image?: string;
  products?: Product[];
};

export type ProductGroup = {
  id: string;
  name: string;
  description: string;
  priority: number;
  image?: string;
  products: Product[];
};

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