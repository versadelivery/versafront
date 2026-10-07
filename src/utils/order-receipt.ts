/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrintFontSize } from '@/services/printer-config';
import { orderItemQuantityLabel } from '@/utils/order-item-quantity';

export type ReceiptMode = 'summary' | 'complete';
export interface ReceiptOrder { id: string; amount?: number; customerName?: string; socketData?: any; attributes?: any }

const escapeHtml = (value: unknown) => String(value ?? '')
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#039;');

const money = (value: unknown) => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const number = (value: unknown) => Number(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
const whatsappMoney = (value: unknown) => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const paymentLabels: Record<string, string> = {
  cash: 'DINHEIRO', credit: 'CARTÃO DE CRÉDITO', debit: 'CARTÃO DE DÉBITO',
  manual_pix: 'PIX DIRETO', asaas_pix: 'PIX AUTOMÁTICO',
  food_voucher: 'VALE ALIMENTAÇÃO / REFEIÇÃO', store_credit: 'FIADO (A RECEBER)',
};

function itemDetails(item: any, detailed: boolean) {
  const attrs = item.attributes || {};
  const catalog = attrs.catalog_item?.data?.attributes || {};
  const name = escapeHtml(catalog.name || attrs.name || 'Item removido');
  const weight = attrs.weight ? `${detailed ? number(attrs.weight) : Number(attrs.weight).toLocaleString('pt-BR')} kg` : orderItemQuantityLabel(attrs);
  const methods = (attrs.selected_prepare_methods || []).map((entry: any) => entry.name).filter(Boolean).join(', ');
  const steps = (attrs.selected_steps || []).map((entry: any) => `${entry.step_name}: ${entry.option_name}`).join('<br>');
  const extras = [...(attrs.selected_extras || []), ...(attrs.complements || [])].map((entry: any) => entry.name).filter(Boolean).join(', ');
  const price = Number(attrs.price_with_discount || attrs.price || 0);
  return `<div class="item emphasis">
    <strong>${name}</strong>
    <div>${detailed ? `${weight} x ${money(price)}${attrs.weight ? '/kg' : ''}` : `Quantidade/Peso: ${escapeHtml(weight)}`}</div>
    ${methods ? `<div>Preparo: ${escapeHtml(methods)}</div>` : ''}
    ${steps ? `<div>Montagem:<br>${steps}</div>` : ''}
    ${extras ? `<div>Adicionais: ${escapeHtml(extras)}</div>` : ''}
    ${attrs.observation ? `<div>Obs: ${escapeHtml(attrs.observation)}</div>` : ''}
    ${detailed ? `<div>Subtotal: ${money(attrs.total_price)}</div>` : ''}
  </div>`;
}

export function buildOrderReceipt(order: ReceiptOrder, mode: ReceiptMode, fontSize: PrintFontSize) {
  const attrs = order.socketData?.attributes || order.attributes || {};
  const items = attrs.items?.data || [];
  const customer = attrs.customer?.data?.attributes || {};
  const shop = attrs.shop?.data?.attributes || {};
  const address = attrs.address?.data?.attributes || {};
  const createdAt = new Date(attrs.created_at || Date.now());
  const date = createdAt.toLocaleDateString('pt-BR');
  const time = createdAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const type = attrs.withdrawal ? 'RETIRADA' : 'DELIVERY';
  const large = fontSize === 'large';
  const details = items.map((item: any) => itemDetails(item, mode === 'complete')).join('');
  const subtotal = Number(attrs.total_items_price || 0);
  const total = Number(attrs.total_price || order.amount || 0);
  const deliveryFee = Number(attrs.delivery_fee || 0);
  const payment = paymentLabels[attrs.payment_method] || String(attrs.payment_method || 'NÃO INFORMADO').toUpperCase();
  const changeFor = Number(attrs.change_for || attrs.cash_change_for || 0);
  const change = changeFor > 0 ? Math.max(0, changeFor - total) : 0;

  const completeHeader = mode === 'complete' ? `
    <section><strong>${escapeHtml(shop.name || 'VersaDelivery')}</strong><br>
    ${shop.address ? `${escapeHtml(shop.address)}<br>` : ''}${shop.document ? `CNPJ: ${escapeHtml(shop.document)}` : ''}</section>
    <section><strong>PEDIDO #${escapeHtml(order.id)}</strong><br>Data/Hora: ${date} - ${time}<br>
    ${attrs.delivery_person ? `Entregador: ${escapeHtml(attrs.delivery_person)}` : ''}</section>
    <section><strong>CLIENTE:</strong><br>${escapeHtml(customer.name || order.customerName || 'Cliente')}<br>
    ${!attrs.withdrawal && address.address ? `${escapeHtml(address.address)}${address.number ? `, ${escapeHtml(address.number)}` : ''}<br>` : 'Retirada na loja<br>'}
    ${address.neighborhood ? `Bairro: ${escapeHtml(address.neighborhood)}<br>` : ''}${customer.cellphone ? `Fone: ${escapeHtml(customer.cellphone)}` : ''}</section>
    <h2>DETALHAMENTO DO PEDIDO:</h2>` : `
    <header><strong>PEDIDO #${escapeHtml(order.id)}</strong><br>[ ${type} ] &nbsp; ${date.slice(0, 5)} - ${time}<br>Cliente: ${escapeHtml(customer.name || order.customerName || 'Cliente')}</header>
    <h2>ITENS PARA SEPARAÇÃO:</h2>`;

  const financial = mode === 'complete' ? `
    <section><strong>RESUMO FINANCEIRO:</strong><br><br>
    Subtotal dos produtos: ${money(subtotal)}<br>Taxa de Entrega: ${money(deliveryFee)}<br>
    ${Number(attrs.discount_amount || 0) ? `Desconto: -${money(attrs.discount_amount)}<br>` : ''}
    <strong>TOTAL A PAGAR: ${money(total)}</strong></section>
    <section><strong>FORMA DE PAGAMENTO:</strong><br><br>Pagamento: ${escapeHtml(payment)}<br>
    ${changeFor ? `Troco para: ${money(changeFor)}<br>Levar de troco: ${money(change)}` : ''}</section>` : '';

  return `<!doctype html><html><head><meta charset="utf-8"><title>Pedido #${escapeHtml(order.id)}</title><style>
    @page { size: 80mm auto; margin: 4mm; } * { box-sizing: border-box; }
    body { width: 72mm; margin: 0 auto; color: #000; font: 14px/1.4 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
    header, section { border-bottom: 1px dashed #000; padding: 8px 0; } header { text-align: center; }
    h2 { font-size: 15px; margin: 10px 0; } .item { padding: ${mode === 'summary' ? '16px 0' : '7px 0'}; border-bottom: 1px dashed #777; }
    .item > div { margin-top: ${mode === 'summary' ? '12px' : '2px'}; } .emphasis { font-size: ${large ? '19px' : '15px'}; font-weight: ${large ? '700' : '400'}; }
    footer { text-align: center; padding-top: 10px; } @media print { body { width: auto; } }
  </style></head><body>${completeHeader}${details}${financial}<footer>--- VIA ${mode === 'summary' ? 'RESUMIDA' : 'DO CLIENTE'} ---${mode === 'complete' ? '<br>Obrigado pela preferência!<br>www.versadelivery.com.br' : ''}</footer></body></html>`;
}

export function buildWhatsAppReceiptMessage(order: ReceiptOrder) {
  const attrs = order.socketData?.attributes || order.attributes || {};
  const shop = attrs.shop?.data?.attributes || {};
  const customer = attrs.customer?.data?.attributes || {};
  const address = attrs.address?.data?.attributes || {};
  const items = attrs.items?.data || [];
  const createdAt = new Date(attrs.created_at || Date.now());
  const date = createdAt.toLocaleDateString('pt-BR');
  const time = createdAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const total = Number(attrs.total_price || order.amount || 0);
  const deliveryFee = Number(attrs.delivery_fee || 0);
  const discount = Number(attrs.discount_amount || 0);
  const changeFor = Number(attrs.change_for || attrs.cash_change_for || 0);
  const paymentLabels: Record<string, string> = {
    cash: 'Dinheiro', credit: 'Cartão de crédito', debit: 'Cartão de débito',
    manual_pix: attrs.manual_pix_payment_moment === 'on_order' ? 'PIX Direto (no pedido)' : 'PIX Direto (na entrega)',
    asaas_pix: 'PIX Automático', food_voucher: 'Vale alimentação / refeição', store_credit: 'Fiado (a receber)',
  };
  const lines = [
    `🏪 *${shop.name || 'Loja'}*`,
    shop.address ? `📍 ${shop.address}` : '',
    shop.document ? `CNPJ: ${shop.document}` : '',
    '',
    `🧾 *PEDIDO #${order.id}*`,
    `📅 ${date} às ${time} · ${attrs.withdrawal ? 'Retirada' : 'Delivery'}`,
    attrs.delivery_person ? `🛵 Entregador: ${attrs.delivery_person}` : '',
    '',
    '👤 *CLIENTE*',
    customer.name || order.customerName || 'Cliente',
    !attrs.withdrawal && address.address
      ? `📍 ${address.address}${address.number ? `, ${address.number}` : ''}`
      : 'Retirada na loja',
    !attrs.withdrawal && address.neighborhood ? `Bairro: ${address.neighborhood}` : '',
    customer.cellphone ? `📞 ${customer.cellphone}` : '',
    '',
    '🛒 *ITENS DO PEDIDO*',
  ].filter((line, index, all) => line !== '' || (index > 0 && all[index - 1] !== ''));

  items.forEach((item: any) => {
    const itemAttrs = item.attributes || {};
    const catalog = itemAttrs.catalog_item?.data?.attributes || {};
    const name = catalog.name || itemAttrs.name || 'Item removido';
    const quantity = itemAttrs.weight
      ? `${number(itemAttrs.weight)} kg`
      : orderItemQuantityLabel(itemAttrs);
    const unitPrice = Number(itemAttrs.price_with_discount || itemAttrs.price || 0);
    const methods = (itemAttrs.selected_prepare_methods || []).map((entry: any) => entry.name).filter(Boolean).join(', ');
    const steps = (itemAttrs.selected_steps || []).map((entry: any) => `${entry.step_name}: ${entry.option_name}`).filter(Boolean).join(' · ');
    const extras = [...(itemAttrs.selected_extras || []), ...(itemAttrs.complements || [])].map((entry: any) => entry.name).filter(Boolean).join(', ');
    lines.push('', `▪️ *${name}*`, `${quantity} × ${whatsappMoney(unitPrice)}${itemAttrs.weight ? '/kg' : ''}`);
    if (methods) lines.push(`🍳 Preparo: ${methods}`);
    if (steps) lines.push(`🧩 Montagem: ${steps}`);
    if (extras) lines.push(`➕ Adicionais: ${extras}`);
    if (itemAttrs.observation) lines.push(`📝 Observação: ${itemAttrs.observation}`);
    lines.push(`Subtotal: *${whatsappMoney(itemAttrs.total_price)}*`);
  });

  lines.push(
    '', '💰 *RESUMO FINANCEIRO*',
    `Produtos: ${whatsappMoney(attrs.total_items_price)}`,
    `Taxa de entrega: ${whatsappMoney(deliveryFee)}`,
  );
  if (discount) lines.push(`Desconto: −${whatsappMoney(discount)}`);
  lines.push(`*TOTAL A PAGAR: ${whatsappMoney(total)}*`, '', '💳 *FORMA DE PAGAMENTO*');
  lines.push(paymentLabels[attrs.payment_method] || attrs.payment_method || 'Não informado');
  if (changeFor) lines.push(`Troco para: ${whatsappMoney(changeFor)}`, `Levar de troco: ${whatsappMoney(Math.max(0, changeFor - total))}`);
  lines.push('', '━━━━━━━━━━━━━━━━━━', '🙏 Obrigado pela preferência!', 'www.versadelivery.com.br');
  return lines.filter((line, index, all) => line !== '' || (index > 0 && all[index - 1] !== '')).join('\n');
}

export function printOrderReceipt(order: ReceiptOrder, mode: ReceiptMode, fontSize: PrintFontSize) {
  const printWindow = window.open('', '_blank', 'width=420,height=720');
  if (!printWindow) return false;
  printWindow.document.write(buildOrderReceipt(order, mode, fontSize));
  printWindow.document.close();
  printWindow.focus();
  window.setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
  return true;
}

export async function downloadOrderReceipt(order: ReceiptOrder, mode: ReceiptMode, fontSize: PrintFontSize) {
  const { jsPDF } = await import('jspdf');
  const html = buildOrderReceipt(order, mode, fontSize);
  const parsed = new DOMParser().parseFromString(
    html.replace(/<br\s*\/?>/gi, '\n').replace(/<\/(div|section|header|h2|footer)>/gi, '\n'),
    'text/html',
  );
  const rawLines = (parsed.body.textContent || '').split('\n').map(line => line.trim()).filter(Boolean);
  const fontSizePt = fontSize === 'large' ? 14 : 11;
  const wrapped = rawLines.flatMap(line => {
    const max = fontSize === 'large' ? 28 : 38;
    const words = line.split(/\s+/);
    const lines: string[] = [];
    let current = '';
    words.forEach(word => {
      if (`${current} ${word}`.trim().length > max && current) { lines.push(current); current = word; }
      else current = `${current} ${word}`.trim();
    });
    if (current) lines.push(current);
    return lines;
  });
  const lineHeight = fontSize === 'large' ? 6.2 : 4.8;
  const height = Math.max(120, wrapped.length * lineHeight + 16);
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [80, height] });
  pdf.setFont('courier', fontSize === 'large' ? 'bold' : 'normal');
  pdf.setFontSize(fontSizePt);
  wrapped.forEach((line, index) => pdf.text(line, 4, 8 + index * lineHeight));
  pdf.save(`pedido-${order.id}-${mode === 'summary' ? 'resumido' : 'completo'}.pdf`);
}
