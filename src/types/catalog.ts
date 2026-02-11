import { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";

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

export interface MeasurePriceSectionProps {
  measureType: 'unit' | 'weight' | 'volume';
  setMeasureType: (type: 'unit' | 'weight' | 'volume') => void;
  hasDiscount: boolean;
  setHasDiscount: (value: boolean) => void;
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  errors: FieldErrors<any>;
}

export interface FormValues {
  id?: string;
  name: string;
  description: string;
  catalog_group_id: string;
  item_type: 'unit' | 'weight' | 'volume';
  price: string;
  unit_of_measurement?: 'kg' | 'g';
  measure_interval?: string;
  min_weight?: string;
  max_weight?: string;
  priority: string;
  price_with_discount?: string;
  cost?: string;
  ncm_code?: string;
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
}


export interface CatalogItem {
  id: string;
  attributes: {
    name: string;
    description: string;
    catalog_group_id: string;
    item_type: 'unit' | 'weight' | 'volume';
    price: string;
    unit_of_measurement?: 'kg' | 'g';
    measure_interval?: string;
    min_weight?: string;
    max_weight?: string;
    priority: string;
    price_with_discount?: string;
    image_url?: string;
    cost?: string;
    ncm_code?: string;
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
  };
}

export interface UICatalogItem {
  id: string;
  attributes: {
    name: string;
    description: string;
    catalog_group_id: string;
    item_type: 'unit' | 'weight' | 'volume';
    price: string;
    unit_of_measurement?: 'kg' | 'g';
    measure_interval?: string;
    min_weight?: string;
    max_weight?: string;
    priority: number;
    image_url?: string;
    price_with_discount?: string;
    cost?: string;
    ncm_code?: string;
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
      data: Array<{
        id: string;
        type: string;
        attributes: {
          name: string;
          price: string;
        };
      }>;
    };
    prepare_method: {
      data: Array<{
        id: string;
        type: string;
        attributes: {
          name: string;
        };
      }>;
    };
    steps: {
      data: Array<{
        id: string;
        type: string;
        attributes: {
          name: string;
          options: {
            data: Array<{
              id: string;
              type: string;
              attributes: {
                name: string;
              };
            }>;
          };
        };
      }>;
    };
  };
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
  products?: UICatalogItem[];
}


export interface NewItemModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSuccess?: () => void;
  editingItem?: any;
  onDelete?: (id: string) => Promise<void>;
}
