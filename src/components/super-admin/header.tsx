"use client";

import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { removeSuperAdminToken } from "@/lib/auth";
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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto">
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/super-admin">
            <Image src={logo_inline} alt="Logo" width={190} height={190} />
          </Link>

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