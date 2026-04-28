"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { X, UtensilsCrossed, Loader2 } from "lucide-react";
import { Table, OpenTableSessionPayload } from "../services/table-service";

interface OpenTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: OpenTableSessionPayload) => Promise<void>;
  table: Table | null;
}

export default function OpenTableModal({
  isOpen,
  onClose,
  onSubmit,
  table,
}: OpenTableModalProps) {
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_count: "1",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !table) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        table_id: table.id,
        customer_name: formData.customer_name || undefined,
        customer_count: Number(formData.customer_count) || 1,
        notes: formData.notes || undefined,
      });
      setFormData({ customer_name: "", customer_count: "1", notes: "" });
      onClose();
    } catch (error) {
      console.error("Erro ao abrir comanda:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="font-tomato text-xl font-semibold text-foreground">
                  Abrir Comanda
                </h2>
                <p className="text-sm text-muted-foreground">
                  Mesa {table.attributes.number}
                  {table.attributes.label ? ` - ${table.attributes.label}` : ""}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="customer_name" className="text-sm font-medium text-foreground">
                Nome do cliente (opcional)
              </Label>
              <Input
                id="customer_name"
                type="text"
                placeholder="Ex: Joao Silva"
                value={formData.customer_name}
                onChange={(e) => handleChange("customer_name", e.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_count" className="text-sm font-medium text-foreground">
                Número de pessoas
              </Label>
              <Input
                id="customer_count"
                type="text"
                inputMode="numeric"
                placeholder="Ex: 2"
                value={formData.customer_count}
                onChange={(e) => handleChange("customer_count", e.target.value.replace(/\D/g, ""))}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium text-foreground">
                Observacoes (opcional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Observacoes sobre a mesa..."
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 h-11"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Abrindo...
                  </>
                ) : (
                  "Abrir comanda"
                )}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
