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
    <DialogContent className="max-w-xl p-0 overflow-hidden">
      <DialogHeader className="border-b border-gray-200 px-5 py-4"><DialogTitle>{title} · Pedido #{order.id}</DialogTitle></DialogHeader>
      <div className="max-h-[65vh] overflow-auto bg-gray-100 p-4">
        <iframe title={`Prévia ${title}`} srcDoc={buildOrderReceipt(order, mode, fontSize)} className="mx-auto h-[58vh] w-[340px] max-w-full border border-gray-300 bg-white" />
      </div>
      <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-4">
        <Button variant="outline" onClick={() => downloadOrderReceipt(order, mode, fontSize)}><Download className="mr-2 h-4 w-4" />Baixar PDF</Button>
        <Button variant="outline" onClick={() => printOrderReceipt(order, mode, fontSize)}><Printer className="mr-2 h-4 w-4" />Diálogo do sistema</Button>
        <Button onClick={sendToPrinter}><Printer className="mr-2 h-4 w-4" />Impressora conectada</Button>
      </div>
    </DialogContent>
  </Dialog>;
}
