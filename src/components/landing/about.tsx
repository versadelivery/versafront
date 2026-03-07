"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { ShoppingBag, Truck, BarChart3 } from "lucide-react";
import meat from "../../../public/img/meat_img.png";

const highlights = [
  {
    icon: <ShoppingBag className="w-6 h-6 text-[#009246]" />,
    title: "Catálogo flexível",
    description:
      "Venda por peso, por unidade ou como fizer sentido pro seu negócio. O cliente escolhe exatamente o que precisa.",
  },
  {
    icon: <Truck className="w-6 h-6 text-[#009246]" />,
    title: "Pedidos ao vivo",
    description:
      "Painel com atualização instantânea. Cada pedido aparece na hora, do recebimento até a entrega.",
  },
  {
    icon: <BarChart3 className="w-6 h-6 text-[#009246]" />,
    title: "Controle na sua mão",
    description:
      "Métricas, relatórios e gestão completa do seu negócio numa plataforma só.",
  },
];

const About = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section id="sobre" ref={ref} className="py-20 md:py-28 bg-[#FFFDF6]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="relative flex justify-center"
          >
            <div className="relative">
              <div className="absolute -inset-6 rounded-[2rem]" />
              <Image
                src={meat}
                alt="Produtos Versa Delivery"
                className="relative rounded-2xl w-full max-w-[450px]"
                width={450}
                height={350}
              />
              <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-md px-5 py-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-[#009246]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1B1B1B]">
                    +200 negócios
                  </p>
                  <p className="text-xs text-[#858585]">já usam o Versa</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="font-tomato inline-block text-[#009246] text-sm font-semibold tracking-wide uppercase mb-3">
              Sobre o Versa
            </span>
            <h2 className="font-tomato text-3xl sm:text-4xl font-semibold text-[#1B1B1B] tracking-tight leading-tight mb-5">
              Feito pra quem vende de verdade
            </h2>
            <p className="text-lg text-[#474747] leading-relaxed mb-8">
              O Versa é a plataforma que deixa seu cliente escolher como quer
              comprar: o peso do produto, a forma de entrega, tudo do jeito
              dele. Você monta a loja, recebe os pedidos e gerencia tudo num só
              lugar.
            </p>

            <div className="space-y-5">
              {highlights.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 15 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[#1B1B1B] mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[#474747] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
