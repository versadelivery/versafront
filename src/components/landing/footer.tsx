"use client";

import Link from "next/link";
import Image from "next/image";
import { Phone, Mail } from "lucide-react";
import logo from "../../../public/logo/logo-inline.svg";

const WHATSAPP_URL = "https://wa.me/5585991520090";

const productItems = [
  "Catálogo online",
  "Gestão de pedidos",
  "Painel administrativo",
  "PDV integrado",
  "Relatórios",
];

// ponytail: Central de ajuda, Blog e Status entram só quando as páginas existirem (pedido do cliente)
const helpLinks = [{ name: "Suporte", href: WHATSAPP_URL, external: true }];

const legalLinks = [
  { name: "Termos de uso", href: "/termos" },
  { name: "Política de privacidade", href: "/privacidade" },
  { name: "Política de cookies", href: "/privacidade#cookies" },
];

const linkClass = "text-[#858585] hover:text-white text-sm transition-colors";

const Footer = () => {
  return (
    <footer className="bg-[#1B1B1B] text-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-14 grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-5">
              <Image src={logo} alt="VersaDelivery" width={150} height={48} />
            </Link>
            <p className="text-[#858585] text-sm leading-relaxed mb-6 max-w-xs">
              Delivery para açougues com venda por peso.
            </p>
            <div className="space-y-3">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#858585] hover:text-white transition-colors text-sm"
              >
                <Phone className="w-4 h-4 text-[#009246]" />
                WhatsApp: +55 (85) 99152-0090
              </a>
              <a
                href="mailto:contato@versadelivery.com.br"
                className="flex items-center gap-2 text-[#858585] hover:text-white transition-colors text-sm"
              >
                <Mail className="w-4 h-4 text-[#009246]" />
                E-mail: contato@versadelivery.com.br
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Produto</h4>
            <ul className="space-y-2.5">
              {productItems.map((item) => (
                <li key={item} className="text-[#858585] text-sm">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Ajuda</h4>
            <ul className="space-y-2.5">
              {helpLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className={linkClass}>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 py-6 text-center">
          <p className="text-[#858585] text-sm">
            &copy; {new Date().getFullYear()} VersaDelivery. Todos os direitos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
