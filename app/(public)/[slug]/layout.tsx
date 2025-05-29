import { ClientProvider } from "./client-context";
import { CartProvider } from "./cart/cart-context";

export default function SlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </ClientProvider>
  );
}