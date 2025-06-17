"use client";

import { Button } from "@/components/ui/button";
import { LogOut, Menu, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useShop } from "@/hooks/use-shop";
import Image from "next/image";
import logo_inline from "../../../public/logo/logo-inline-black.svg";
import Link from "next/link";

export function Header() {
  const router = useRouter();
  const { logout } = useAuth();
  const { shop } = useShop();

  const handleSignOut = async () => {
    await logout();
  };

  return (
    <header className="bg-muted">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center justify-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5 text-black" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-white [&>button]:text-black">
                <SheetHeader>
                  <Link href="/admin" className="flex items-center gap-2">
                    <Image src={logo_inline} alt="Logo" width={120} height={120} />
                  </Link>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-8">
                  <Button
                    variant="ghost"
                    className="font-outfit justify-start text-black hover:bg-black/10"
                    onClick={() => router.push("/admin/dashboard")}
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    className="font-outfit justify-start text-black hover:bg-black/10"
                    onClick={() => router.push("/admin/catalog")}
                  >
                    Catálogo
                  </Button>
                  <Button
                    variant="ghost"
                    className="font-outfit justify-start text-black hover:bg-black/10"
                    onClick={() => router.push("/admin/orders")}
                  >
                    Pedidos
                  </Button>
                  <Button
                    variant="ghost"
                    className="font-outfit justify-start text-black hover:bg-black/10"
                    onClick={() => router.push("/admin/settings")}
                  >
                    Configurações
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
            <Link href="/admin" className="hidden md:block">
              <Image src={logo_inline} alt="Logo" width={190} height={190} />
            </Link>
          </div>

          <div className="flex items-center gap-12">
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src={shop?.image_url} />
                <AvatarFallback className="bg-muted text-black">
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="font-outfit text-sm font-medium text-black">{shop?.name}</p>
                <p className="font-outfit text-xs text-black">{shop?.address}</p>
              </div>
            </div>
            <Button
              variant="destructive"
              size="default"
              onClick={handleSignOut}
              className="text-white bg-destructive hover:bg-destructive/80 transition-all duration-500 font-outfit px-6 py-2 rounded-xs"
            >
              Sair
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}