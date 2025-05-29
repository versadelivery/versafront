"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { 
  Menu, 
  X, 
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import logoHeader from "@/public/img/logo.svg";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
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
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

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
    closeMenu();
  };

  const navLinks = [
    { name: "HOME", href: "#home" },
    { name: "SOBRE", href: "#sobre" },
    { name: "RECURSOS", href: "#recursos" },
    { name: "FAQ", href: "#faq" },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? "bg-black/80 backdrop-blur-sm" : "bg-transparent backdrop-blur-sm"}`}>
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex justify-start">
          <Link href="/">
            <Image src={logoHeader} alt="Versa" width={120} />
          </Link>
        </div>

        <div className="font-antarctican-mono hidden md:flex justify-center gap-8">
          {navLinks.map((link, index) => (
            <Button 
              key={index}
              onClick={() => scrollToSection(link.href.replace('#', ''))}
              className="cursor-pointer bg-transparent hover:bg-transparent text-white hover:text-gray-300"
            >
              {link.name}
            </Button>
          ))}
        </div>

        <div className="flex justify-end items-center gap-4">
          <div className="hidden md:block">
            <Link href="/login">
              <Button
                variant="outline"
                className="w-full font-antarctican-mono bg-transparent border-white text-white hover:bg-white hover:text-black text-lg font-semibold py-5 px-8 rounded-xs shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 group"
              >
                ASSINE AGORA
              </Button>
            </Link>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleMenu}
            className="bg-transparent md:hidden text-white mr-8"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden bg-black/95 backdrop-blur-md"
        >
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              {navLinks.map((link, index) => (
                <Button 
                  key={index}
                  onClick={() => scrollToSection(link.href.replace('#', ''))}
                  className="bg-transparent text-white hover:text-gray-300 text-lg font-medium transition-colors py-2 text-left"
                >
                  {link.name}
                </Button>
              ))}
              <Link href="/login" onClick={closeMenu}>
                <Button 
                  variant="outline" 
                  className="rounded-none bg-transparent border-white text-white hover:bg-white hover:text-black w-full py-6 text-lg mt-4"
                >
                  ASSINE AGORA
                </Button>
              </Link>
            </nav>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Header;