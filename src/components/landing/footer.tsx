"use client";

import Link from "next/link";
import Image from "next/image";
import { Phone, Mail } from "lucide-react";
import logo from "../../../public/logo/logo-inline.svg";

const productLinks = [
  { name: "Catálogo online", href: "#recursos" },
  { name: "Gestão de pedidos", href: "#recursos" },
  { name: "Venda por peso", href: "#recursos" },
  { name: "Painel admin", href: "#recursos" },
  { name: "PDV integrado", href: "#recursos" },
];

const resourceLinks = [
  { name: "Central de ajuda", href: "#" },
  { name: "Blog", href: "#" },
  { name: "Suporte", href: "#" },
  { name: "Status da plataforma", href: "#" },
];

const legalLinks = [
  { name: "Termos de uso", href: "#termos" },
  { name: "Privacidade", href: "#privacidade" },
  { name: "Cookies", href: "#cookies" },
];

const Footer = () => {
  return (
    <footer className="bg-[#1B1B1B] text-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-14 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="inline-block mb-5">
              <Image
                src={logo}
                alt="Versa Delivery"
                width={150}
                height={48}
              />
            </Link>
            <p className="text-[#858585] text-sm leading-relaxed mb-6 max-w-xs">
              A plataforma de delivery que se adapta ao seu negócio. Flexibilidade
              e controle total pra você e seus clientes.
            </p>
            <div className="space-y-3">
              <a
                href="tel:+5511999999999"
                className="flex items-center gap-2 text-[#858585] hover:text-white transition-colors text-sm"
              >
                <Phone className="w-4 h-4 text-[#009246]" />
                +55 (11) 9999-9999
              </a>
              <a
                href="mailto:contato@versadelivery.com.br"
                className="flex items-center gap-2 text-[#858585] hover:text-white transition-colors text-sm"
              >
                <Mail className="w-4 h-4 text-[#009246]" />
                contato@versadelivery.com.br
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Produto</h4>
            <ul className="space-y-2.5">
              {productLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-[#858585] hover:text-white text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Recursos</h4>
            <ul className="space-y-2.5">
              {resourceLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-[#858585] hover:text-white text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-[#858585] hover:text-white text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#858585] text-sm">
            &copy; {new Date().getFullYear()} Versa Delivery. Todos os direitos
            reservados.
          </p>
          <div className="flex items-center gap-1">
            <span className="text-[#858585] text-xs">Feito com</span>
            <span className="text-[#009246] text-xs mx-0.5">●</span>
            <span className="text-[#858585] text-xs">no Brasil</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
