"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { DeliveryWindow, KdsWindow, StorePhone, WeighWindow } from "./app-mockups";

const steps = [
  {
    visual: <StorePhone />,
    title: "O cliente acessa sua loja",
    description:
      "Compartilhe o link da loja pelo WhatsApp, Instagram ou outros canais. O cliente escolhe os produtos e monta o pedido.",
  },
  {
    visual: <WeighWindow />,
    title: "Você separa e pesa",
    description:
      "Quando necessário, registre o peso real e atualize o valor do produto.",
  },
  {
    visual: <KdsWindow />,
    title: "Você acompanha o pedido",
    description:
      "Gerencie o andamento do pedido e mantenha o cliente informado conforme os status disponíveis.",
  },
  {
    visual: <DeliveryWindow />,
    title: "O pedido segue para entrega",
    description: "Organize a operação até a conclusão do pedido.",
  },
];

const HowItWorks = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.05 });

  return (
    <section id="como-funciona" ref={ref} className="scroll-mt-24 bg-[#FFFDF6] py-16 md:py-24">
      <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center md:mb-16"
        >
          <h2 className="font-tomato text-3xl font-semibold tracking-tight text-[#1B1B1B] sm:text-4xl lg:text-5xl">
            Como funciona
          </h2>
        </motion.div>

        <ol className="space-y-12 md:space-y-20">
          {steps.map((step, index) => (
            <motion.li
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="grid items-center gap-6 md:grid-cols-2 md:gap-14"
            >
              <div className={index % 2 === 1 ? "md:order-2" : ""}>
                <span className="mb-4 grid size-10 place-items-center rounded-full bg-[#009246] text-base font-semibold text-white">
                  {index + 1}
                </span>
                <h3 className="font-tomato mb-3 text-2xl font-semibold text-[#1B1B1B] sm:text-3xl">
                  {step.title}
                </h3>
                <p className="max-w-md text-base leading-relaxed text-[#474747] sm:text-lg">
                  {step.description}
                </p>
              </div>
              <div className="rounded-3xl bg-[#7ED957] p-5 sm:p-8">{step.visual}</div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default HowItWorks;
