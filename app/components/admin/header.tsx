"use client";

import { Button } from "@/app/components/ui/button";
import { LogOut, Menu, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/use-auth";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/app/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { useEffect } from "react";
import { useShop } from "@/app/hooks/use-shop";
import Image from "next/image";
import logo from "@/public/img/logo.svg";
import Link from "next/link";

export function Header() {
  const router = useRouter();
  const { logout } = useAuth();
  const { shop } = useShop();

  const handleSignOut = async () => {
    await logout();
  };

  useEffect(() => {
    console.log(shop);
  }, [shop]);

  return (
    <header className="bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5 text-white" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-black [&>button]:text-white">
                <SheetHeader>
                  <Link href="/admin" className="flex items-center gap-2">
                    <Image src={logo} alt="Logo" width={120} height={120} />
                  </Link>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-8">
                  <Button
                    variant="ghost"
                    className="font-outfit justify-start text-white hover:bg-white/10"
                    onClick={() => router.push("/admin/dashboard")}
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    className="font-outfit justify-start text-white hover:bg-white/10"
                    onClick={() => router.push("/admin/catalog")}
                  >
                    Catálogo
                  </Button>
                  <Button
                    variant="ghost"
                    className="font-outfit justify-start text-white hover:bg-white/10"
                    onClick={() => router.push("/admin/orders")}
                  >
                    Pedidos
                  </Button>
                  <Button
                    variant="ghost"
                    className="font-outfit justify-start text-white hover:bg-white/10"
                    onClick={() => router.push("/admin/settings")}
                  >
                    Configurações
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
            <Link href="/admin" className="hidden md:block">
              <Image src={logo} alt="Logo" width={120} height={120} />
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src={shop?.image_url} />
                <AvatarFallback className="bg-muted text-white">
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="font-outfit text-sm font-medium text-white">{shop?.name}</p>
                <p className="font-outfit text-xs text-white">{shop?.address}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="text-white hover:text-destructive"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}