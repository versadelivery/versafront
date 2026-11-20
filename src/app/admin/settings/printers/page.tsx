'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Download, Laptop, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { SaveActions, useSaveBar } from '@/components/admin/save-bar';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { DEFAULT_PRINTER_CONFIG, PrinterConfig, PrintTrigger, updatePrinterConfig } from '@/services/printer-config';
import { usePrinterConfig } from '@/hooks/use-printer-config';
import api from '@/api/config';

type ReceiptKey = 'summary' | 'complete';

const statusLabels: Record<string, string> = {
  received: 'Recebido', accepted: 'Aceito', in_analysis: 'Em análise', in_preparation: 'Em preparo',
  ready: 'Pronto', left_for_delivery: 'Saiu para entrega', delivered: 'Entregue',
};

export default function PrinterSettingsPage() {
  const { config, setConfig, loading } = usePrinterConfig();
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

  const segmented = <T extends string>(label: string, current: string, options: readonly (readonly [T, string])[], onChange: (v: T) => void) => (
    <div>
      <p className="mb-2 text-sm font-medium text-gray-800">{label}</p>
      <div className="grid grid-cols-2 gap-1 rounded-md border border-[#E5E2DD] bg-[#FAF9F7] p-1" role="radiogroup" aria-label={label}>
        {options.map(([value, text]) => (
          <button key={value} type="button" role="radio" aria-checked={current === value} onClick={() => onChange(value)}
            className={cn('cursor-pointer rounded px-2 py-2 text-sm font-medium transition-colors', current === value ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-white')}>
            {text}
          </button>
        ))}
      </div>
    </div>
  );

  const receiptSection = (key: ReceiptKey, title: string, description: string) => {
    const enabledKey = `${key}_enabled` as keyof PrinterConfig;
    const automationKey = `${key}_automation` as keyof PrinterConfig;
    const fontKey = `${key}_font_size` as keyof PrinterConfig;
    const triggerKey = `${key}_trigger` as keyof PrinterConfig;
    const enabled = Boolean(draft[enabledKey]);
    return (
      <section className="overflow-hidden rounded-md border border-[#E5E2DD] bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-[#E5E2DD] px-4 py-4 sm:px-5">
          <div className="min-w-0"><h2 className="font-tomato text-base font-semibold text-gray-900">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{description}</p></div>
          <Switch checked={enabled} onCheckedChange={value => setField(enabledKey, value)} aria-label={`Ativar ${title}`} className="shrink-0" />
        </div>
        <fieldset disabled={!enabled} className={cn('grid gap-5 px-4 py-5 sm:grid-cols-2 sm:px-5', !enabled && 'opacity-50')}>
          {segmented('Automação', String(draft[automationKey]), [['manual', 'Manual'], ['automatic', 'Automático']] as const, v => setField(automationKey, v as never))}
          {segmented('Tamanho de itens e observações', String(draft[fontKey]), [['medium', 'Média'], ['large', 'Grande e negrito']] as const, v => setField(fontKey, v as never))}
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-800" htmlFor={`${key}-trigger`}>Imprimir quando</label>
            <Select value={String(draft[triggerKey] || 'received')} onValueChange={value => setField(triggerKey, value as PrintTrigger)} disabled={!enabled}>
              <SelectTrigger id={`${key}-trigger`} className="h-10 w-full border-gray-300 bg-white sm:max-w-sm"><SelectValue /></SelectTrigger>
              <SelectContent>{availableStatuses.map(status => <SelectItem key={status} value={status}>{statusLabels[status] || status}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {key === 'complete' && <div className="border-t border-[#E5E2DD] pt-5 sm:col-span-2">
            <p className="text-sm font-medium text-gray-800">Campos visíveis no cupom</p>
            <p className="mb-3 text-xs text-muted-foreground">Escolha quais dados aparecem na impressão completa.</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {([['complete_show_cnpj', 'CNPJ da loja'], ['complete_show_address', 'Endereço completo'], ['complete_show_phone', 'Telefone do cliente']] as const).map(([field, label]) => (
                <label key={field} className={cn('flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 text-sm transition-colors', draft[field] ? 'border-primary/40 bg-primary/5 text-gray-900' : 'border-[#E5E2DD] text-gray-600')}>
                  <Checkbox checked={draft[field]} onCheckedChange={value => setField(field, value === true)} />{label}
                </label>
              ))}
            </div>
          </div>}
        </fieldset>
      </section>
    );
  };

  const save = async () => {
    try { setSaving(true); const saved = await updatePrinterConfig(draft); setConfig(saved); setDraft(saved); toast.success('Configurações de impressão salvas'); }
    catch { toast.error('Não foi possível salvar as configurações'); }
    finally { setSaving(false); }
  };

  useSaveBar({
    dirty: !loading && JSON.stringify(draft) !== JSON.stringify(config),
    saving,
    onSave: save,
    onCancel: () => setDraft(config),
  });

  return <div className="min-h-screen bg-[#FAF9F7]">
    <div className="border-b border-[#E5E2DD] bg-white">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <Link href="/admin/settings" className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" /><span className="hidden text-sm font-medium sm:block">Voltar</span>
          </Link>
          <div className="hidden h-6 w-px bg-[#E5E2DD] sm:block" />
          <h1 className="truncate font-tomato text-lg font-bold text-gray-900">Impressoras</h1>
        </div>
        <SaveActions />
      </div>
    </div>
    <div className="mx-auto max-w-4xl space-y-4 px-4 py-6 sm:px-6">
      <p className="text-sm text-muted-foreground">{draft.print_target === 'mobile_bluetooth' ? 'O app Versa está selecionado como destino da impressão. A impressora Bluetooth e a fila automática são configuradas no app Android.' : 'A impressão automática envia o pedido ao Conector Versa quando ele entrar no status escolhido. Os status disponíveis seguem o fluxo configurado para esta loja.'}</p>
      <section className="overflow-hidden rounded-md border border-[#E5E2DD] bg-white">
        <div className="flex items-center gap-2 border-b border-[#E5E2DD] px-4 py-4 sm:px-5"><Laptop className="h-4 w-4 text-primary" /><h2 className="font-tomato text-base font-semibold text-gray-900">Instalar o Conector Versa</h2></div>
        <div className="space-y-4 px-4 py-5 sm:px-5">
          <p className="text-sm text-muted-foreground">Baixe no computador conectado à impressora térmica. No Windows, o instalador inclui o runtime e configura a inicialização automática; não é necessário instalar Python.</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild variant="outline" className="w-full sm:w-auto"><a href="https://github.com/versadelivery/versafront/releases/latest/download/VersaPrintConnectorSetup.exe"><Download className="mr-2 h-4 w-4"/>Windows 10/11 (.exe)</a></Button>
            <Button asChild variant="outline" className="w-full sm:w-auto"><a href="/downloads/versa-print-connector-linux.tar.gz" download><Download className="mr-2 h-4 w-4"/>Linux</a></Button>
          </div>
        </div>
      </section>
      {receiptSection('summary', 'Impressão resumida', 'Itens, peso, preparo, montagem, adicionais e observações para separação.')}
      {receiptSection('complete', 'Impressão completa', 'Dados da loja e do cliente, itens, valores, entrega e pagamento.')}
    </div>
  </div>;
}
