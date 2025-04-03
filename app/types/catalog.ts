export interface Product {
  id: string;
  name: string;
  description: string;
  item_type: string;
  unit_of_measurement: string;
  price: string;
  price_with_discount?: string;
  measure_interval: string;
  min_weight: string;
  max_weight: string;
  priority: number;
  image_url: string;
  active?: boolean;
}

export interface CatalogItem {
  id: string;
  attributes: {
    name: string;
    description: string;
    catalog_group_id: string;
    item_type: 'unit' | 'weight';
    price: string;
    unit_of_measurement?: 'kg' | 'g';
    measure_interval?: string;
    min_weight?: string;
    max_weight?: string;
    priority: string;
    price_with_discount?: string;
    image_url?: string;
  };
}

export interface UICatalogItem {
  id: string;
  name: string;
  description: string;
  groupId: string;
  type: 'unit' | 'weight';
  price: string;
  unit?: 'kg' | 'g';
  interval?: string;
  minWeight?: string;
  maxWeight?: string;
  priority: string;
  discountPrice?: string;
  image?: string;
}

export interface ProductData {
  data: Product;
}


export interface CatalogGroup {
  id: string;
  type: "catalog_group";
  attributes: {
      name: string;
      description: string;
      priority: number;
      image_url: string;
      items: CatalogItem[];
  };
}

export interface CatalogData {
  data: CatalogGroup[];
}

export type CatalogTab = 'catalog' | 'stock';

export interface GroupData {
  name: string;
  description: string;
  image: File | string;
  priority: number;
}

export interface UICatalogGroup {
  id: string;
  name: string;
  description: string;
  priority: number;
  image?: string;
  products: ProductData[];
}