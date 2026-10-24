"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  DEFAULT_BILLING_TIERS,
  formatTierRevenue,
  getBillingTiers,
} from "@/services/billing-tiers";

const formatMonthly = (amount: number) =>
  amount === 0 ? "Grátis" : `R$ ${amount.toLocaleString("pt-BR")}`;

const Pricing = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const [tiers, setTiers] = useState(DEFAULT_BILLING_TIERS);

  useEffect(() => {
    getBillingTiers().then(setTiers).catch(() => {});
  }, []);

  return (
    <section id="planos" ref={ref} className="py-20 md:py-28 bg-[#FFFDF6]">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="font-tomato inline-block text-[#009246] text-sm font-semibold tracking-wide uppercase mb-3">
            Planos e preços
          </span>
          <h2 className="font-tomato text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#1B1B1B] tracking-tight mb-4">
            Comece grátis. O plano acompanha seu faturamento.
          </h2>
          <p className="text-lg text-[#474747]">
            Escolha o VersaDelivery e comece com uma loja online sem mensalidade
            dentro da faixa gratuita.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-2xl p-4 sm:p-6"
        >
          <table className="w-full text-left text-sm sm:text-base">
            <thead>
              <tr className="border-b border-[#E8E4DF] text-[#1B1B1B]">
                <th className="py-3 pr-2 font-semibold">Plano</th>
                <th className="py-3 px-2 font-semibold">Faturamento mensal</th>
                <th className="py-3 pl-2 font-semibold text-right">Mensalidade</th>
              </tr>
            </thead>
            <tbody>
              {tiers.map((tier) => (
                <tr key={tier.key} className="border-b border-[#E8E4DF] last:border-0">
                  <td className="py-3 pr-2 font-medium text-[#1B1B1B]">{tier.name}</td>
                  <td className="py-3 px-2 text-[#474747]">{formatTierRevenue(tier)}</td>
                  <td className="py-3 pl-2 text-right font-semibold text-[#1B1B1B]">
                    {formatMonthly(tier.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <p className="mt-6 text-sm text-[#858585] text-center">
          Os critérios de apuração do faturamento, as mudanças de faixa e as
          condições de cobrança devem seguir os termos comerciais vigentes.
        </p>

        <div className="text-center mt-8">
          <Link href="/register">
            <button className="bg-[#1B1B1B] hover:bg-[#7ED957] text-white hover:text-black text-xl font-semibold px-12 sm:px-16 py-6 rounded-2xl transition-colors cursor-pointer">
              Criar minha loja grátis
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
