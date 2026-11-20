'use client';

import { Download, Printer } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PrinterConfig } from '@/services/printer-config';
import { buildOrderReceipt, downloadOrderReceipt, printOrderReceipt, ReceiptMode, ReceiptOrder } from '@/utils/order-receipt';
import { enqueuePrintJob } from '@/services/print-jobs';
import { toast } from 'sonner';

interface Props {
  order: ReceiptOrder;
  mode: ReceiptMode | null;
  config: PrinterConfig;
  onClose: () => void;
}

export function OrderReceiptDialog({ order, mode, config, onClose }: Props) {
  if (!mode) return null;
  const fontSize = mode === 'summary' ? config.summary_font_size : config.complete_font_size;
  const title = mode === 'summary' ? 'Impressão resumida' : 'Impressão completa';
  const sendToPrinter = async () => {
    try {
      await enqueuePrintJob(order.id, mode);
      toast.success('Pedido enviado ao conector de impressão');
      onClose();
    } catch {
      toast.error('Não foi possível enviar para a impressora');
    }
  };
  return <Dialog open onOpenChange={open => !open && onClose()}>
    <DialogContent className="gap-0 sm:max-w-2xl overflow-hidden p-0 max-sm:max-w-[calc(100vw-1rem)]">
      <DialogHeader className="border-b border-[#E5E2DD] px-4 py-4 pr-12 text-left sm:px-5"><DialogTitle className="font-tomato text-base font-semibold">{title} · Pedido #{order.id}</DialogTitle></DialogHeader>
      <div className="max-h-[60vh] overflow-auto bg-[#FAF9F7] p-3 sm:p-4">
        <iframe title={`Prévia ${title}`} srcDoc={buildOrderReceipt(order, mode, fontSize, config)} className="mx-auto h-[52vh] w-[340px] max-w-full border border-gray-300 bg-white" />
      </div>
      <div className="flex flex-col gap-2 border-t border-[#E5E2DD] bg-white px-4 py-4 sm:flex-row sm:justify-end sm:px-5">
        <Button variant="outline" className="w-full sm:w-auto" onClick={() => downloadOrderReceipt(order, mode, fontSize, config)}><Download className="mr-2 h-4 w-4" />Baixar PDF</Button>
        <Button variant="outline" className="w-full sm:w-auto" onClick={() => printOrderReceipt(order, mode, fontSize, config)}><Printer className="mr-2 h-4 w-4" />Diálogo do sistema</Button>
        <Button className="order-first w-full sm:order-none sm:w-auto" onClick={sendToPrinter}><Printer className="mr-2 h-4 w-4" />Impressora conectada</Button>
      </div>
    </DialogContent>
  </Dialog>;
}
