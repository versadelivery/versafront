import { ClientProvider } from "./[slug]/client-context";
import { CartProvider } from "./[slug]/cart/cart-context";
import { ShopStatusProvider } from "@/contexts/ShopStatusContext";
import { Footer } from "@/components/footer";

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
          <Footer />
        </ShopStatusProvider>
      </CartProvider>
    </ClientProvider>
  );
}