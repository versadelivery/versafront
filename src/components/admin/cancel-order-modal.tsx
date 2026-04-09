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
  onCancelOrder: (orderId: string, reason: string, justification?: string) => void;
}

const CANCEL_REASONS = [
  {
    value: 'client_requested',
    label: 'Cliente solicitou o cancelamento'
  },
  {
    value: 'payment_rejected',
    label: 'Pagamento rejeitado'
  },
  {
    value: 'out_of_stock',
    label: 'Produto fora de estoque'
  },
  {
    value: 'delivery_unavailable',
    label: 'Entrega indisponível'
  },
  {
    value: 'other',
    label: 'Outro motivo'
  }
];

export default function CancelOrderModal({
  open,
  onOpenChange,
  orderId,
  customerName,
  onCancelOrder
}: CancelOrderModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [justification, setJustification] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCancel = async () => {
    if (!selectedReason) {
      alert('Por favor, selecione um motivo para o cancelamento.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Encontrar o label do motivo selecionado
      const selectedReasonLabel = CANCEL_REASONS.find(r => r.value === selectedReason)?.label || selectedReason;
      const fullReason = justification ? `${selectedReasonLabel} - ${justification}` : selectedReasonLabel;
      
      await onCancelOrder(orderId, selectedReason, fullReason);
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
            Cancelar Pedido
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Atenção!</span>
            </div>
            <p className="text-sm text-red-600 mt-1">
              Esta ação não pode ser desfeita. O pedido será movido para a coluna "CANCELADOS".
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pedido de: <span className="font-semibold">{customerName}</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo do cancelamento *
            </label>
            <Select value={selectedReason} onValueChange={setSelectedReason}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um motivo" />
              </SelectTrigger>
              <SelectContent>
                {CANCEL_REASONS.map((reason) => (
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
              {isSubmitting ? 'Cancelando...' : 'Confirmar Cancelamento'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
