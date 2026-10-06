'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, Printer, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { DEFAULT_PRINTER_CONFIG, PrinterConfig, updatePrinterConfig } from '@/services/printer-config';
import { usePrinterConfig } from '@/hooks/use-printer-config';

type ReceiptKey = 'summary' | 'complete';

export default function PrinterSettingsPage() {
  const { config, loading } = usePrinterConfig();
  const [draft, setDraft] = useState<PrinterConfig>(DEFAULT_PRINTER_CONFIG);
  const [saving, setSaving] = useState(false);
  useEffect(() => setDraft(config), [config]);

  const setField = <K extends keyof PrinterConfig>(key: K, value: PrinterConfig[K]) =>
    setDraft(current => ({ ...current, [key]: value }));

  const receiptSection = (key: ReceiptKey, title: string, description: string) => {
    const enabledKey = `${key}_enabled` as keyof PrinterConfig;
    const automationKey = `${key}_automation` as keyof PrinterConfig;
    const fontKey = `${key}_font_size` as keyof PrinterConfig;
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
      <p className="text-sm text-gray-600">A impressão automática abre o diálogo de impressão do dispositivo quando um pedido novo chega.</p>
      {receiptSection('summary', 'Impressão resumida', 'Itens, peso, preparo, montagem, adicionais e observações para separação.')}
      {receiptSection('complete', 'Impressão completa', 'Dados da loja e do cliente, itens, valores, entrega e pagamento.')}
    </div>
  </main>;
}
