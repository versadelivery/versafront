"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "Como a plataforma Versa Delivery se adapta ao meu negócio?",
    answer: "O Versa Delivery foi projetado com flexibilidade em mente. Você pode personalizar praticamente todos os aspectos da plataforma, desde as opções de produtos até os métodos de entrega, horários de funcionamento e áreas de cobertura. A plataforma se adapta ao seu modelo de negócio, e não o contrário."
  },
  {
    question: "Quais são os requisitos técnicos para implementar o Versa Delivery?",
    answer: "O Versa Delivery é uma solução baseada em nuvem, então você só precisa de um dispositivo com acesso à internet para começar. Funciona em computadores, tablets e smartphones. Não há necessidade de instalar softwares complexos ou fazer manutenção de servidores."
  },
  {
    question: "Quanto tempo leva para implementar o Versa Delivery no meu negócio?",
    answer: "A maioria dos negócios consegue estar completamente operacional com o Versa Delivery em apenas 1-2 dias. Nossa equipe de suporte está disponível para ajudar na configuração inicial e treinamento da sua equipe, garantindo uma transição suave e rápida."
  },
];

const FAQ = () => {
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
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section 
      id="faq" 
      ref={ref}
      className="bg-white text-black py-20 overflow-hidden"
    >
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Perguntas <span className="text-primary">Frequentes</span>
          </h2>
          <p className="text-xl text-black max-w-3xl mx-auto">
            Tudo que você precisa saber sobre o Versa Delivery
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <motion.div key={index} variants={itemVariants}>
                <AccordionItem value={`item-${index}`} className="border-zinc-800 py-2">
                  <AccordionTrigger className="text-lg md:text-xl font-medium text-black hover:text-primary transition-colors duration-200">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-black text-base md:text-lg">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 text-center bg-primary/20 border border-primary/50 p-8 rounded-xs"
        >
          <h3 className="text-2xl font-bold mb-4">Ainda tem dúvidas?</h3>
          <p className="text-black mb-6 font-antarctican-mono">
            Nossa equipe está pronta para ajudar com qualquer questão que você possa ter.
          </p>
          <a
            className="inline-block bg-primary hover:bg-primary/80 text-white font-semibold py-3 px-8 rounded-xs font-antarctican-mono"
          >
            FALE CONOSCO
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;