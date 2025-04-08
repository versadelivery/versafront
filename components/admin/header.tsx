"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import logoHeader from "@/public/img/logo.svg";
import { useAuthContext } from "@/app/contexts/auth-context";
import { LogOut } from "lucide-react";

export function Header() {
  const { logout } = useAuthContext();

  return (
    <nav className="fixed w-full z-50 transition-all duration-300 bg-black backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex justify-start">
          <Link href="/">
            <Image src={logoHeader} alt="Versa" width={120} />
          </Link>
        </div>

        <div className="flex justify-end items-center gap-4">
          <div className="hidden md:block">
            <Button
              variant="outline"
              className="cursor-pointer rounded-none font-antarctican-mono bg-transparent border-white text-white hover:bg-white hover:text-black gap-2"
              onClick={logout}
              >
              <LogOut className="h-4 w-4" />
              LOGOUT
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}