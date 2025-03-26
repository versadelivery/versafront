"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import logoGreen from "@/public/img/logo_green.svg"
import cesta from "@/public/img/cesta.png"

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="min-h-screen bg-[#f5f5f5] overflow-x-hidden">
      <Header alwaysOpaque={true} />

      <div className="max-w-7xl min-h-screen mx-auto lg:pr-24 pr-0 px-4 pt-24 pb-48 flex relative justify-center">
        <div className="hidden lg:block md:w-1/2 absolute lg:-left-60 -left-30 top-1/2 transform -translate-y-1/2">
          <Image
            src={cesta}
            width={800}
            alt="Grocery basket"
            className="rounded-lg object-cover"
          />
        </div>

        <div className="w-full md:w-1/2 flex flex-col justify-center lg:ml-auto lg:mr-0 mx-8">
          <div className="mb-12">
            <Image src={logoGreen} width={400} alt="Versa Delivery" className="w-[60vw]" />
            <p className="font-antarctican-mono text-foreground/40 text-lg font-bold md:-mt-4 -mt-2 md:ml-2 ml-0">Faça Login para Iniciar</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-foreground/40 font-bold mb-2">Email</label>
              <Input 
                type="email"
                placeholder="johndoe@mail.com"
                className="rounded-sm bg-transparent w-full p-8 border placeholder:text-foreground/40"
              />
            </div>

            <div>
              <label className="block text-foreground/40 font-bold mb-2">Senha</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  className="rounded-sm bg-transparent w-full p-8 border pr-10 placeholder:text-foreground/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  <Eye className="h-5 w-5 mr-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-foreground/40 font-regular -mt-4">
                Ainda não se cadastrou? {' '}
                <Link href="/register" className="font-semibold underline hover:text-foreground/60">
                  {' '} Cadastre-se agora
                </Link>
              </p>
              <Link href="#" className="font-antarctican-mono font-bold text-primary hover:underline">
                Esqueci minha senha
              </Link>
            </div>

            <Button className="font-antarctican-mono rounded-none cursor-pointer w-80 text-lg font-bold bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white p-8">
              ACESSAR
            </Button>
          </div>
        </div>
      </div>

      <Footer/>
    </main>
  );
}