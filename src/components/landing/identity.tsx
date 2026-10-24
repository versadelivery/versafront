"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const items = [
  {
    title: "Sua marca",
    description: "Coloque a logomarca e o nome da sua própria loja.",
  },
  {
    title: "Seus produtos",
    description:
      "Cadastre seus produtos com imagens, informações e modos de preparo personalizados.",
  },
  {
    title: "Seus clientes",
    description:
      "Ofereça ao seu cliente a experiência de balcão no conforto da casa dele.",
  },
  {
    title: "Sua entrega",
    description:
      "Você decide como entregar: defina horários, taxas de entrega e prioridades de rota. Você tem autonomia para gerenciar sua operação do seu jeito.",
  },
];

const Identity = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <section id="identidade" ref={ref} className="py-20 md:py-28 bg-[#FFFDF6]">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="font-tomato text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#1B1B1B] tracking-tight">
            Uma loja com a sua identidade
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6">
          {items.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
              className="bg-white rounded-2xl p-7 hover:shadow-[0_2px_4px_-2px_rgba(27,27,27,.1),0_4px_8px_-2px_rgba(27,27,27,.14)] transition-shadow duration-300"
            >
              <h3 className="text-xl font-semibold text-[#1B1B1B] mb-2">
                {item.title}
              </h3>
              <p className="text-base text-[#474747] leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Identity;
