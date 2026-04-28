// =============================================================================
// WHATSAPP ORDER MESSAGE TEMPLATE
// =============================================================================

const PAYMENT_LABELS: Record<string, string> = {
    credit: 'Cartão de Crédito',
    debit: 'Cartão de Débito',
    manual_pix: 'PIX',
    cash: 'Dinheiro',
};

const STATUS_LABELS: Record<string, string> = {
    recebidos: 'recebido',
    aceitos: 'aceito',
    em_analise: 'em análise',
    em_preparo: 'em preparo',
    prontos: 'pronto para retirada/entrega',
    saiu: 'saiu para entrega',
    entregue: 'entregue',
    cancelled: 'cancelado',
};

interface OrderItem {
    name: string;
    quantity: number;
    totalPrice: number;
    observation?: string;
}

interface WhatsAppOrderMessageParams {
    orderId: string;
    customerName: string;
    status: string;
    items?: OrderItem[];
    paymentMethod?: string;
    deliveryType?: 'delivery' | 'pickup';
    total?: number;
}

/**
 * Constrói uma mensagem de WhatsApp formatada para notificar o cliente sobre o status do pedido.
 */
export function buildWhatsAppOrderMessage({
    orderId,
    customerName,
    status,
    items,
    paymentMethod,
    deliveryType,
    total,
}: WhatsAppOrderMessageParams): string {
    const statusLabel = STATUS_LABELS[status] ?? status;
    const paymentLabel = paymentMethod ? PAYMENT_LABELS[paymentMethod] ?? paymentMethod : null;

    const lines: string[] = [
        `🛍️ *Pedido #${orderId}*`,
        `Olá, *${customerName}*! Seu pedido está *${statusLabel}*.`,
    ];

    if (items && items.length > 0) {
        lines.push('');
        lines.push('📋 *Itens:*');
        items.forEach((item) => {
            const obs = item.observation ? ` _(${item.observation})_` : '';
            lines.push(`• ${item.quantity}x ${item.name}${obs}`);
        });
    }

    if (total !== undefined) {
        lines.push('');
        lines.push(`💰 *Total:* R$ ${total.toFixed(2).replace('.', ',')}`);
    }

    if (paymentLabel) {
        lines.push(`💳 *Pagamento:* ${paymentLabel}`);
    }

    if (deliveryType) {
        lines.push(`🚚 *Tipo:* ${deliveryType === 'pickup' ? 'Retirada na loja' : 'Entrega'}`);
    }

    lines.push('');
    lines.push('Obrigado por escolher a gente! 🙏');

    return lines.join('\n');
}
