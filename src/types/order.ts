export interface OrderAddress {
  address: string;
  neighborhood: string;
  complement?: string;
  reference?: string;
  shop_delivery_neighborhood?: string;
}

export interface OrderItem {
  catalog_item_id: number;
  quantity: number;
  observation?: string;
}

export interface OrderData {
  shop_id: number;
  withdrawal: boolean;
  payment_method: string;
  address: OrderAddress;
  items: OrderItem[];
}

export interface CreateOrderRequest {
  order: {
    shop_id: number;
    withdrawal: boolean;
    payment_method: 'manual_pix' | 'credit' | 'debit' | 'cash';
    address: {
      address: string;
      neighborhood: string;
      complement?: string;
      reference?: string;
      shop_delivery_neighborhood?: string;
    };
    items: OrderItem[];
  };
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: Address;
}

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface PaymentInfo {
  method: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'BANK_SLIP';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface Order {
  id: string;
  shop_id: number;
  withdrawal: boolean;
  payment_method: string;
  status: OrderStatus;
  address: {
    address: string;
    neighborhood: string;
    complement?: string;
    reference?: string;
  };
  items: OrderItem[];
  total: number;
  created_at: string;
  updated_at: string;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'delivered'
  | 'cancelled';

export interface ActionCableOrderData {
  id: string
  type: string
  attributes: {
    id: number
    status: string
    total_price: string
    total_items_price: string
    delivery_fee: string
    withdrawal: boolean
    payment_method: string
    created_at: string
    items: {
      data: Array<{
        id: string
        type: string
        attributes: {
          observation: string
          quantity: number
          price: string
          total_price: string
          item_type: string
          catalog_item: {
            data: {
              id: string
              type: string
              attributes: {
                name: string
                description: string
                item_type: string
                price: number
                price_with_discount: number | null
                measure_interval: number | null
                min_weight: number | null
                max_weight: number | null
                priority: number
                image_url: string
                extra: { data: any[] }
                prepare_method: { data: any[] }
                steps: { data: any[] }
              }
            }
          }
        }
      }>
    }
    address: {
      data: {
        id: string
        type: string
        attributes: {
          id: number
          address: string
          complement: string
          neighborhood: string
          reference: string
          shop_delivery_neighborhood: string | null
        }
      }
    }
    shop: {
      data: {
        id: string
        type: string
        attributes: {
          cellphone: string
          name: string
          slug: string
          address: string
          description: string
          image_url: string
        }
      }
    }
    customer: {
      data: {
        id: string
        type: string
        attributes: {
          id: number
          name: string
          email: string
          cellphone: string
        }
      }
    }
  }
}

export interface CableMessage {
  identifier: string
  message: {
    event: string
    data: {
      data: ActionCableOrderData
    }
  }
}

// Tipos para a API de pedidos do cliente
export interface CustomerOrderItem {
  id: string;
  type: "order_item";
  attributes: {
    observation: string;
    quantity: number;
    price: string;
    total_price: string;
    item_type: string;
    catalog_item: {
      data: {
        id: string;
        type: "catalog_item";
        attributes: {
          name: string;
          description: string;
          item_type: string;
          price: number;
          price_with_discount: number | null;
          measure_interval: number | null;
          min_weight: number | null;
          max_weight: number | null;
          priority: number;
          image_url: string;
          extra: {
            data: Array<{
              id: string;
              type: "catalog_item_extra";
              attributes: {
                name: string;
                price: string;
              };
            }>;
          };
          prepare_method: {
            data: Array<{
              id: string;
              type: "catalog_item_prepare_method";
              attributes: {
                name: string;
              };
            }>;
          };
          steps: {
            data: Array<{
              id: string;
              type: "catalog_item_step";
              attributes: {
                name: string;
                options: {
                  data: Array<{
                    id: string;
                    type: "catalog_item_step_option";
                    attributes: {
                      name: string;
                    };
                  }>;
                };
              };
            }>;
          };
        };
      };
    };
  };
}

export interface CustomerOrder {
  id: string;
  type: "order";
  attributes: {
    id: number;
    status: string;
    total_price: string | null;
    total_items_price: string | null;
    delivery_fee: string | null;
    withdrawal: boolean;
    payment_method: string;
    created_at: string;
    items: {
      data: CustomerOrderItem[];
    };
    address: {
      data: {
        id: string;
        type: "order_address";
        attributes: {
          id: number;
          address: string;
          complement: string;
          neighborhood: string;
          reference: string;
          shop_delivery_neighborhood: string | null;
        };
      } | null;
    };
    shop: {
      data: {
        id: string;
        type: "reduced_shop";
        attributes: {
          cellphone: string;
          name: string;
          slug: string;
          address: string;
          description: string;
          image_url: string;
        };
      };
    };
    customer: {
      data: {
        id: string;
        type: "customer";
        attributes: {
          id: number;
          name: string;
          email: string;
          cellphone: string;
        };
      };
    };
  };
}

export interface CustomerOrdersResponse {
  data: CustomerOrder[];
}