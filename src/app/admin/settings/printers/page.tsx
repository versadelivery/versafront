'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Download, Laptop, Printer, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { DEFAULT_PRINTER_CONFIG, PrinterConfig, PrintTrigger, updatePrinterConfig } from '@/services/printer-config';
import { usePrinterConfig } from '@/hooks/use-printer-config';
import api from '@/api/config';

type ReceiptKey = 'summary' | 'complete';

const statusLabels: Record<string, string> = {
  received: 'Recebido', accepted: 'Aceito', in_analysis: 'Em análise', in_preparation: 'Em preparo',
  ready: 'Pronto', left_for_delivery: 'Saiu para entrega', delivered: 'Entregue',
};

export default function PrinterSettingsPage() {
  const { config, loading } = usePrinterConfig();
  const [draft, setDraft] = useState<PrinterConfig>(DEFAULT_PRINTER_CONFIG);
  const [saving, setSaving] = useState(false);
  const { data: flow } = useQuery({
    queryKey: ['order-flow-config-for-printing'],
    queryFn: async () => (await api.get('/shop_order_flow_configs')).data.data.attributes as { statuses: string[] },
  });
  const availableStatuses = flow?.statuses?.length ? flow.statuses : ['received', 'accepted', 'in_preparation', 'ready', 'left_for_delivery', 'delivered'];
  useEffect(() => setDraft(config), [config]);

  const setField = <K extends keyof PrinterConfig>(key: K, value: PrinterConfig[K]) =>
    setDraft(current => ({ ...current, [key]: value }));

  const receiptSection = (key: ReceiptKey, title: string, description: string) => {
    const enabledKey = `${key}_enabled` as keyof PrinterConfig;
    const automationKey = `${key}_automation` as keyof PrinterConfig;
    const fontKey = `${key}_font_size` as keyof PrinterConfig;
    const triggerKey = `${key}_trigger` as keyof PrinterConfig;
    const enabled = Boolean(draft[enabledKey]);
    return (
      <section className="rounded-lg border border-gray-200 bg-white p-5 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div><h2 className="font-semibold text-gray-900">{title}</h2><p className="mt-1 text-sm text-gray-500">{description}</p></div>
          <Switch checked={enabled} onCheckedChange={value => setField(enabledKey, value)} aria-label={`Ativar ${title}`} />
        </div>
        <fieldset disabled={!enabled} className="grid gap-5 border-t border-gray-100 pt-5 sm:grid-cols-2 disabled:opacity-50">
          <div><legend className="mb-2 text-sm font-medium text-gray-800">Automação</legend><div className="space-y-2">
            {([['manual', 'Manual'], ['automatic', 'Automático']] as const).map(([value, label]) => <label key={value} className="flex items-center gap-2 text-sm"><input type="radio" checked={draft[automationKey] === value} onChange={() => setField(automationKey, value)} />{label}</label>)}
          </div></div>
          <div><legend className="mb-2 text-sm font-medium text-gray-800">Tamanho de itens e observações</legend><div className="space-y-2">
            {([['medium', 'Média'], ['large', 'Grande e negrito']] as const).map(([value, label]) => <label key={value} className="flex items-center gap-2 text-sm"><input type="radio" checked={draft[fontKey] === value} onChange={() => setField(fontKey, value)} />{label}</label>)}
          </div></div>
          <div><label className="mb-2 block text-sm font-medium text-gray-800" htmlFor={`${key}-trigger`}>Imprimir quando</label>
            <select id={`${key}-trigger`} value={String(draft[triggerKey] || 'received')} onChange={event => setField(triggerKey, event.target.value as PrintTrigger)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
              {availableStatuses.map(status => <option key={status} value={status}>{statusLabels[status] || status}</option>)}
            </select>
          </div>
        </fieldset>
      </section>
    );
  };

  const save = async () => {
    try { setSaving(true); setDraft(await updatePrinterConfig(draft)); toast.success('Configurações de impressão salvas'); }
    catch { toast.error('Não foi possível salvar as configurações'); }
    finally { setSaving(false); }
  };

  return <main className="min-h-screen bg-gray-50">
    <header className="border-b border-gray-200 bg-white"><div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
      <div className="flex items-center gap-3"><Link href="/admin/settings" className="rounded-md p-2 hover:bg-gray-100"><ArrowLeft className="h-4 w-4" /></Link><Printer className="h-5 w-5" /><h1 className="text-lg font-semibold">Impressoras</h1></div>
      <Button onClick={save} disabled={loading || saving}><Save className="mr-2 h-4 w-4" />{saving ? 'Salvando...' : 'Salvar'}</Button>
    </div></header>
    <div className="mx-auto max-w-4xl space-y-4 px-4 py-6">
      <p className="text-sm text-gray-600">A impressão automática envia o pedido ao Conector Versa quando ele entrar no status escolhido. Os status disponíveis seguem o fluxo configurado para esta loja.</p>
      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <div className="flex items-start gap-3"><Laptop className="mt-0.5 h-5 w-5 text-gray-600"/><div><h2 className="font-semibold text-gray-900">Instalar o Conector Versa</h2><p className="mt-1 text-sm text-gray-500">Baixe no computador conectado à impressora térmica.</p></div></div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild variant="outline"><a href="/downloads/versa-print-connector-windows.zip" download><Download className="mr-2 h-4 w-4"/>Windows 10/11</a></Button>
          <Button asChild variant="outline"><a href="/downloads/versa-print-connector-linux.tar.gz" download><Download className="mr-2 h-4 w-4"/>Linux</a></Button>
        </div>
      </section>
      {receiptSection('summary', 'Impressão resumida', 'Itens, peso, preparo, montagem, adicionais e observações para separação.')}
      {receiptSection('complete', 'Impressão completa', 'Dados da loja e do cliente, itens, valores, entrega e pagamento.')}
    </div>
  </main>;
}
