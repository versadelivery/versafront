'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { XCircle, AlertTriangle } from 'lucide-react';

interface CancelOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  customerName: string;
  orderStatus?: string;
  mode?: 'cancel' | 'delivery_failed';
  onCancelOrder: (orderId: string, reason: string, justification?: string) => void;
}

const COMMON_REASONS = [
  { value: 'client_requested', label: 'Cliente solicitou o cancelamento' },
  { value: 'payment_rejected', label: 'Pagamento rejeitado' },
  { value: 'out_of_stock', label: 'Produto fora de estoque' },
  { value: 'delivery_unavailable', label: 'Entrega indisponível' }
];

const DELIVERY_REASONS = [
  { value: 'address_not_found', label: 'Endereço não localizado' },
  { value: 'customer_absent', label: 'Cliente ausente/não atende' },
  { value: 'customer_refused', label: 'Cliente recusou o pedido' },
  { value: 'delivery_area_unsafe', label: 'Área de risco/insegura' },
  { value: 'delivery_refused_no_payment', label: 'Pagamento não realizado' }
];

const OTHER_REASON = { value: 'other', label: 'Outro motivo' };

export default function CancelOrderModal({
  open,
  onOpenChange,
  orderId,
  customerName,
  orderStatus,
  mode = 'cancel',
  onCancelOrder
}: CancelOrderModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [justification, setJustification] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDeliveryFailed = mode === 'delivery_failed';
  const reasons = isDeliveryFailed || orderStatus === 'saiu' || orderStatus === 'left_for_delivery'
    ? [...DELIVERY_REASONS, OTHER_REASON]
    : [...COMMON_REASONS, OTHER_REASON];

  const handleCancel = async () => {
    if (!selectedReason) {
      alert('Por favor, selecione um motivo para o cancelamento.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Encontrar o label do motivo selecionado
      await onCancelOrder(orderId, selectedReason, justification.trim() || undefined);
      onOpenChange(false);
      // Reset form
      setSelectedReason('');
      setJustification('');
    } catch (error) {
      console.error('Erro ao cancelar pedido:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
      setSelectedReason('');
      setJustification('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-tomato flex items-center gap-2 text-red-600">
            <XCircle className="h-5 w-5" />
            {isDeliveryFailed ? 'Entrega Não Realizada' : 'Cancelar Pedido'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Atenção!</span>
            </div>
            <p className="text-sm text-red-600 mt-1">
              {isDeliveryFailed
                ? 'Indique o motivo pelo qual a entrega não pôde ser concluída. O pedido será movido para "CANCELADOS".'
                : 'Esta ação não pode ser desfeita. O pedido será movido para a coluna "CANCELADOS".'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pedido de: <span className="font-semibold">{customerName}</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isDeliveryFailed ? 'Motivo da falha na entrega *' : 'Motivo do cancelamento *'}
            </label>
            <Select value={selectedReason} onValueChange={setSelectedReason}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um motivo" />
              </SelectTrigger>
              <SelectContent>
                {reasons.map((reason: any) => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Justificativa adicional (opcional)
            </label>
            <Textarea
              placeholder="Descreva detalhes adicionais sobre o cancelamento..."
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleCancel}
              disabled={!selectedReason || isSubmitting}
              className="flex-1"
            >
              {isSubmitting
                ? (isDeliveryFailed ? 'Registrando...' : 'Cancelando...')
                : (isDeliveryFailed ? 'Confirmar Falha na Entrega' : 'Confirmar Cancelamento')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
