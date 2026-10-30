import { CatalogItemResponse } from "../catalog_item/types";

interface CatalogGroup {
  id: string;
  type: 'catalog_group';
  attributes: {
    name: string;
    active: boolean;
    description: string;
    priority: number;
    items: {
      data: CatalogItemResponse[];
    };
  };
}

export interface CatalogResponse {
  data: CatalogGroup[];
}

