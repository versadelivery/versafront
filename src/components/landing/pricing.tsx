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
    <section id="planos" ref={ref} className="scroll-mt-24 py-16 md:py-24 bg-white">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
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
          className="rounded-xl border border-[#E8E4DF] bg-[#FFFDF6] p-3 sm:p-5"
        >
          <ul>
            {tiers.map((tier) => (
              <li
                key={tier.key}
                className={`flex items-center justify-between gap-4 rounded-xl px-3 py-3.5 sm:px-4 ${
                  tier.amount === 0 ? "bg-[#F1FBE9]" : "border-b border-[#E8E4DF] last:border-0"
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    aria-hidden
                    className="size-3 shrink-0 rounded-full border border-[#D9D4CB]"
                    style={{ backgroundColor: tier.color }}
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-[#1B1B1B]">Plano {tier.name}</p>
                    <p className="text-sm text-[#474747]">{formatTierRevenue(tier)}</p>
                  </div>
                </div>
                <p
                  className={`shrink-0 text-lg font-semibold ${
                    tier.amount === 0 ? "text-[#009246]" : "text-[#1B1B1B]"
                  }`}
                >
                  {formatMonthly(tier.amount)}
                </p>
              </li>
            ))}
          </ul>
        </motion.div>

        <p className="mt-6 text-sm text-[#858585] text-center">
          Os critérios de apuração do faturamento, as mudanças de faixa e as
          condições de cobrança devem seguir os termos comerciais vigentes.
        </p>

        <div className="text-center mt-8">
          <Link href="/register">
            <button className="bg-[#1B1B1B] hover:bg-[#7ED957] text-white hover:text-black text-xl font-semibold px-12 sm:px-16 py-6 rounded-xl transition-colors cursor-pointer">
              Criar minha loja grátis
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
