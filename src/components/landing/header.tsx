"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import logo from "../../../public/logo/logo-inline-primary.svg";

const navLinks = [
  { name: "Como funciona", href: "como-funciona" },
  { name: "Recursos", href: "recursos" },
  { name: "Planos", href: "planos" },
  { name: "Indicação", href: "indicacao" },
  { name: "FAQ", href: "faq" },
];

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
      if (window.scrollY < 200) setActive("");
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    navLinks.forEach(({ href }) => {
      const el = document.getElementById(href);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    closeMenu();
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 bg-[#FFFDF6] transition-colors ${
        scrolled || isOpen ? "border-b border-[#E8E4DF]" : "border-b border-transparent"
      }`}
    >
      <nav
        aria-label="Principal"
        className="mx-auto flex h-16 max-w-[1200px] items-center gap-6 px-4 sm:px-6 lg:h-20 lg:px-8"
      >
        <Link href="/" className="shrink-0" aria-label="VersaDelivery, página inicial">
          <Image
            src={logo}
            alt="VersaDelivery"
            width={200}
            height={58}
            priority
            className="h-auto w-[140px] lg:w-[170px]"
          />
        </Link>

        <ul className="ml-4 hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <button
                onClick={() => scrollToSection(link.href)}
                aria-current={active === link.href ? "true" : undefined}
                className={`cursor-pointer whitespace-nowrap border-b-2 py-1 text-[15px] font-medium transition-colors ${
                  active === link.href
                    ? "border-[#009246] text-[#009246]"
                    : "border-transparent text-[#1B1B1B] hover:text-[#009246]"
                }`}
              >
                {link.name}
              </button>
            </li>
          ))}
        </ul>

        <div className="ml-auto hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="rounded-xl px-4 py-2.5 text-[15px] font-semibold text-[#1B1B1B] transition-colors hover:bg-[#F4F1EA]"
          >
            Conectar-se
          </Link>
          <Link
            href="/register"
            className="rounded-xl bg-[#1B1B1B] px-5 py-2.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#7ED957] hover:text-black"
          >
            Criar loja
          </Link>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={isOpen}
          aria-controls="menu-mobile"
          className="-mr-2 ml-auto cursor-pointer rounded-lg p-2 text-[#1B1B1B] hover:bg-[#F4F1EA] md:hidden"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {isOpen && (
        <div id="menu-mobile" className="border-t border-[#E8E4DF] bg-[#FFFDF6] md:hidden">
          <ul className="mx-auto max-w-[1200px] px-4 py-3 sm:px-6">
            {navLinks.map((link) => (
              <li key={link.href}>
                <button
                  onClick={() => scrollToSection(link.href)}
                  className="block w-full cursor-pointer rounded-lg px-3 py-3 text-left text-base font-medium text-[#1B1B1B] hover:bg-[#F4F1EA]"
                >
                  {link.name}
                </button>
              </li>
            ))}
          </ul>
          <div className="mx-auto grid max-w-[1200px] gap-2 border-t border-[#E8E4DF] px-4 py-4 sm:px-6">
            <Link
              href="/login"
              onClick={closeMenu}
              className="rounded-xl border border-[#1B1B1B] py-3 text-center text-base font-semibold text-[#1B1B1B]"
            >
              Conectar-se
            </Link>
            <Link
              href="/register"
              onClick={closeMenu}
              className="rounded-xl bg-[#1B1B1B] py-3 text-center text-base font-semibold text-white"
            >
              Criar loja
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
