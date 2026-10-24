"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";

// ponytail: imagens ilustrativas do acervo atual, trocar por fotos finais do cliente
const steps = [
  {
    image: "/img/cesta.png",
    title: "O cliente acessa sua loja",
    description:
      "Compartilhe o link da loja pelo WhatsApp, Instagram ou outros canais. O cliente escolhe os produtos e monta o pedido.",
  },
  {
    image: "/img/picanha.jpg",
    title: "Você separa e pesa",
    description:
      "Quando necessário, registre o peso real e atualize o valor do produto.",
  },
  {
    image: "/img/peito-de-frango.jpg",
    title: "Você acompanha o pedido",
    description:
      "Gerencie o andamento do pedido e mantenha o cliente informado conforme os status disponíveis.",
  },
  {
    image: "/img/meat.png",
    title: "O pedido segue para entrega",
    description: "Organize a operação até a conclusão do pedido.",
  },
];

const HowItWorks = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <section id="como-funciona" ref={ref} className="py-20 md:py-28 bg-[#FFFDF6]">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="font-tomato inline-block text-[#009246] text-sm font-semibold tracking-wide uppercase mb-3">
            Como funciona
          </span>
          <h2 className="font-tomato text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#1B1B1B] tracking-tight">
            Do link ao pedido entregue
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
              className="bg-white rounded-2xl overflow-hidden hover:shadow-[0_2px_4px_-2px_rgba(27,27,27,.1),0_4px_8px_-2px_rgba(27,27,27,.14)] transition-shadow duration-300"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={step.image}
                  alt={step.title}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold text-[#1B1B1B] mb-1.5">
                  {index + 1}. {step.title}
                </h3>
                <p className="text-sm text-[#474747] leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
