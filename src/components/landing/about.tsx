"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Scale, RefreshCw, MessageCircle } from "lucide-react";

const highlights = [
  {
    icon: <Scale className="w-7 h-7 text-[#009246]" />,
    title: "Venda por peso",
    description: "O cliente informa a quantidade desejada e o lojista registra o peso real.",
  },
  {
    icon: <RefreshCw className="w-7 h-7 text-[#009246]" />,
    title: "Atualização do pedido",
    description: "O peso e o valor são ajustados conforme a pesagem.",
  },
  {
    icon: <MessageCircle className="w-7 h-7 text-[#009246]" />,
    title: "Mais clareza na compra",
    description:
      "O cliente acompanha as informações atualizadas do pedido conforme o fluxo da loja.",
  },
];

const About = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <section id="sobre" ref={ref} className="py-20 md:py-28 bg-[#FFFDF6]">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="font-tomato inline-block text-[#009246] text-sm font-semibold tracking-wide uppercase mb-4">
            Venda por peso
          </span>
          <h2 className="font-tomato text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#1B1B1B] tracking-tight leading-tight mb-6">
            Quem compra quer clareza e praticidade. Quem vende quer agilidade e
            controle.
          </h2>
          <p className="text-lg text-[#474747] leading-relaxed max-w-3xl mx-auto">
            No delivery de carnes, o peso solicitado pode ser diferente do peso
            real da peça. O cliente precisa saber quanto será cobrado, e o
            lojista precisa administrar os pedidos sem depender de conversas
            compridas.
          </p>
          <p className="text-lg text-[#474747] leading-relaxed max-w-3xl mx-auto mt-4">
            Com o VersaDelivery, o cliente faz o pedido pela loja online e o
            estabelecimento atualiza o peso real e o valor após a pesagem.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {highlights.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
              className="bg-white rounded-2xl p-7 hover:shadow-[0_2px_4px_-2px_rgba(27,27,27,.1),0_4px_8px_-2px_rgba(27,27,27,.14)] transition-shadow duration-300"
            >
              <div className="mb-4">{item.icon}</div>
              <h3 className="text-lg font-semibold text-[#1B1B1B] mb-1.5">
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

export default About;
