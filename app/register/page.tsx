"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import logoGreen from "@/public/img/logo_green.svg";
import cesta from "@/public/img/breads.png";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    storeName: "",
    storePhone: "",
    userName: "",
    userEmail: "",
    userPassword: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
  };

  const nextStep = () => setStep(2);
  const prevStep = () => setStep(1);

  return (
    <main className="min-h-screen bg-[#f5f5f5] overflow-x-hidden">
      <Header alwaysOpaque={true} />

      <div className="max-w-7xl min-h-screen mx-auto px-4 pt-24 pb-48 flex relative lg:justify-start justify-center">
        <div className="w-full md:w-1/2 flex flex-col justify-center lg:mx-0 mx-8 lg:pl-24 pl-0">
          <div className="mb-12">
            <Image src={logoGreen} width={400} alt="Versa Delivery" className="w-[60vw]" />
            <p className="font-antarctican-mono text-foreground/40 text-lg font-bold md:-mt-4 -mt-2 md:ml-2 ml-0">Cadastre-se na plataforma</p>
          </div>

          <Breadcrumb className="mb-8 font-antarctican-mono">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink 
                  href="#" 
                  onClick={prevStep}
                  className={`font-bold text-xl ${step === 1 ? "font-bold text-primary" : "text-foreground/40"}`}
                >
                  Estabelecimento
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink 
                  href="#" 
                  onClick={nextStep}
                  className={`font-bold text-xl ${step === 2 ? "font-bold text-primary" : "text-foreground/40"}`}
                >
                  Dados Pessoais
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 ? (
              <>
                <div>
                  <label className="block text-foreground/40 font-bold mb-2">Nome da Loja</label>
                  <Input 
                    type="text"
                    name="storeName"
                    value={formData.storeName}
                    onChange={handleChange}
                    placeholder="Minha Loja"
                    className="rounded-sm bg-transparent w-full p-8 border placeholder:text-foreground/40"
                    required
                  />
                </div>

                <div>
                  <label className="block text-foreground/40 font-bold mb-2">Telefone da Loja</label>
                  <Input 
                    type="tel"
                    name="storePhone"
                    value={formData.storePhone}
                    onChange={handleChange}
                    placeholder="(00) 00000-0000"
                    className="rounded-sm bg-transparent w-full p-8 border placeholder:text-foreground/40"
                    required
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-foreground/40 font-regular -mt-4">
                    Já tem uma conta? {' '}
                    <Link href="/login" className="font-semibold underline">
                      {' '} Faça login
                    </Link>
                  </p>
                  <Link href="#" className="font-antarctican-mono font-bold text-primary hover:underline">
                    Esqueci minha senha
                  </Link>
                </div>

                <Button 
                  type="button"
                  onClick={nextStep}
                  className="font-antarctican-mono rounded-none cursor-pointer w-80 text-lg font-bold bg-transparent border-2 border-foreground/40 text-foreground/40 hover:border-none hover:bg-foreground/40 hover:text-white p-8 flex items-center gap-2"
                >
                  Próximo <ArrowRight className="h-5 w-5" />
                </Button>

              </>
            ) : (
              <>
                <div>
                  <label className="block text-foreground/40 font-bold mb-2">Seu Nome</label>
                  <Input 
                    type="text"
                    name="userName"
                    value={formData.userName}
                    onChange={handleChange}
                    placeholder="João da Silva"
                    className="rounded-sm bg-transparent w-full p-8 border placeholder:text-foreground/40"
                    required
                  />
                </div>

                <div>
                  <label className="block text-foreground/40 font-bold mb-2">Seu Email</label>
                  <Input 
                    type="email"
                    name="userEmail"
                    value={formData.userEmail}
                    onChange={handleChange}
                    placeholder="johndoe@mail.com"
                    className="rounded-sm bg-transparent w-full p-8 border placeholder:text-foreground/40"
                    required
                  />
                </div>

                <div>
                  <label className="block text-foreground/40 font-bold mb-2">Senha</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="userPassword"
                      value={formData.userPassword}
                      onChange={handleChange}
                      placeholder="********"
                      className="rounded-sm bg-transparent w-full p-8 border pr-10 placeholder:text-foreground/40"
                      required
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
                    Já tem uma conta? {' '}
                    <Link href="login" className="font-semibold underline hover:text-foreground/60">
                      {' '} Faça login
                    </Link>
                  </p>
                  <Link href="#" className="font-antarctican-mono font-bold text-primary hover:underline">
                    Esqueci minha senha
                  </Link>
                </div>

                <Button 
                  type="submit"
                  className="font-antarctican-mono rounded-none cursor-pointer w-80 text-lg font-bold bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white p-8"
                >
                  CADASTRAR
                </Button>
              </>
            )}
          </form>
        </div>

        <div className="hidden lg:block md:w-1/2 absolute -right-40 top-1/2 transform -translate-y-1/2">
          <Image 
            src={cesta}
            width={900}
            alt="Grocery basket"
            className="rounded-lg object-cover"
          />
        </div>
      </div>

      <Footer/>
    </main>
  );
}