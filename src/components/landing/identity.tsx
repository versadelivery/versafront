"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Store, Package, Users, Truck } from "lucide-react";
import { BrandCard } from "./app-mockups";

const items = [
  {
    icon: Store,
    title: "Sua marca",
    description: "Coloque a logomarca e o nome da sua própria loja.",
  },
  {
    icon: Package,
    title: "Seus produtos",
    description:
      "Cadastre seus produtos com imagens, informações e modos de preparo personalizados.",
  },
  {
    icon: Users,
    title: "Seus clientes",
    description:
      "Ofereça ao seu cliente a experiência de balcão no conforto da casa dele.",
  },
  {
    icon: Truck,
    title: "Sua entrega",
    description:
      "Você decide como entregar: defina horários, taxas de entrega e prioridades de rota. Você tem autonomia para gerenciar sua operação do seu jeito.",
  },
];

const Identity = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <section id="identidade" ref={ref} className="scroll-mt-24 bg-[#FFFDF6] py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="font-tomato mb-8 text-3xl font-semibold tracking-tight text-[#1B1B1B] sm:text-4xl lg:text-5xl"
            >
              Uma loja com a sua identidade
            </motion.h2>
            <ul className="space-y-6">
              {items.map(({ icon: Icon, title, description }, index) => (
                <motion.li
                  key={title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
                  className="flex gap-4"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#F1FBE9] text-[#009246]">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-[#1B1B1B]">{title}</h3>
                    <p className="text-base leading-relaxed text-[#474747]">{description}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl bg-[#EEF8E8] p-5 sm:p-10">
            <BrandCard />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Identity;
