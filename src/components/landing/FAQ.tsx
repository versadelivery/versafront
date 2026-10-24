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
    question: "Quanto custa o VersaDelivery?",
    answer:
      "Você pode começar gratuitamente com até R$ 799,99 em vendas mensais. Acima desse limite, aplica-se a mensalidade da faixa correspondente, de R$ 39 a R$ 299.",
  },
  {
    question: "Como funciona a cobrança?",
    answer:
      "O modelo comercial prevê fechamento mensal, pagamento por Pix com vencimento no dia 5 e prazo de regularização até o dia 10. Após esse prazo, a loja poderá ficar indisponível até a regularização, conforme as condições contratuais.",
  },
  {
    question: "Como sei em qual faixa estou?",
    answer:
      "O painel apresenta sua faixa de faturamento. Os critérios para apuração e mudança de faixa seguem as regras comerciais do VersaDelivery.",
  },
  {
    question: "Posso vender produtos por peso?",
    answer:
      "Sim. Seu cliente escolhe o produto e a quantidade desejada. Após a pesagem, você atualiza o peso real e o valor correspondente.",
  },
  {
    question: "Também posso vender por unidade?",
    answer:
      "Sim. O catálogo pode incluir produtos vendidos por peso ou por unidade, conforme o tipo de produto.",
  },
  {
    question: "O VersaDelivery cobra comissão sobre as vendas?",
    answer:
      "Não. Você paga a mensalidade do plano correspondente à faixa de faturamento, sem comissão por pedido.",
  },
  {
    question: "Preciso de uma impressora?",
    answer:
      "Não. Você pode acompanhar os pedidos pelo painel KDS em um celular, tablet ou computador. A impressora é opcional e pode ser utilizada para imprimir cupons de apoio à separação e à entrega.",
  },
  {
    question: "O VersaDelivery emite nota fiscal?",
    answer: (
      <>
        <p>
          Atualmente, o VersaDelivery não possui integração para emissão de
          documentos fiscais. O lojista deve providenciar a emissão dos
          documentos exigidos para sua operação por meio do sistema ou
          procedimento fiscal adequado.
        </p>
        <p className="mt-3">O cupom interno do pedido não substitui o documento fiscal.</p>
      </>
    ),
  },
  {
    question: "Quanto tempo leva para começar?",
    answer:
      "Você pode começar cadastrando os produtos, configurando o catálogo e compartilhando o link da sua loja. O tempo necessário depende da quantidade de produtos e das informações que deseja cadastrar.",
  },
  {
    question: "Como funciona o programa de indicação?",
    answer:
      "Você indica o VersaDelivery a outros lojistas e pode receber 12% da mensalidade dos clientes indicados que contratarem planos pagos, conforme as regras do programa. O painel permite acompanhar o faturamento dos indicados e consultar a comissão correspondente.",
  },
  {
    question: "Como recebo minha comissão?",
    answer:
      "Atualmente, a apuração e o pagamento seguem o processo manual vigente do programa. Os valores e as condições aplicáveis podem ser consultados conforme as regras de indicação.",
  },
];

const FAQ = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <section id="faq" ref={ref} className="scroll-mt-24 py-16 md:py-24 bg-white">
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
            O que você precisa saber sobre o VersaDelivery
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
