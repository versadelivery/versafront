export interface OrderAddress {
  address: string;
  neighborhood: string;
  complement?: string;
  reference?: string;
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