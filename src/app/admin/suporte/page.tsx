"use client";

import { AdminBanner } from "@/components/admin/admin-banner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Phone, 
  MessageCircle, 
  Clock, 
  HelpCircle, 
  CheckCircle, 
  AlertCircle, 
  Star,
  Mail,
  Users,
  FileText,
  Zap
} from "lucide-react";
import bannerImg from "../../../../public/img/hero-admin.jpg";

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
    <>
      <AdminBanner bannerImg={bannerImg} />
      
      <div className="max-w-6xl mx-auto px-4 -mt-10 z-20 relative">
        {/* Header Card */}
        <Card className="mb-8 border-none shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 p-4 rounded-full">
                <HelpCircle className="w-12 h-12 text-primary" />
              </div>
            </div>
            <CardTitle className="font-tomato text-3xl font-bold text-primary mb-2">
              Central de Suporte
            </CardTitle>
            <CardDescription className="text-lg">
              Estamos aqui para ajudar você a ter sucesso com sua loja
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Contact Section */}
        <Card className="mb-8">
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
        <Card className="mb-8">
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
    </>
  );
}
