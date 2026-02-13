/**
 * Constrói a mensagem de confirmação de pedido para WhatsApp a partir do template
 * da loja e dos dados do pedido. A loja envia esta mensagem ao cliente ao clicar
 * no botão WhatsApp na tela de pedidos.
 */

const getPaymentMethodLabel = (method: string): string => {
  const map: Record<string, string> = {
    credit: "Cartão de Crédito",
    debit: "Cartão de Débito",
    manual_pix: "PIX",
    cash: "Dinheiro",
  };
  return map[method] || method;
};

const formatPrice = (value: number | string): string => {
  const n = typeof value === "string" ? parseFloat(value) || 0 : value;
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export interface WhatsAppOrderContext {
  orderId: string;
  socketData: {
    attributes: {
      created_at: string;
      payment_method: string;
      delivery_fee: string | null;
      total_price: string | null;
      total_items_price: string | null;
      withdrawal: boolean;
      customer?: {
        data?: { attributes?: { name?: string; cellphone?: string } };
      };
      address?: {
        data?: {
          attributes?: {
            address?: string;
            neighborhood?: string;
            complement?: string;
            reference?: string;
          };
        };
      };
      shop?: {
        data?: {
          attributes?: {
            name?: string;
            slug?: string;
            cellphone?: string;
          };
        };
      };
      items?: {
        data?: Array<{
          attributes: {
            quantity: number;
            observation?: string;
            total_price: string;
            price?: string;
            catalog_item?: {
              data?: {
                attributes?: {
                  name?: string;
                };
              };
            };
          };
        }>;
      };
    };
  };
  customerName: string;
  amount: number;
  deliveryType: "delivery" | "pickup";
  /** Status atual do pedido no painel (ex.: aceitos, em_preparo, prontos, saiu, entregue). Define a frase principal da mensagem. */
  status?: "recebidos" | "aceitos" | "em_analise" | "em_preparo" | "prontos" | "saiu" | "entregue" | "cancelled";
}

/**
 * Gera o texto dos itens no formato do template (uma linha por item, com obs em itálico).
 */
function buildItensDetalhados(ctx: WhatsAppOrderContext): string {
  const items = ctx.socketData?.attributes?.items?.data ?? [];
  const lines: string[] = [];
  for (const item of items) {
    const attrs = item.attributes;
    const name = attrs.catalog_item?.data?.attributes?.name ?? "Item";
    const qty = attrs.quantity ?? 1;
    const total = parseFloat(attrs.total_price || "0");
    const totalStr = formatPrice(total);
    lines.push(`*➡️ ${qty}x ${name} R$${totalStr}*`);
    if (attrs.observation?.trim()) {
      lines.push(`_${attrs.observation.trim()}_`);
    }
  }
  return lines.join("\n");
}

/**
 * Substitui os placeholders do template pelos valores do pedido.
 * baseUrl: URL pública do app (ex: process.env.NEXT_PUBLIC_SHOP_DOMAIN ou window.location.origin).
 */
/** Frase principal da mensagem conforme o status do pedido (coluna em que a loja clicou no WhatsApp). */
function getMensagemPrincipal(
  status: WhatsAppOrderContext["status"],
  nomeLoja: string
): string {
  const nome = (nomeLoja || "Loja").toUpperCase();
  switch (status) {
    case "prontos":
      return "Seu pedido está *pronto para retirada/entrega*!";
    case "saiu":
      return "Seu pedido *saiu para entrega*!";
    case "entregue":
      return "Seu pedido foi *entregue*!";
    case "em_preparo":
      return "Pedido *" + nome + "* em preparo.";
    case "aceitos":
    case "em_analise":
    case "recebidos":
    default:
      return "Pedido *" + nome + "* aceito!";
  }
}

/** Template padrão quando a loja não configurou um em Notificações. */
export const DEFAULT_WHATSAPP_ORDER_TEMPLATE = `{mensagem_principal}

*Link p/ acompanhar status:* {link_acompanhar}

*SENHA:* {senha}
*Pedido:* {numero_pedido} ({data_hora})
*Tipo:* {tipo_pedido}
*Estimativa:* {estimativa}
*------------------------------*
*NOME:* {nome_cliente}
*Fone:* {fone_cliente}
*Endereço:* {endereco}
*Bairro:* {bairro}
*Complemento:* {complemento}
*------------------------------*
{itens_detalhados}
*------------------------------*
*Itens:* R$ {itens_total}
*Entrega:* R$ {entrega}

*TOTAL:* R$ {total}
*------------------------------*
*Pagamento:* {chave_pix_linha}


*Para repetir este pedido 👇:*
{link_repetir}`;

export function buildWhatsAppOrderMessage(
  template: string,
  ctx: WhatsAppOrderContext,
  baseUrl: string = typeof window !== "undefined" ? window.location.origin : ""
): string {
  const attrs = ctx.socketData?.attributes ?? {};
  const shopAttrs = attrs.shop?.data?.attributes ?? {};
  const customerAttrs = attrs.customer?.data?.attributes ?? {};
  const addressAttrs = attrs.address?.data?.attributes ?? {};

  const createdAt = attrs.created_at ? new Date(attrs.created_at) : new Date();
  const dataHora = createdAt.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const totalPrice = parseFloat(attrs.total_price || "0") || ctx.amount;
  const totalItemsPrice = parseFloat(attrs.total_items_price || "0");
  const deliveryFee = parseFloat(attrs.delivery_fee || "0") || 0;
  const tipoPedido = ctx.deliveryType === "delivery" ? "Delivery" : "Retirada na loja";

  // Senha: últimos 2 dígitos do ID do pedido (numérico) ou "00"
  const numericId = ctx.orderId.replace(/\D/g, "") || "0";
  const senha = numericId.slice(-2) || "00";

  const linkAcompanhar = `${baseUrl.replace(/\/$/, "")}/pedidos/${ctx.orderId}`;
  const linkRepetir = `${baseUrl.replace(/\/$/, "")}/pedidos/${ctx.orderId}`;

  const foneCliente = (customerAttrs.cellphone ?? "").replace(/\D/g, "");
  const chavePix = (shopAttrs.cellphone ?? "").trim();
  const pagamentoLabel = getPaymentMethodLabel(attrs.payment_method || "cash");
  const chavePixLine =
    attrs.payment_method === "manual_pix" && chavePix
      ? `${pagamentoLabel} (chave exibida após o envio)\n*Chave PIX:* ${chavePix} (CPF/CNPJ)`
      : `*Pagamento:* ${pagamentoLabel}`;

  const itensDetalhados = buildItensDetalhados(ctx);

  const nomeCliente = ctx.customerName || customerAttrs.name || "Cliente";
  const enderecoCompleto =
    [addressAttrs.address, addressAttrs.neighborhood, addressAttrs.complement]
      .filter(Boolean)
      .join(", ") || "";

  const nomeLoja = shopAttrs.name ?? "";
  const mensagemPrincipal = getMensagemPrincipal(ctx.status, nomeLoja);

  const replacements: Record<string, string> = {
    "{mensagem_principal}": mensagemPrincipal,
    "{nome_loja}": nomeLoja.toUpperCase(),
    "{link_acompanhar}": linkAcompanhar,
    "{senha}": senha,
    "{numero_pedido}": ctx.orderId,
    "{data_hora}": dataHora,
    "{tipo_pedido}": tipoPedido,
    "{estimativa}": "25 - 45 minutos",
    "{nome_cliente}": nomeCliente,
    "{fone_cliente}": foneCliente,
    "{endereco}": addressAttrs.address ?? "",
    "{bairro}": addressAttrs.neighborhood ?? "",
    "{complemento}": addressAttrs.complement ?? "",
    "{referencia}": addressAttrs.reference ?? "",
    "{itens_detalhados}": itensDetalhados,
    "{itens_resumo}": itensDetalhados,
    "{itens_total}": formatPrice(totalItemsPrice),
    "{entrega}": formatPrice(deliveryFee),
    "{total}": formatPrice(totalPrice),
    "{pagamento}": pagamentoLabel,
    "{chave_pix}": chavePix,
    "{chave_pix_linha}": chavePixLine,
    "{link_repetir}": linkRepetir,
    "{desconto}": "",
    "{cupom}": "",
    "{pontos_ganhos}": "",
    "{endereco_completo}": enderecoCompleto,
  };

  const finalTemplate = (template || "").trim() || DEFAULT_WHATSAPP_ORDER_TEMPLATE;
  let message = finalTemplate;
  for (const [key, value] of Object.entries(replacements)) {
    message = message.split(key).join(value ?? "");
  }
  return message.trim();
}
