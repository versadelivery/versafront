"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { MessageCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "Como o Versa se adapta ao meu negócio?",
    answer:
      "O Versa foi feito pra ser flexível. Você personaliza produtos, métodos de entrega, horários, áreas de cobertura e muito mais. A plataforma se adapta ao seu modelo, não o contrário.",
  },
  {
    question: "Preciso de algum equipamento especial?",
    answer:
      "Não. O Versa roda no navegador, então basta um celular, tablet ou computador com internet. Sem instalar nada, sem servidor, sem dor de cabeça.",
  },
  {
    question: "Quanto tempo leva pra começar a usar?",
    answer:
      "A maioria dos negócios fica operacional em 1 a 2 dias. Nosso time ajuda na configuração inicial e no treinamento da equipe.",
  },
  {
    question: "Dá pra vender produtos por peso?",
    answer:
      "Sim, essa é uma das funcionalidades que só o Versa tem. O cliente escolhe o peso que quer, você define mínimo e máximo. Perfeito pra açougues, padarias e hortifrútis.",
  },
  {
    question: "Tem comissão sobre as vendas?",
    answer:
      "Não. O Versa funciona com planos mensais fixos, sem comissão sobre vendas. Todo o faturamento vai direto pra você.",
  },
];

const FAQ = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <section id="faq" ref={ref} className="py-20 md:py-28 bg-[#FFFDF6]">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="font-tomato inline-block text-[#009246] text-sm font-semibold tracking-wide uppercase mb-3">
            FAQ
          </span>
          <h2 className="font-tomato text-3xl sm:text-4xl font-semibold text-[#1B1B1B] tracking-tight mb-4">
            Perguntas frequentes
          </h2>
          <p className="text-lg text-[#474747]">
            O que você precisa saber sobre o Versa Delivery
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-[#E8E4DF] py-1"
              >
                <AccordionTrigger className="text-base md:text-lg font-medium text-[#1B1B1B] hover:text-[#009246] transition-colors duration-200 text-left">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-[#474747] text-base leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
{/* 
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-14 bg-[#F9FFF6] border border-[#C0FFA5]/50 rounded-2xl p-8 text-center"
        >
          <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-6 h-6 text-[#009246]" />
          </div>
          <h3 className="text-xl font-semibold text-[#1B1B1B] mb-2">
            Ainda com dúvida?
          </h3>
          <p className="text-[#474747] mb-6 max-w-md mx-auto">
            Fala com a gente. Nosso time tá pronto pra te ajudar.
          </p>
          <Link href="/login">
            <button className="bg-[#009246] hover:bg-[#006A43] text-white text-sm font-medium px-6 py-3 rounded-2xl transition-colors cursor-pointer">
              Fale conosco
            </button>
          </Link>
        </motion.div> */}
      </div>
    </section>
  );
};

export default FAQ;
