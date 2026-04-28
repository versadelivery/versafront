import Link from "next/link";
import Image from "next/image";

const sections = [
  { id: "aceitacao", title: "1. Aceitação dos Termos" },
  { id: "plataforma", title: "2. Uso da Plataforma" },
  { id: "cadastro", title: "3. Cadastro e Conta" },
  { id: "responsabilidades", title: "4. Responsabilidades" },
  { id: "servicos", title: "5. Serviços e Pagamentos" },
  { id: "propriedade", title: "6. Propriedade Intelectual" },
  { id: "limitacao", title: "7. Limitação de Responsabilidade" },
  { id: "rescisao", title: "8. Rescisão" },
  { id: "alteracoes", title: "9. Alterações nos Termos" },
  { id: "contato", title: "10. Contato" },
];

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-[#FFFDF6]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#E8E4DF]">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-10 flex items-center h-16 gap-6">
          <Link href="/">
            <Image src="/logo/logo-inline-primary.svg" alt="Versa Delivery" width={160} height={48} priority />
          </Link>
          <div className="h-5 w-px bg-[#E8E4DF]" />
          <span className="text-sm font-medium text-[#858585]">Termos de Uso</span>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-6 sm:px-10 py-12 lg:py-16">
        <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-16">
          {/* Sidebar TOC */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <p className="text-xs font-semibold text-[#858585] uppercase tracking-wider mb-4">
                Nesta página
              </p>
              <nav className="space-y-1">
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="block text-sm text-[#858585] hover:text-[#1B1B1B] transition-colors py-1 leading-snug"
                  >
                    {s.title}
                  </a>
                ))}
              </nav>
              <div className="mt-8 pt-6 border-t border-[#E8E4DF]">
                <Link
                  href="/privacidade"
                  className="text-sm text-[#009246] font-medium hover:underline"
                >
                  Política de Privacidade →
                </Link>
              </div>
            </div>
          </aside>

          {/* Content */}
          <article className="min-w-0">
            <div className="mb-10">
              <h1 className="font-tomato text-3xl sm:text-4xl font-semibold text-[#1B1B1B] mb-3">
                Termos de Uso
              </h1>
              <p className="text-sm text-[#858585]">
                Última atualização: 28 de abril de 2026
              </p>
            </div>

            <div className="prose prose-gray max-w-none space-y-10 text-[#1B1B1B]">
              <p className="text-base leading-relaxed text-[#444]">
                Bem-vindo à <strong>Versa Delivery</strong>. Ao se cadastrar e utilizar nossa
                plataforma, você concorda com os termos e condições descritos abaixo. Leia com
                atenção antes de criar sua conta.
              </p>

              <section id="aceitacao">
                <h2 className="font-tomato text-xl font-semibold text-[#1B1B1B] mb-3">
                  1. Aceitação dos Termos
                </h2>
                <p className="text-[#444] leading-relaxed">
                  Ao acessar ou usar a plataforma Versa Delivery, você declara ter lido,
                  compreendido e aceito integralmente estes Termos de Uso, bem como nossa{" "}
                  <Link href="/privacidade" className="text-[#009246] hover:underline">
                    Política de Privacidade
                  </Link>
                  . Caso não concorde com algum dos termos aqui estabelecidos, não utilize
                  nossos serviços.
                </p>
              </section>

              <hr className="border-[#E8E4DF]" />

              <section id="plataforma">
                <h2 className="font-tomato text-xl font-semibold text-[#1B1B1B] mb-3">
                  2. Uso da Plataforma
                </h2>
                <p className="text-[#444] leading-relaxed mb-3">
                  A Versa Delivery é uma plataforma de gestão de delivery destinada a
                  estabelecimentos comerciais. Você se compromete a:
                </p>
                <ul className="space-y-2 text-[#444]">
                  {[
                    "Usar a plataforma exclusivamente para fins lícitos e de acordo com estes Termos;",
                    "Não compartilhar suas credenciais de acesso com terceiros;",
                    "Não tentar acessar, modificar ou comprometer a segurança da plataforma;",
                    "Não utilizar a plataforma para disseminar conteúdo ilegal, ofensivo ou enganoso;",
                    "Manter suas informações de conta atualizadas e verídicas.",
                  ].map((item) => (
                    <li key={item} className="flex gap-2 leading-relaxed">
                      <span className="text-[#009246] mt-1 flex-shrink-0">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <hr className="border-[#E8E4DF]" />

              <section id="cadastro">
                <h2 className="font-tomato text-xl font-semibold text-[#1B1B1B] mb-3">
                  3. Cadastro e Conta
                </h2>
                <p className="text-[#444] leading-relaxed mb-3">
                  Para utilizar os serviços da Versa Delivery, é necessário criar uma conta
                  fornecendo informações verdadeiras e completas. Você é responsável por:
                </p>
                <ul className="space-y-2 text-[#444]">
                  {[
                    "Manter a confidencialidade da sua senha e de suas credenciais de acesso;",
                    "Todas as atividades realizadas em sua conta;",
                    "Notificar imediatamente a Versa Delivery em caso de uso não autorizado da sua conta;",
                    "Garantir que as informações do estabelecimento (nome, CNPJ/CPF, e-mail) sejam precisas.",
                  ].map((item) => (
                    <li key={item} className="flex gap-2 leading-relaxed">
                      <span className="text-[#009246] mt-1 flex-shrink-0">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-[#444] leading-relaxed mt-3">
                  A Versa Delivery reserva o direito de recusar o cadastro ou encerrar contas
                  que violem estes Termos.
                </p>
              </section>

              <hr className="border-[#E8E4DF]" />

              <section id="responsabilidades">
                <h2 className="font-tomato text-xl font-semibold text-[#1B1B1B] mb-3">
                  4. Responsabilidades
                </h2>
                <p className="text-[#444] leading-relaxed mb-3">
                  <strong>Do usuário (estabelecimento):</strong> você é responsável pelo
                  conteúdo publicado no seu catálogo, pela veracidade das informações de
                  produtos, preços e disponibilidade, pela gestão dos pedidos recebidos e
                  pela qualidade dos produtos ou serviços oferecidos aos seus clientes.
                </p>
                <p className="text-[#444] leading-relaxed">
                  <strong>Da Versa Delivery:</strong> nos comprometemos a manter a
                  plataforma disponível e funcional, com esforços razoáveis de continuidade
                  do serviço, mas não garantimos disponibilidade ininterrupta, uma vez que
                  manutenções e atualizações podem ocorrer.
                </p>
              </section>

              <hr className="border-[#E8E4DF]" />

              <section id="servicos">
                <h2 className="font-tomato text-xl font-semibold text-[#1B1B1B] mb-3">
                  5. Serviços e Pagamentos
                </h2>
                <p className="text-[#444] leading-relaxed mb-3">
                  A Versa Delivery pode oferecer planos de assinatura pagos. Ao contratar
                  um plano, você concorda com:
                </p>
                <ul className="space-y-2 text-[#444]">
                  {[
                    "Os valores e condições de cobrança vigentes no momento da contratação;",
                    "A renovação automática do plano ao final de cada período, salvo cancelamento expresso;",
                    "A emissão de cobranças no e-mail de faturamento cadastrado;",
                    "Que atrasos no pagamento podem resultar na suspensão temporária do acesso.",
                  ].map((item) => (
                    <li key={item} className="flex gap-2 leading-relaxed">
                      <span className="text-[#009246] mt-1 flex-shrink-0">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <hr className="border-[#E8E4DF]" />

              <section id="propriedade">
                <h2 className="font-tomato text-xl font-semibold text-[#1B1B1B] mb-3">
                  6. Propriedade Intelectual
                </h2>
                <p className="text-[#444] leading-relaxed">
                  Todos os elementos da plataforma Versa Delivery — incluindo marca, logotipo,
                  design, código-fonte, textos e funcionalidades — são de propriedade exclusiva
                  da Versa Delivery e protegidos pelas leis de propriedade intelectual
                  brasileiras e internacionais. É vedada a reprodução, distribuição ou
                  modificação de qualquer elemento sem autorização prévia e expressa.
                </p>
              </section>

              <hr className="border-[#E8E4DF]" />

              <section id="limitacao">
                <h2 className="font-tomato text-xl font-semibold text-[#1B1B1B] mb-3">
                  7. Limitação de Responsabilidade
                </h2>
                <p className="text-[#444] leading-relaxed">
                  A Versa Delivery não se responsabiliza por danos indiretos, incidentais
                  ou consequentes decorrentes do uso ou da impossibilidade de uso da
                  plataforma, por falhas de terceiros (operadoras de pagamento, provedores
                  de internet), ou por conteúdo gerado pelos próprios estabelecimentos
                  cadastrados. Nossa responsabilidade máxima fica limitada ao valor pago
                  pelos serviços no mês em que o dano ocorreu.
                </p>
              </section>

              <hr className="border-[#E8E4DF]" />

              <section id="rescisao">
                <h2 className="font-tomato text-xl font-semibold text-[#1B1B1B] mb-3">
                  8. Rescisão
                </h2>
                <p className="text-[#444] leading-relaxed">
                  Qualquer das partes pode encerrar a relação contratual a qualquer momento.
                  O usuário pode solicitar o cancelamento da conta diretamente na plataforma
                  ou pelo e-mail de suporte. A Versa Delivery pode suspender ou encerrar
                  contas que violem estes Termos, sem aviso prévio em casos de violação
                  grave. Ao encerrar a conta, os dados serão tratados conforme nossa{" "}
                  <Link href="/privacidade" className="text-[#009246] hover:underline">
                    Política de Privacidade
                  </Link>
                  .
                </p>
              </section>

              <hr className="border-[#E8E4DF]" />

              <section id="alteracoes">
                <h2 className="font-tomato text-xl font-semibold text-[#1B1B1B] mb-3">
                  9. Alterações nos Termos
                </h2>
                <p className="text-[#444] leading-relaxed">
                  A Versa Delivery pode atualizar estes Termos periodicamente. Alterações
                  relevantes serão comunicadas por e-mail ou por notificação na plataforma
                  com antecedência mínima de 15 dias. O uso continuado da plataforma após
                  o prazo de aviso implica aceitação dos novos termos.
                </p>
              </section>

              <hr className="border-[#E8E4DF]" />

              <section id="contato">
                <h2 className="font-tomato text-xl font-semibold text-[#1B1B1B] mb-3">
                  10. Contato
                </h2>
                <p className="text-[#444] leading-relaxed">
                  Dúvidas sobre estes Termos de Uso podem ser enviadas para:{" "}
                  <a
                    href="mailto:contato@versadelivery.com.br"
                    className="text-[#009246] hover:underline"
                  >
                    contato@versadelivery.com.br
                  </a>
                  . Nossa equipe responde em até 2 dias úteis.
                </p>
              </section>
            </div>

            {/* Bottom nav */}
            <div className="mt-12 pt-8 border-t border-[#E8E4DF] flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <Link
                href="/privacidade"
                className="text-sm text-[#009246] font-medium hover:underline"
              >
                Ver Política de Privacidade →
              </Link>
              <Link
                href="/"
                className="text-sm text-[#858585] hover:text-[#1B1B1B] transition-colors"
              >
                ← Voltar para a página inicial
              </Link>
            </div>
          </article>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#E8E4DF] mt-16">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-[#858585]">
            &copy; {new Date().getFullYear()} Versa Delivery. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4 text-sm text-[#858585]">
            <Link href="/termos" className="hover:text-[#1B1B1B] transition-colors font-medium text-[#1B1B1B]">
              Termos de Uso
            </Link>
            <Link href="/privacidade" className="hover:text-[#1B1B1B] transition-colors">
              Privacidade
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
