"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Phone, Mail } from "lucide-react";
import logoFooter from "../../../public/img/logo.svg";
import Image from "next/image";

const Footer = () => {
  const contactInfo = [
    { icon: <Phone size={18} />, text: "+55 (11) 9999-9999" },
    { icon: <Mail size={18} />, text: "contato@versadelivery.com.br" }
  ];


  return (
    <footer className="bg-zinc-900 text-white pt-8 pb-8 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <div className="flex items-center gap-2">
                <Image src={logoFooter} alt="Versa Delivery" width={150} height={150} />
              </div>
            </Link>
            
            <p className="text-zinc-400 mb-6 max-w-md font-antarctican-mono">
              A plataforma de delivery que se adapta ao seu negócio, oferecendo flexibilidade
              e controle total para você e seus clientes.
            </p>
            
            <ul className="space-y-3">
              {contactInfo.map((item, index) => (
                <motion.li 
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center text-zinc-400 hover:text-primary transition-colors duration-200 font-antarctican-mono"
                >
                  <span className="mr-2 text-primary">{item.icon}</span>
                  {item.text}
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-zinc-800 pt-8 mt-8 text-center">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-zinc-500 mb-4 md:mb-0 font-antarctican-mono">
              &copy; {new Date().getFullYear()} Versa Delivery. Todos os direitos reservados.
            </p>
            <div className="flex space-x-4">
              <Link href="#termos" className="text-zinc-500 hover:text-primary transition-colors duration-200 font-antarctican-mono">
                Termos
              </Link>
              <Link href="#privacidade" className="text-zinc-500 hover:text-primary transition-colors duration-200 font-antarctican-mono">
                Privacidade
              </Link>
              <Link href="#cookies" className="text-zinc-500 hover:text-primary transition-colors duration-200 font-antarctican-mono">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;