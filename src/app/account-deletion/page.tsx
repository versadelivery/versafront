export default function AccountDeletionPage() {
  return (
    <div className="min-h-screen bg-white text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-4">Exclusão de Conta e Dados</h1>
        <p className="text-muted-foreground mb-8">
          Esta página explica como solicitar a exclusão da sua conta e dados no aplicativo
          <strong> VERSA Delivery</strong>.
        </p>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Como solicitar a exclusão</h2>
          <ol className="list-disc pl-6 space-y-2">
            <li>
              Dentro do app, acesse <span className="font-medium">Configurações → Conta</span> e
              selecione <span className="font-medium">Excluir conta</span>.
            </li>
            {/* <li>
              Caso não encontre a opção no app ou tenha qualquer dificuldade, você pode
              solicitar diretamente pelo e-mail
              {" "}
              <a
                href="mailto:suporte@versa.delivery?subject=Solicitar%20exclus%C3%A3o%20de%20conta%20e%20dados"
                className="text-blue-600 underline"
              >
                suporte@versa.delivery
              </a>
              {" "}
              informando o e-mail cadastrado e, se possível, o seu nome/ID de usuário.
            </li> */}
          </ol>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Etapas após a solicitação</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Confirmaremos a titularidade da conta por e-mail.</li>
            <li>
              Após a confirmação, iniciaremos o processo de exclusão. Você receberá um
              e-mail quando a exclusão for concluída.
            </li>
            <li>
              Caso haja pedidos ou obrigações legais em andamento, a exclusão poderá ser
              concluída somente após a finalização/regularização dos registros necessários.
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Quais dados são excluídos</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Dados de perfil: nome, e-mail e credenciais de autenticação.</li>
            <li>Preferências do app e histórico de sessões.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Dados que podem ser mantidos</h2>
          <p className="text-muted-foreground mb-2">
            Alguns registros podem ser mantidos por períodos limitados para atender
            obrigações legais, auditoria e prevenção a fraudes. Exemplos:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Registros de pedidos e informações transacionais necessárias para fins
              contábeis e fiscais.
            </li>
            <li>
              Logs de segurança mínimos para investigação de fraudes e garantia da
              integridade do sistema.
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Períodos de retenção</h2>
          <p className="text-muted-foreground">
            Quando aplicável, dados retidos por obrigação legal serão armazenados apenas pelo
            tempo necessário para cumprimento dessas exigências (por exemplo, até 5 anos no
            Brasil para certos registros fiscais) e depois serão eliminados de forma
            segura.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Contato</h2>
          <p className="text-muted-foreground">
            Dúvidas sobre o processo? Fale com nosso suporte em
            {" "}
            <a
              href="mailto:suporte@versa.delivery"
              className="text-blue-600 underline"
            >
              suporte@versa.delivery
            </a>
            .
          </p>
        </section>

        <div className="mt-12">
          <a
            href="mailto:suporte@versa.delivery?subject=Solicitar%20exclus%C3%A3o%20de%20conta%20e%20dados"
            className="inline-flex items-center px-5 py-3 rounded-md bg-black text-white hover:bg-black/90"
          >
            Solicitar exclusão por e-mail
          </a>
        </div>
      </div>
    </div>
  );
}


