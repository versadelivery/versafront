"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Phone,
  MessageCircle,
  Mail,
  HelpCircle,
  ArrowLeft,
} from "lucide-react";

export default function SupportPage() {
  const phoneNumber = "+55 (85) 99152-0090";
  const email = "contato@versadelivery.com.br";

  const faqs = [
    {
      question: "Quais são as faixas de preço?",
      answer: "A mensalidade é definida pelo faturamento mensal da loja: até R$ 799,99 é grátis; de R$ 800,00 a R$ 2.999,99 custa R$ 39,00/mês; de R$ 3.000,00 a R$ 7.999,99, R$ 69,00/mês; de R$ 8.000,00 a R$ 19.999,99, R$ 129,00/mês; de R$ 20.000,00 a R$ 49.999,99, R$ 179,00/mês; de R$ 50.000,00 a R$ 119.999,99, R$ 229,00/mês; e a partir de R$ 120.000,00, R$ 299,00/mês."
    },
    {
      question: "Como funciona o programa de indicações?",
      answer: "Lojistas podem indicar outras lojas pelo link exclusivo e recebem 12% da mensalidade paga pelas lojas indicadas. Essa comissão pertence ao programa de indicações e não é uma taxa sobre as vendas."
    },
    {
      question: "Como configurar meu cardápio?",
      answer: "Acesse a seção 'Cardápio' no menu lateral e clique em 'Novo Item'. Preencha as informações do item, adicione foto e defina preço e variações."
    },
    {
      question: "Como funciona o sistema de pedidos?",
      answer: "Os pedidos chegam automaticamente na seção 'Pedidos'. Você pode aceitar, recusar ou marcar como prontos. O cliente recebe notificações automáticas sobre o status."
    },
    {
      question: "Posso personalizar as taxas de entrega?",
      answer: "Sim! Vá em 'Configurações' > 'Taxas de Entrega' para definir taxas por bairro e o valor mínimo para frete grátis. O tempo estimado de preparo e entrega fica em 'Configurações' > 'Informações Gerais'."
    },
    {
      question: "Como acompanhar as vendas?",
      answer: "O dashboard principal mostra um resumo das vendas. Para relatórios detalhados, acesse a seção de relatórios onde você pode filtrar por período e visualizar gráficos."
    },
    {
      question: "O que fazer se um pagamento não foi processado?",
      answer: "Verifique o status na seção de pedidos. Pagamentos pendentes aparecem como 'Aguardando'. Entre em contato conosco se o problema persistir."
    },
    {
      question: "Como gerenciar horários de funcionamento?",
      answer: "Em 'Configurações' > 'Informações Gerais', você pode definir os horários de abertura e fechamento para cada dia da semana."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <div className="bg-white border-b border-[#E5E2DD]">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="flex items-center gap-1.5 text-muted-foreground hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:block">Voltar</span>
              </Link>
              <div className="h-6 w-px bg-[#E5E2DD] hidden sm:block" />
              <h1 className="font-tomato text-base sm:text-lg font-bold text-gray-900">Suporte</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Contact Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Phone className="w-6 h-6 text-primary" />
              <CardTitle className="font-tomato text-2xl">Fale Conosco</CardTitle>
            </div>
            <CardDescription>
              Nossa equipe está pronta para ajudar você
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Phone Contact */}
              <div className="p-4 border rounded-lg hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-primary p-2 rounded-lg">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-tomato font-semibold">Telefone</h3>
                    <p className="text-sm text-muted-foreground">Segunda a Sexta: 8h às 18h</p>
                  </div>
                </div>
                <p className="font-medium text-lg mb-3">{phoneNumber}</p>
                <Button
                  className="w-full"
                  onClick={() => window.open(`tel:${phoneNumber.replace(/\D/g, '')}`)}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Ligar Agora
                </Button>
              </div>

              {/* WhatsApp Contact */}
              <div className="p-4 border rounded-lg hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-[#64B161] p-2 rounded-lg">
                    <img src="/whatsapp.svg" className="w-5 h-5 text-white" alt="WhatsApp" />
                  </div>
                  <div>
                    <h3 className="font-tomato font-semibold">WhatsApp</h3>
                    <p className="text-sm text-muted-foreground">Resposta rápida</p>
                  </div>
                </div>
                <p className="font-medium text-lg mb-3">{phoneNumber}</p>
                <Button
                  variant="outline"
                  className="w-full border-[#64B161] text-[#64B161] hover:bg-green-50"
                  onClick={() => window.open(`https://wa.me/${phoneNumber.replace(/\D/g, '')}`)}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Abrir WhatsApp
                </Button>
              </div>

              {/* Email Contact */}
              <div className="p-4 border rounded-lg hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-[#6366F1] p-2 rounded-lg">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-tomato font-semibold">E-mail</h3>
                    <p className="text-sm text-muted-foreground">Atendimento por e-mail</p>
                  </div>
                </div>
                <p className="font-medium text-lg mb-3 break-all">{email}</p>
                <Button
                  variant="outline"
                  className="w-full border-[#6366F1] text-[#6366F1] hover:bg-indigo-50"
                  onClick={() => window.open(`mailto:${email}`)}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar E-mail
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-primary" />
              <CardTitle className="font-tomato text-2xl">Perguntas Frequentes</CardTitle>
            </div>
            <CardDescription>
              Encontre respostas rápidas para as dúvidas mais comuns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
