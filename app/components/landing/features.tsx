"use client";

import { useRef } from "react";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { motion, useInView } from "framer-motion";
import { 
  CheckCircle, 
  LayoutGrid, 
  Clock, 
  Code, 
  Headset, 
  ShieldCheck,
  Settings,
  Users,
  TrendingUp
} from "lucide-react";

const Features = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.1 });
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };
  
  const features = [
    {
      icon: <LayoutGrid className="w-12 h-12 text-blue-500" />,
      title: "Interface Intuitiva",
      description: "Interface intuitiva que torna o gerenciamento de pedidos e entregas mais fácil do que nunca."
    },
    {
      icon: <Clock className="w-12 h-12 text-purple-500" />,
      title: "Tempo Real",
      description: "Acompanhe suas vendas em tempo real e tome decisões baseadas em dados concretos."
    },
    {
      icon: <Headset className="w-12 h-12 text-amber-500" />,
      title: "Suporte Dedicado",
      description: "Conte com nossa equipe especializada para resolver qualquer problema rapidamente."
    },
    {
      icon: <ShieldCheck className="w-12 h-12 text-red-500" />,
      title: "Segurança Avançada",
      description: "Proteção de dados de nível empresarial para garantir a segurança dos seus clientes."
    },
    {
      icon: <TrendingUp className="w-12 h-12 text-indigo-500" />,
      title: "Análises Detalhadas",
      description: "Visualize métricas importantes e obtenha insights valiosos sobre seu negócio."
    },
    {
      icon: <Users className="w-12 h-12 text-pink-500" />,
      title: "Multiusuários",
      description: "Configure diferentes níveis de acesso para sua equipe com permissões personalizáveis."
    },
  ];

  return (
    <section 
      id="recursos" 
      ref={ref}
      className="bg-gradient-to-b from-zinc-900 to-black text-white py-20 overflow-hidden font-antarctican-mono"
    >
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Recursos <span className="text-primary">Poderosos</span>
          </h2>
          <p className="text-xl text-zinc-400 max-w-3xl mx-auto font-antarctican-mono">
            A plataforma completa para revolucionar sua operação de delivery com ferramentas
            que fazem a diferença no seu dia a dia.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-16"
        >
          <Link href="/login">
            <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/80 hover:to-primary text-white font-bold text-lg px-8 py-6 rounded-xs shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 font-antarctican-mono">
              TESTE GRATUITAMENTE
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

const FeatureCard = ({ feature, index }: { feature: any, index: number }) => {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: false, amount: 0.5 });
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.6,
        delay: index * 0.1
      } 
    }
  };

  return (
    <motion.div
      ref={cardRef}
      variants={cardVariants}
      className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 p-8 rounded-xs hover:bg-zinc-700/50 transition-all duration-300 group hover:shadow-lg hover:shadow-emerald-500/10"
    >
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 flex items-center justify-center mb-4 transform group-hover:scale-110 transition-transform duration-300">
          {feature.icon}
        </div>
        <h3 className="text-xl font-bold mb-3 text-white group-hover:text-primary transition-colors duration-300">
          {feature.title}
        </h3>
        <p className="text-zinc-400 group-hover:text-zinc-300 font-antarctican-mono transition-colors duration-300">
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
};

export default Features;