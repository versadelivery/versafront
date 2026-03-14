"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../../../public/logo/logo-inline-primary.svg";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => setIsOpen(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    closeMenu();
  };

  const navLinks = [
    { name: "Sobre", href: "sobre" },
    { name: "Recursos", href: "recursos" },
    { name: "FAQ", href: "faq" },
  ];

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-sm shadow-[0_1px_4px_rgba(0,0,0,.06)]"
          : "bg-transparent"
      }`}
    >
      <div className="w-full px-6 sm:px-10 lg:px-14 flex items-center h-[96px]">
        <Link href="/" className="flex-shrink-0 mr-6 lg:mr-12">
          <Image src={logo} alt="Versa Delivery" width={220} height={64} className="w-[180px] lg:w-[220px] h-auto" />
        </Link>

        <div className="hidden md:flex items-center gap-5 lg:gap-10">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollToSection(link.href)}
              className="font-tomato text-black hover:text-[#009246] hover:underline text-md font-bold transition-colors cursor-pointer whitespace-nowrap"
            >
              {link.name}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2 lg:gap-3 ml-auto">
          <Link href="/login">
            <button className="text-[#1B1B1B] text-[15px] hover:border border-black rounded-xl px-4 lg:px-6 py-2.5 font-semibold transition-opacity cursor-pointer whitespace-nowrap">
              Conectar-se
            </button>
          </Link>
          <Link href="/login">
            <button className="bg-[#1B1B1B] hover:bg-[#7ED957] text-white text-[15px] font-semibold px-4 lg:px-6 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap">
              Comece agora
            </button>
          </Link>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-[#1B1B1B] cursor-pointer ml-auto"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white border-t border-[#E8E4DF] overflow-hidden"
          >
            <div className="px-6 py-4 space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollToSection(link.href)}
                  className="font-tomato block w-full text-left text-[#1B1B1B] text-base font-semibold py-3 px-2 rounded-xl hover:bg-black/5 transition-colors cursor-pointer"
                >
                  {link.name}
                </button>
              ))}
              <div className="pt-4 space-y-2 border-t border-[#E8E4DF]">
                <Link href="/login" onClick={closeMenu} className="block">
                  <button className="w-full text-[#1B1B1B] text-base font-semibold py-3 rounded-xl border border-[#1B1B1B] transition-colors cursor-pointer">
                    Conectar-se
                  </button>
                </Link>
                <Link href="/login" onClick={closeMenu} className="block">
                  <button className="w-full bg-[#1B1B1B] hover:bg-[#7ED957] text-white text-base font-semibold py-3 rounded-xl transition-colors cursor-pointer">
                    Comece agora
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Header;
