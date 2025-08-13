import { ClientProvider } from "../(public)/[slug]/client-context";
import { CartProvider } from "../(public)/[slug]/cart/cart-context";

export default function AuthLayout({
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
