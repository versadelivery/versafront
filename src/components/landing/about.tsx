"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Scale, RefreshCw, MessageCircle } from "lucide-react";
import { WeightCompare } from "./app-mockups";

const highlights = [
  {
    icon: Scale,
    title: "Venda por peso",
    description: "O cliente informa a quantidade desejada e o lojista registra o peso real.",
  },
  {
    icon: RefreshCw,
    title: "Atualização do pedido",
    description: "O peso e o valor são ajustados conforme a pesagem.",
  },
  {
    icon: MessageCircle,
    title: "Mais clareza na compra",
    description:
      "O cliente acompanha as informações atualizadas do pedido conforme o fluxo da loja.",
  },
];

const About = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <section id="sobre" ref={ref} className="scroll-mt-24 bg-white py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <span className="font-tomato mb-3 inline-block text-sm font-semibold uppercase tracking-wide text-[#009246]">
              Venda por peso
            </span>
            <h2 className="font-tomato mb-5 text-3xl font-semibold leading-tight tracking-tight text-[#1B1B1B] sm:text-4xl">
              Quem compra quer clareza e praticidade. Quem vende quer agilidade e controle.
            </h2>
            <p className="text-base leading-relaxed text-[#474747] sm:text-lg">
              No delivery de carnes, o peso solicitado pode ser diferente do peso
              real da peça. O cliente precisa saber quanto será cobrado, e o
              lojista precisa administrar os pedidos sem depender de conversas
              compridas.
            </p>
            <p className="mt-4 text-base leading-relaxed text-[#474747] sm:text-lg">
              Com o VersaDelivery, o cliente faz o pedido pela loja online e o
              estabelecimento atualiza o peso real e o valor após a pesagem.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-3xl bg-[#EEF8E8] p-5 sm:p-10"
          >
            <WeightCompare />
          </motion.div>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3 md:gap-6">
          {highlights.map(({ icon: Icon, title, description }, index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
              className="rounded-2xl border border-[#E8E4DF] bg-[#FFFDF6] p-6"
            >
              <span className="mb-4 grid size-11 place-items-center rounded-xl bg-[#F1FBE9] text-[#009246]">
                <Icon className="size-5" />
              </span>
              <h3 className="mb-1.5 text-lg font-semibold text-[#1B1B1B]">{title}</h3>
              <p className="text-base leading-relaxed text-[#474747]">{description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
