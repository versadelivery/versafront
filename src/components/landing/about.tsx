"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { ShoppingBag, Truck, BarChart3, Zap, Users, Shield } from "lucide-react";
import cesta from "../../../public/img/cesta.png";

const highlights = [
  {
    icon: <ShoppingBag className="w-7 h-7 text-[#009246]" />,
    title: "Catálogo flexível",
    description:
      "Venda por peso, por unidade ou como fizer sentido pro seu negócio. O cliente escolhe exatamente o que precisa, na quantidade que quiser. Monte combos, adicione complementos e variações sem complicação.",
  },
  {
    icon: <Truck className="w-7 h-7 text-[#009246]" />,
    title: "Pedidos ao vivo",
    description:
      "Painel com atualização instantânea via WebSocket. Cada pedido aparece na hora, do recebimento até a entrega. Acompanhe o status, notifique o cliente e gerencie tudo em tempo real.",
  },
  {
    icon: <BarChart3 className="w-7 h-7 text-[#009246]" />,
    title: "Controle na sua mão",
    description:
      "Métricas, relatórios detalhados e gestão completa do seu negócio numa plataforma só. Saiba quais produtos mais vendem, qual horário tem mais movimento e onde investir.",
  },
  {
    icon: <Zap className="w-7 h-7 text-[#009246]" />,
    title: "PDV integrado",
    description:
      "Ponto de venda direto no painel. Registre vendas no balcão, controle o caixa e unifique tudo no mesmo sistema — sem precisar de outro software.",
  },
  {
    icon: <Users className="w-7 h-7 text-[#009246]" />,
    title: "Gestão de clientes",
    description:
      "Histórico de pedidos, preferências e dados de cada cliente organizados automaticamente. Conheça quem compra de você e fidelize com cupons e promoções direcionadas.",
  },
  {
    icon: <Shield className="w-7 h-7 text-[#009246]" />,
    title: "Sem taxas por pedido",
    description:
      "Diferente dos marketplaces, o Versa não cobra comissão sobre suas vendas. Plano fixo, sem surpresas. O lucro é todo seu.",
  },
];

const About = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <section id="sobre" ref={ref} className="bg-[#FFFDF6]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Imagem sticky */}
          <div className="hidden lg:block relative">
            <div className="sticky top-[26vh] -translate-x-4">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6 }}
                className="relative flex justify-center"
              >
                <div className="relative">
                  <Image
                    src={cesta}
                    alt="Produtos Versa Delivery"
                    className="relative rounded-2xl w-full max-w-[500px]"
                    width={500}
                    height={400}
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
            </div>
          </div>

          {/* Imagem mobile (não sticky) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="lg:hidden relative flex justify-center pt-20"
          >
            <div className="relative">
              <Image
                src={cesta}
                alt="Produtos Versa Delivery"
                className="relative rounded-2xl w-full max-w-[400px]"
                width={400}
                height={320}
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

          {/* Conteúdo que rola */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="py-20 md:py-32"
          >
            <span className="font-tomato inline-block text-[#009246] text-sm font-semibold tracking-wide uppercase mb-4">
              Sobre o Versa
            </span>
            <h2 className="font-tomato text-4xl sm:text-5xl font-semibold text-[#1B1B1B] tracking-tight leading-tight mb-6">
              Feito pra quem vende de verdade
            </h2>
            <p className="text-xl text-[#474747] leading-relaxed mb-12">
              O Versa é a plataforma que deixa seu cliente escolher como quer
              comprar: o peso do produto, a forma de entrega, tudo do jeito
              dele. Você monta a loja, recebe os pedidos e gerencia tudo num só
              lugar.
            </p>

            <div className="space-y-10">
              {highlights.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                  className="flex gap-5"
                >
                  <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#1B1B1B] mb-1.5">
                      {item.title}
                    </h3>
                    <p className="text-base text-[#474747] leading-relaxed">
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
