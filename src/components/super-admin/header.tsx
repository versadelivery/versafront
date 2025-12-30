"use client";

import { Button } from "@/components/ui/button";
import { LogOut, Menu, User, BarChart3, Settings, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { removeSuperAdminToken } from "@/lib/auth";
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import logo_inline from "../../../public/logo/logo-inline-black.svg";
import Link from "next/link";

export function SuperAdminHeader() {
  const router = useRouter();

  const handleSignOut = () => {
    removeSuperAdminToken();
    router.push("/super-admin/login");
  };

  const navigationItems = [
    {
      href: "/super-admin",
      label: "Dashboard",
      icon: BarChart3
    },
    {
      href: "/super-admin/merchants",
      label: "Lojistas",
      icon: Users
    },
    {
      href: "/super-admin/reports",
      label: "Relatórios",
      icon: BarChart3
    },
    {
      href: "/super-admin/settings",
      label: "Configurações",
      icon: Settings
    }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto">
        <div className="flex h-16 items-center justify-between px-4">
          {/* Mobile Menu */}
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5 text-black" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-white [&>button]:text-black">
                <SheetHeader>
                  <Link href="/super-admin" className="flex items-center gap-2">
                    <Image src={logo_inline} alt="Logo" width={120} height={120} />
                  </Link>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-8">
                  {navigationItems.map((item) => (
                    <Button
                      key={item.href}
                      variant="ghost"
                      className="font-outfit justify-start text-black hover:bg-black/10"
                      onClick={() => router.push(item.href)}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Button>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            
            <Link href="/super-admin" className="hidden md:block">
              <Image src={logo_inline} alt="Logo" width={190} height={190} />
            </Link>
            
            {/* Desktop Menu */}
            <nav className="hidden md:flex items-center gap-6 ml-8">
              {navigationItems.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  className="font-outfit text-black hover:bg-black/10"
                  onClick={() => router.push(item.href)}
                >
                  {item.label}
                </Button>
              ))}
            </nav>
          </div>
          
          {/* User Info and Logout */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src="" />
                <AvatarFallback className="bg-muted text-black">
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="font-outfit text-sm font-medium text-black">Super Admin</p>
              </div>
            </div>
            <Button
              variant="destructive"
              size="default"
              onClick={handleSignOut}
              className="text-white bg-destructive hover:bg-destructive/80 transition-all duration-500 font-outfit px-6 py-2 rounded-xs"
            >
              Sair
              <LogOut className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}