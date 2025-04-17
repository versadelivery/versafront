"use client";

import { useEffect, useState } from "react";
import { Button } from "@/app/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/app/components/ui/drawer";
import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import logoHeader from "@/public/img/logo.svg";

interface HeaderProps {
  alwaysOpaque?: boolean;
}

export function Header({ alwaysOpaque = false }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth'
      });
      
      if (sectionId === 'sobre') {
        setTimeout(() => {
          window.scrollBy({
            top: -20,
            behavior: 'smooth'
          });
        }, 500);
      }
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  });

  const isOpaque = alwaysOpaque || scrolled;

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isOpaque ? "bg-black/80 backdrop-blur-sm" : "bg-transparent backdrop-blur-sm"}`}>
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex justify-start">
          <Link href="/">
            <Image src={logoHeader} alt="Versa" width={120} />
          </Link>
        </div>

        <div className="font-antarctican-mono hidden md:flex justify-center gap-8">
          <Button 
            onClick={() => scrollToSection('home')} 
            className="cursor-pointer bg-transparent hover:bg-transparent text-white hover:text-gray-300"
          >
            HOME
          </Button>
          <Button 
            onClick={() => scrollToSection('sobre')} 
            className="cursor-pointer bg-transparent hover:bg-transparent text-white hover:text-gray-300"
          >
            SOBRE
          </Button>
        </div>

        <div className="flex justify-end items-center gap-4">
          <div className="hidden md:block">
            <Link href="/login">
              <Button
                variant="outline"
                className="cursor-pointer rounded-none font-antarctican-mono bg-transparent border-white text-white hover:bg-white hover:text-black"
                >
                ASSINE AGORA
              </Button>
            </Link>
          </div>
          
          <Drawer direction="right">
            <DrawerTrigger asChild>
              <Button className="bg-transparent md:hidden text-white mr-8">
                <Menu />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="h-full top-0 right-0 left-auto mt-0 w-[300px] rounded-none bg-black/95 border-l border-gray-800">
              <div className="flex flex-col h-full p-6">
                <DrawerHeader className="px-0 pt-0">
                  <DrawerTitle className="text-white text-2xl">Menu</DrawerTitle>
                </DrawerHeader>
                
                <div className="flex-1 flex flex-col gap-6 mt-24">
                  <DrawerClose asChild>
                  <Button 
                      onClick={() => scrollToSection('home')}
                      className="bg-transparent text-white hover:text-gray-300 text-lg font-medium transition-colors py-2 text-left"
                    >
                      HOME
                    </Button>
                  </DrawerClose>
                  
                  <DrawerClose asChild>
                    <Button 
                      onClick={() => scrollToSection('sobre')}
                      className="bg-transparent text-white hover:text-gray-300 text-lg font-medium transition-colors py-2 text-left"
                    >
                      SOBRE
                    </Button>
                  </DrawerClose>
                </div>
                
                <DrawerFooter className="mb-80 px-0 pb-0">
                  <DrawerClose asChild>
                    <Button 
                      variant="outline" 
                      className="rounded-none bg-transparent border-white text-white hover:bg-white hover:text-black w-full py-6 text-lg mt-4"
                    >
                      ASSINE AGORA
                    </Button>
                  </DrawerClose>
                </DrawerFooter>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </nav>
  );
}