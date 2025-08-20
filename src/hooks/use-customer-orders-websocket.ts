import { useEffect, useState, useCallback, useRef } from 'react';
import { createCustomerOrdersCableWithToken } from '@/lib/customer-orders-cable';
import { CustomerOrder } from '@/types/order';

export function useCustomerOrdersWebSocket() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const cableRef = useRef<any>(null);
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    const cable = createCustomerOrdersCableWithToken();
    if (cable) {
      cableRef.current = cable;
      setIsConnected(true);
    } else {
      console.error('Falha ao criar cable')
      setIsLoading(false);
    }

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
      if (cableRef.current) {
        cableRef.current.disconnect();
        setIsConnected(false);
      }
    };
  }, []);

  const subscribeToOrders = useCallback((onData: (data: CustomerOrder[]) => void) => {
    
    if (!cableRef.current) {
      console.error('Customer Orders Cable não está conectado');
      setIsLoading(false);
      return () => {};
    }

    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    subscriptionRef.current = cableRef.current.subscriptions.create(
      {
        channel: "CustomerOrdersChannel"
      },
      {
        received: (payload: any) => {
          
          if (!payload?.event) {
            console.warn('⚠️ Payload sem evento:', payload);
            return;
          }

          // Evento inicial
          if (payload.event === "initial_customer_orders_data") {
            const ordersData = Array.isArray(payload.data.data) ? payload.data.data : [payload.data.data];
            onData(ordersData);
            setIsLoading(false);
          }

          // Evento de atualização
          if (payload.event === "orders_updated") {
            const ordersData = Array.isArray(payload.data.data) ? payload.data.data : [payload.data.data];
            onData(ordersData);
          }
        },
        connected: () => {
          setIsConnected(true);
        },
        disconnected: () => {
          setIsConnected(false);
        },
        rejected: () => {
          console.error('Subscrição Customer Orders rejeitada - verifique autenticação');
          setIsConnected(false);
          setIsLoading(false);
        }
      }
    );

    // Timeout para parar o loading se não receber dados em 10 segundos
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 10000);

    return () => {
      clearTimeout(timeout);
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, []);

  return {
    orders,
    setOrders,
    isConnected,
    isLoading,
    subscribeToOrders
  };
}
