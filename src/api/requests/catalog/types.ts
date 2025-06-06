interface CatalogGroup {
  id: string;
  type: 'catalog_group';
  attributes: {
    name: string;
    description: string;
    priority: number;
    image_url: string | null;
    items: {
      data: CatalogItem;
    }[];
  };
}

export interface CatalogResponse {
  data: CatalogGroup[];
}

