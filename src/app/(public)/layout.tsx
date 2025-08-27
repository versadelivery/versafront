import { ClientProvider } from "./[slug]/client-context";
import { CartProvider } from "./[slug]/cart/cart-context";
import { ShopStatusProvider } from "@/contexts/ShopStatusContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientProvider>
      <CartProvider>
        <ShopStatusProvider>
          {children}
        </ShopStatusProvider>
      </CartProvider>
    </ClientProvider>
  );
}