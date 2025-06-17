import { ClientProvider } from "./[slug]/client-context";
import { CartProvider } from "./[slug]/cart/cart-context";

export default function RootLayout({
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