import Link from "next/link";
import Image from "next/image";

const sections = [
  { id: "coleta", title: "1. Dados Coletados" },
  { id: "uso", title: "2. Como Usamos os Dados" },
  { id: "compartilhamento", title: "3. Compartilhamento" },
  { id: "direitos", title: "4. Seus Direitos (LGPD)" },
  { id: "seguranca", title: "5. Segurança" },
  { id: "cookies", title: "6. Cookies" },
  { id: "retencao", title: "7. Retenção de Dados" },
  { id: "menores", title: "8. Menores de Idade" },
  { id: "alteracoes", title: "9. Alterações" },
  { id: "contato", title: "10. Contato e DPO" },
];

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-[#FFFDF6]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#E8E4DF]">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-10 flex items-center h-16 gap-6">
          <Link href="/">
            <Image src="/logo/logo-inline-primary.svg" alt="Versa Delivery" width={160} height={48} priority />
          </Link>
          <div className="h-5 w-px bg-[#E8E4DF]" />
          <span className="text-sm font-medium text-[#858585]">Política de Privacidade</span>
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
                  href="/termos"
                  className="text-sm text-[#009246] font-medium hover:underline"
                >
                  Termos de Uso →
                </Link>
              </div>
            </div>
          </aside>

          {/* Content */}
          <article className="min-w-0">
            <div className="mb-10">
              <h1 className="font-tomato text-3xl sm:text-4xl font-semibold text-[#1B1B1B] mb-3">
                Política de Privacidade
              </h1>
              <p className="text-sm text-[#858585]">
                Última atualização: 28 de abril de 2026
              </p>
            </div>

            <div className="space-y-10 text-[#1B1B1B]">
              <p className="text-base leading-relaxed text-[#444]">
                A <strong>Versa Delivery</strong> está comprometida com a proteção dos seus
                dados pessoais e com a transparência sobre como as informações são coletadas,
                utilizadas e armazenadas. Esta política está em conformidade com a{" "}
                <strong>Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)</strong>.
              </p>

              <section id="coleta">
                <h2 className="font-tomato text-xl font-semibold text-[#1B1B1B] mb-3">
                  1. Dados Coletados
                </h2>
                <p className="text-[#444] leading-relaxed mb-3">
                  Coletamos as seguintes categorias de dados:
                </p>
                <div className="space-y-4">
                  {[
                    {
                      title: "Dados de cadastro",
                      items: ["Nome do responsável e do estabelecimento", "E-mail e senha (armazenada de forma criptografada)", "Telefone/celular", "CPF ou CNPJ", "E-mail de cobrança"],
                    },
                    {
                      title: "Dados de uso",
                      items: ["Endereços IP e dados de navegação", "Logs de acesso e ações na plataforma", "Dispositivos e navegadores utilizados"],
                    },
                    {
                      title: "Dados financeiros",
                      items: ["Histórico de assinatura e pagamentos", "Dados de faturamento (não armazenamos dados completos de cartão de crédito)"],
                    },
                  ].map((group) => (
                    <div key={group.title} className="p-4 rounded-lg bg-[#F5F3EF] border border-[#E8E4DF]">
                      <p className="text-sm font-semibold text-[#1B1B1B] mb-2">{group.title}</p>
                      <ul className="space-y-1">
                        {group.items.map((item) => (
                          <li key={item} className="flex gap-2 text-sm text-[#444]">
                            <span className="text-[#009246] flex-shrink-0">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>

              <hr className="border-[#E8E4DF]" />

              <section id="uso">
                <h2 className="font-tomato text-xl font-semibold text-[#1B1B1B] mb-3">
                  2. Como Usamos os Dados
                </h2>
                <p className="text-[#444] leading-relaxed mb-3">
                  Utilizamos seus dados para as seguintes finalidades:
                </p>
                <ul className="space-y-2 text-[#444]">
                  {[
                    "Criação e gestão da sua conta na plataforma;",
                    "Prestação dos serviços contratados (catálogo, pedidos, relatórios, PDV);",
                    "Cobrança e emissão de faturas;",
                    "Comunicação sobre atualizações, manutenções e novidades da plataforma;",
                    "Melhoria contínua dos serviços, com base em dados agregados e anonimizados;",
                    "Cumprimento de obrigações legais e regulatórias.",
                  ].map((item) => (
                    <li key={item} className="flex gap-2 leading-relaxed">
                      <span className="text-[#009246] mt-1 flex-shrink-0">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <hr className="border-[#E8E4DF]" />

              <section id="compartilhamento">
                <h2 className="font-tomato text-xl font-semibold text-[#1B1B1B] mb-3">
                  3. Compartilhamento de Dados
                </h2>
                <p className="text-[#444] leading-relaxed mb-3">
                  Seus dados não são vendidos a terceiros. Podemos compartilhá-los apenas
                  nas seguintes situações:
                </p>
                <ul className="space-y-2 text-[#444]">
                  {[
                    "Com prestadores de serviços essenciais (hospedagem, processamento de pagamentos, envio de e-mails), que atuam como operadores sob nossa instrução;",
                    "Quando exigido por lei, ordem judicial ou autoridade competente;",
                    "Em caso de fusão, aquisição ou reorganização societária, com aviso prévio aos usuários.",
                  ].map((item) => (
                    <li key={item} className="flex gap-2 leading-relaxed">
                      <span className="text-[#009246] mt-1 flex-shrink-0">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <hr className="border-[#E8E4DF]" />

              <section id="direitos">
                <h2 className="font-tomato text-xl font-semibold text-[#1B1B1B] mb-3">
                  4. Seus Direitos (LGPD)
                </h2>
                <p className="text-[#444] leading-relaxed mb-4">
                  Nos termos da LGPD, você tem os seguintes direitos sobre seus dados pessoais:
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { right: "Acesso", desc: "Solicitar uma cópia dos dados que temos sobre você." },
                    { right: "Correção", desc: "Corrigir dados incompletos, inexatos ou desatualizados." },
                    { right: "Exclusão", desc: "Solicitar a eliminação dos seus dados pessoais." },
                    { right: "Portabilidade", desc: "Receber seus dados em formato estruturado." },
                    { right: "Revogação", desc: "Revogar o consentimento a qualquer momento." },
                    { right: "Oposição", desc: "Opor-se ao tratamento em determinadas situações." },
                  ].map(({ right, desc }) => (
                    <div key={right} className="p-3 rounded-lg border border-[#E8E4DF] bg-white">
                      <p className="text-sm font-semibold text-[#009246] mb-1">{right}</p>
                      <p className="text-sm text-[#444]">{desc}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[#444] leading-relaxed mt-4 text-sm">
                  Para exercer qualquer desses direitos, entre em contato pelo e-mail{" "}
                  <a href="mailto:privacidade@versadelivery.com.br" className="text-[#009246] hover:underline">
                    privacidade@versadelivery.com.br
                  </a>
                  .
                </p>
              </section>

              <hr className="border-[#E8E4DF]" />

              <section id="seguranca">
                <h2 className="font-tomato text-xl font-semibold text-[#1B1B1B] mb-3">
                  5. Segurança dos Dados
                </h2>
                <p className="text-[#444] leading-relaxed">
                  Adotamos medidas técnicas e organizacionais adequadas para proteger seus
                  dados contra acesso não autorizado, alteração, divulgação ou destruição.
                  Isso inclui criptografia em trânsito (TLS), armazenamento seguro de senhas
                  com hash, controles de acesso por perfil e monitoramento contínuo da
                  infraestrutura. Em caso de incidente de segurança relevante, você será
                  notificado conforme exigido pela LGPD.
                </p>
              </section>

              <hr className="border-[#E8E4DF]" />

              <section id="cookies">
                <h2 className="font-tomato text-xl font-semibold text-[#1B1B1B] mb-3">
                  6. Cookies
                </h2>
                <p className="text-[#444] leading-relaxed mb-3">
                  Utilizamos cookies e tecnologias similares para:
                </p>
                <ul className="space-y-2 text-[#444]">
                  {[
                    "Manter sua sessão autenticada na plataforma;",
                    "Lembrar preferências de uso;",
                    "Analisar o comportamento de navegação de forma agregada para melhorar a experiência.",
                  ].map((item) => (
                    <li key={item} className="flex gap-2 leading-relaxed">
                      <span className="text-[#009246] mt-1 flex-shrink-0">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-[#444] leading-relaxed mt-3">
                  Você pode configurar seu navegador para recusar cookies, mas isso pode
                  impactar o funcionamento de alguns recursos da plataforma.
                </p>
              </section>

              <hr className="border-[#E8E4DF]" />

              <section id="retencao">
                <h2 className="font-tomato text-xl font-semibold text-[#1B1B1B] mb-3">
                  7. Retenção de Dados
                </h2>
                <p className="text-[#444] leading-relaxed">
                  Mantemos seus dados pelo tempo necessário para cumprir as finalidades
                  descritas nesta política, salvo obrigação legal de retenção por prazo
                  superior. Após o encerramento da conta, os dados pessoais são excluídos
                  em até 90 dias, exceto quando a retenção for exigida por lei (ex.: dados
                  fiscais, que seguem os prazos legais aplicáveis).
                </p>
              </section>

              <hr className="border-[#E8E4DF]" />

              <section id="menores">
                <h2 className="font-tomato text-xl font-semibold text-[#1B1B1B] mb-3">
                  8. Menores de Idade
                </h2>
                <p className="text-[#444] leading-relaxed">
                  A plataforma Versa Delivery é destinada a pessoas jurídicas e pessoas
                  físicas maiores de 18 anos. Não coletamos intencionalmente dados de menores
                  de idade. Caso identifiquemos que dados de menores foram fornecidos sem
                  consentimento parental, procederemos com a exclusão imediata.
                </p>
              </section>

              <hr className="border-[#E8E4DF]" />

              <section id="alteracoes">
                <h2 className="font-tomato text-xl font-semibold text-[#1B1B1B] mb-3">
                  9. Alterações nesta Política
                </h2>
                <p className="text-[#444] leading-relaxed">
                  Esta Política de Privacidade pode ser atualizada periodicamente. Notificaremos
                  você por e-mail sobre alterações relevantes com antecedência mínima de 15 dias.
                  A continuidade do uso da plataforma após esse prazo implica aceitação da
                  política atualizada.
                </p>
              </section>

              <hr className="border-[#E8E4DF]" />

              <section id="contato">
                <h2 className="font-tomato text-xl font-semibold text-[#1B1B1B] mb-3">
                  10. Contato e DPO
                </h2>
                <p className="text-[#444] leading-relaxed mb-4">
                  Para dúvidas, solicitações ou reclamações relacionadas ao tratamento dos
                  seus dados pessoais, entre em contato com nosso Encarregado de Proteção
                  de Dados (DPO):
                </p>
                <div className="p-4 rounded-lg bg-[#F5F3EF] border border-[#E8E4DF] space-y-1">
                  <p className="text-sm text-[#444]">
                    <span className="font-medium text-[#1B1B1B]">E-mail: </span>
                    <a href="mailto:privacidade@versadelivery.com.br" className="text-[#009246] hover:underline">
                      privacidade@versadelivery.com.br
                    </a>
                  </p>
                  <p className="text-sm text-[#444]">
                    <span className="font-medium text-[#1B1B1B]">Suporte geral: </span>
                    <a href="mailto:contato@versadelivery.com.br" className="text-[#009246] hover:underline">
                      contato@versadelivery.com.br
                    </a>
                  </p>
                  <p className="text-sm text-[#858585] mt-2">
                    Respondemos em até 2 dias úteis. Para requisições LGPD, o prazo é de até 15 dias.
                  </p>
                </div>
              </section>
            </div>

            {/* Bottom nav */}
            <div className="mt-12 pt-8 border-t border-[#E8E4DF] flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <Link
                href="/termos"
                className="text-sm text-[#009246] font-medium hover:underline"
              >
                Ver Termos de Uso →
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
            <Link href="/termos" className="hover:text-[#1B1B1B] transition-colors">
              Termos de Uso
            </Link>
            <Link href="/privacidade" className="hover:text-[#1B1B1B] transition-colors font-medium text-[#1B1B1B]">
              Privacidade
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
