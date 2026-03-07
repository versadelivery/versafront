"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Phone,
  MessageCircle,
  HelpCircle,
  ArrowLeft,
} from "lucide-react";

export default function SupportPage() {
  const phoneNumber = "(11) 99999-9999";

  const faqs = [
    {
      question: "Como configurar meu cardápio?",
      answer: "Acesse a seção 'Catálogo' no menu lateral e clique em 'Adicionar Produto'. Preencha as informações do produto, adicione fotos e defina preços e variações."
    },
    {
      question: "Como funciona o sistema de pedidos?",
      answer: "Os pedidos chegam automaticamente na seção 'Pedidos'. Você pode aceitar, recusar ou marcar como prontos. O cliente recebe notificações automáticas sobre o status."
    },
    {
      question: "Posso personalizar as taxas de entrega?",
      answer: "Sim! Vá em 'Configurações' > 'Entrega' para definir taxas por região, valor mínimo para frete grátis e tempo de entrega estimado."
    },
    {
      question: "Como acompanhar as vendas?",
      answer: "O dashboard principal mostra um resumo das vendas. Para relatórios detalhados, acesse a seção de relatórios onde você pode filtrar por período e visualizar gráficos."
    },
    {
      question: "O que fazer se um pagamento não foi processado?",
      answer: "Verifique o status na seção de pedidos. Pagamentos pendentes ficam marcados em amarelo. Entre em contato conosco se o problema persistir."
    },
    {
      question: "Como gerenciar horários de funcionamento?",
      answer: "Em 'Configurações' > 'Geral', você pode definir os horários de abertura e fechamento para cada dia da semana, além de feriados especiais."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <div className="bg-white border-b border-[#E5E2DD]">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <a href="/admin" className="flex items-center gap-1.5 text-muted-foreground hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:block">Voltar</span>
              </a>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
