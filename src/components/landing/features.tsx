"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  LayoutGrid,
  Clock,
  Headset,
  ShieldCheck,
  Users,
  TrendingUp,
  Scale,
  Smartphone,
  Zap,
} from "lucide-react";

const bigFeatures = [
  {
    icon: <Scale className="w-7 h-7 text-[#009246]" />,
    badge: "Exclusivo",
    title: "Venda por peso, do seu jeito",
    description:
      "Seu cliente escolhe o peso exato que quer. Perfeito pra açougue, padaria, hortifrúti. Nenhuma outra plataforma faz isso.",
  },
  {
    icon: <Smartphone className="w-7 h-7 text-[#6358DE]" />,
    badge: "Simples",
    title: "Loja pronta em minutos",
    description:
      "Cadastre seus produtos, monte o catálogo e comece a vender. Sem complicação. Sua loja online rodando hoje.",
  },
  {
    icon: <Zap className="w-7 h-7 text-[#2676C0]" />,
    badge: "Tempo real",
    title: "Gerencie tudo ao vivo",
    description:
      "Painel kanban com pedidos em tempo real. Arraste, atualize e notifique seus clientes na hora.",
  },
];

const features = [
  {
    icon: <LayoutGrid className="w-6 h-6" />,
    title: "Interface intuitiva",
    description: "Gerenciar pedidos e entregas nunca foi tão fácil.",
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: "Tempo real",
    description: "Acompanhe vendas e tome decisões com dados na mão.",
  },
  {
    icon: <Headset className="w-6 h-6" />,
    title: "Suporte dedicado",
    description: "Time pronto pra resolver qualquer problema rápido.",
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: "Segurança de verdade",
    description: "Dados dos seus clientes protegidos como deve ser.",
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: "Análises detalhadas",
    description: "Métricas e insights pra entender seu negócio melhor.",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Multiusuários",
    description: "Acesso pra toda a equipe com permissões diferentes.",
  },
];

const accentColors: Record<number, { bg: string; text: string; border: string }> = {
  0: { bg: "bg-[#F9FFF6]", text: "text-[#006A43]", border: "border-[#C0FFA5]" },
  1: { bg: "bg-[#F5F3FF]", text: "text-[#6358DE]", border: "border-[#C4BFFF]" },
  2: { bg: "bg-[#EFF6FF]", text: "text-[#2676C0]", border: "border-[#93C5FD]" },
};

const Features = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <section id="recursos" ref={ref} className="py-20 md:py-28 bg-[#FFFDF6]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="font-tomato inline-block text-[#009246] text-sm font-semibold tracking-wide uppercase mb-3">
            Recursos
          </span>
          <h2 className="font-tomato text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#1B1B1B] tracking-tight mb-4">
            Tudo pra você vender mais
          </h2>
          <p className="text-lg text-[#474747] max-w-2xl mx-auto">
            Ferramentas que fazem diferença no dia a dia da sua operação de
            delivery.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {bigFeatures.map((feature, index) => {
            const colors = accentColors[index];
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl hover:shadow-[0_2px_4px_-2px_rgba(27,27,27,.1),0_4px_8px_-2px_rgba(27,27,27,.14)] transition-shadow duration-300 p-7 flex flex-col"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center`}
                  >
                    {feature.icon}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${colors.text} ${colors.border}`}
                  >
                    {feature.badge}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-[#1B1B1B] mb-2">
                  {feature.title}
                </h3>
                <p className="text-[#474747] text-sm leading-relaxed flex-1">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
              className="bg-white rounded-2xl border-2 border-black p-5 md:p-6 hover:shadow-[0_1px_2px_0_rgba(27,27,27,.08)] transition-shadow duration-200 group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#F9FFF6] flex items-center justify-center mb-3 text-[#009246] group-hover:bg-[#009246] group-hover:text-white transition-colors duration-200">
                {feature.icon}
              </div>
              <h3 className="text-base font-semibold text-[#1B1B1B] mb-1">
                {feature.title}
              </h3>
              <p className="text-sm text-[#858585] leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-14"
        >
          <Link href="/login">
                <button className="bg-[#1B1B1B] hover:bg-black text-white text-base font-medium px-14 py-5 rounded-2xl transition-colors cursor-pointer">
                  Comece agora
                </button>
              </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
