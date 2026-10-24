"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";

const steps = [
  "Você indica o VersaDelivery a um lojista.",
  "Quando o lojista contrata um plano pago, a indicação passa a gerar comissão conforme as regras do programa.",
  "Você acompanha o faturamento dos seus indicados e consulta os valores correspondentes à sua comissão.",
];

const Referral = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <section id="indicacao" ref={ref} className="scroll-mt-24 py-16 md:py-24 bg-[#FFFDF6]">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <span className="font-tomato inline-block text-[#009246] text-sm font-semibold tracking-wide uppercase mb-3">
            Programa de indicação
          </span>
          <h2 className="font-tomato text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#1B1B1B] tracking-tight mb-4">
            Indique o VersaDelivery. Ganhe todo mês.
          </h2>
          <p className="text-lg text-[#474747] leading-relaxed">
            Conhece donos de açougues que precisam organizar o delivery?
            Apresente o VersaDelivery e receba{" "}
            <strong>12% da mensalidade dos clientes indicados que contratarem um plano pago</strong>.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-2xl border border-[#E8E4DF] p-6 sm:p-10"
        >
          <p className="text-xs font-semibold tracking-wide uppercase text-[#858585] mb-3">
            Programa de indicação
          </p>
          <h3 className="font-tomato text-2xl sm:text-3xl font-semibold text-[#1B1B1B] mb-4">
            Sua rede de contatos pode gerar comissões recorrentes.
          </h3>
          <p className="font-tomato text-5xl font-semibold text-[#009246]">12%</p>
          <p className="text-[#858585] mt-2 pb-6 border-b border-[#E8E4DF]">
            Da mensalidade dos clientes indicados elegíveis, conforme as regras
            do programa.
          </p>

          <h4 className="font-semibold text-[#1B1B1B] mt-6 mb-3">Como funciona</h4>
          <ol className="list-decimal pl-6 space-y-3 text-[#474747] marker:font-semibold marker:text-[#1B1B1B]">
            {steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>

          <Link href="/register" className="block mt-8">
            <button className="w-full bg-[#1B1B1B] hover:bg-[#7ED957] text-white hover:text-black text-lg font-semibold py-4 rounded-2xl transition-colors cursor-pointer">
              Quero indicar e ganhar
            </button>
          </Link>
          <p className="text-sm text-[#858585] mt-4">
            Clientes no plano gratuito não geram comissão. Consulte as
            condições de elegibilidade, apuração e pagamento.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Referral;
