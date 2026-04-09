"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, GripVertical, Check, X, ListOrdered, RotateCcw, Zap, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/config";
import { API_ENDPOINTS } from "@/api/routes";

interface OrderFlowConfigResponse {
  data: {
    id: string;
    type: string;
    attributes: {
      statuses: string[];
      available_statuses: string[];
      active_order_statuses: string[];
    };
  };
}

const statusLabels: Record<string, string> = {
  received: "Recebido",
  accepted: "Aceito",
  in_analysis: "Em Análise",
  in_preparation: "Em Preparo",
  ready: "Pronto",
  left_for_delivery: "Saiu p/ Entrega",
  delivered: "Entregue",
};

const statusColors: Record<string, string> = {
  received: "bg-red-500",
  accepted: "bg-blue-500",
  in_analysis: "bg-yellow-500",
  in_preparation: "bg-orange-500",
  ready: "bg-primary",
  left_for_delivery: "bg-blue-400",
  delivered: "bg-green-500",
};

const DEFAULT_FLOW = ["received", "accepted", "in_preparation", "ready", "left_for_delivery", "delivered"];

interface Preset {
  id: string;
  name: string;
  description: string;
  statuses: string[];
}

const presets: Preset[] = [
  {
    id: "completo",
    name: "Completo",
    description: "Todas as etapas — ideal para delivery com análise",
    statuses: ["received", "accepted", "in_analysis", "in_preparation", "ready", "left_for_delivery", "delivered"],
  },
  {
    id: "delivery",
    name: "Delivery Padrão",
    description: "Fluxo comum para restaurantes com delivery",
    statuses: ["received", "accepted", "in_preparation", "ready", "left_for_delivery", "delivered"],
  },
  {
    id: "retirada",
    name: "Retirada / Balcão",
    description: "Sem etapa de entrega — cliente retira no local",
    statuses: ["received", "accepted", "in_preparation", "ready", "delivered"],
  },
  {
    id: "rapido",
    name: "Rápido",
    description: "Fluxo enxuto — recebe, prepara e entrega",
    statuses: ["received", "in_preparation", "ready", "delivered"],
  },
  {
    id: "simples",
    name: "Simples",
    description: "Mínimo possível — recebe, prepara e pronto",
    statuses: ["received", "in_preparation", "delivered"],
  },
];

export default function OrderFlowSettingsPage() {
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery({
    queryKey: ["order-flow-config"],
    queryFn: async () => {
      const response = await api.get<OrderFlowConfigResponse>(API_ENDPOINTS.ORDER_FLOW_CONFIG);
      return response.data;
    },
  });

  const [flow, setFlow] = useState<string[]>(DEFAULT_FLOW);
  const [hasChanges, setHasChanges] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const savedFlow = config?.data?.attributes?.statuses ?? DEFAULT_FLOW;
  const availableStatuses = config?.data?.attributes?.available_statuses ?? Object.keys(statusLabels);
  const activeOrderStatuses = config?.data?.attributes?.active_order_statuses ?? [];

  // Status opcionais (podem ser adicionados/removidos)
  const optionalStatuses = availableStatuses.filter(
    (s: string) => s !== "received" && s !== "delivered"
  );

  // Status que não podem ser removidos (têm pedidos em andamento)
  const hasActiveOrders = (status: string) => activeOrderStatuses.includes(status);

  useEffect(() => {
    if (config?.data?.attributes?.statuses) {
      setFlow(config.data.attributes.statuses);
    }
  }, [config]);

  useEffect(() => {
    setHasChanges(JSON.stringify(flow) !== JSON.stringify(savedFlow));
  }, [flow, savedFlow]);

  const { mutate: saveFlow, isPending: isSaving } = useMutation({
    mutationFn: async (statuses: string[]) => {
      await api.put(API_ENDPOINTS.ORDER_FLOW_CONFIG, {
        shop_order_flow_config: { statuses },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order-flow-config"] });
      queryClient.invalidateQueries({ queryKey: ["shop"] });
      toast.success("Fluxo de pedidos atualizado!");
    },
    onError: () => {
      toast.error("Erro ao salvar fluxo de pedidos");
    },
  });

  const isInFlow = (status: string) => flow.includes(status);

  const toggleStatus = (status: string) => {
    if (status === "received" || status === "delivered") return;

    if (isInFlow(status)) {
      if (hasActiveOrders(status)) {
        toast.error(`Não é possível remover "${statusLabels[status]}" — existem pedidos em andamento nesse status`);
        return;
      }
      if (flow.length <= 3) {
        toast.error("O fluxo precisa ter pelo menos 3 etapas");
        return;
      }
      setFlow(flow.filter((s) => s !== status));
    } else {
      // Inserir na posição correta (manter ordem do availableStatuses)
      const newFlow = [...flow];
      const availableIndex = availableStatuses.indexOf(status);
      let insertAt = newFlow.length - 1; // antes de "delivered"
      for (let i = 1; i < newFlow.length; i++) {
        if (availableStatuses.indexOf(newFlow[i]) > availableIndex) {
          insertAt = i;
          break;
        }
      }
      newFlow.splice(insertAt, 0, status);
      setFlow(newFlow);
    }
  };

  const handleDragStart = (index: number) => {
    if (index === 0 || index === flow.length - 1) return;
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (index === 0 || index === flow.length - 1) return;
    if (draggedIndex === null || draggedIndex === index) return;

    const newFlow = [...flow];
    const [dragged] = newFlow.splice(draggedIndex, 1);
    newFlow.splice(index, 0, dragged);
    setFlow(newFlow);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleReset = () => {
    setFlow(DEFAULT_FLOW);
  };

  const handleSave = () => {
    saveFlow(flow);
  };

  const handleCancel = () => {
    setFlow(savedFlow);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E2DD]">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <a
                href="/admin/settings"
                className="flex items-center gap-1.5 text-muted-foreground hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:block">Voltar</span>
              </a>
              <div className="h-6 w-px bg-[#E5E2DD] hidden sm:block" />
              <h1 className="font-tomato text-base sm:text-lg font-bold text-gray-900">
                Fluxo de Pedidos
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Conteudo */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Presets */}
        <div className="bg-white rounded-md border border-[#E5E2DD] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E2DD] flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <h2 className="font-tomato text-base font-semibold text-gray-900">
              Configuração Rápida
            </h2>
          </div>
          <div className="px-5 py-5">
            <p className="text-sm text-muted-foreground mb-4">
              Escolha um modelo pronto ou personalize abaixo.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {presets.map((preset) => {
                const isActive = JSON.stringify(flow) === JSON.stringify(preset.statuses);
                const blockedStatuses = activeOrderStatuses.filter(
                  (s: string) => !preset.statuses.includes(s)
                );
                const isBlocked = blockedStatuses.length > 0;
                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      if (isBlocked) {
                        const names = blockedStatuses.map((s: string) => statusLabels[s] || s).join(", ");
                        toast.error(`Preset indisponível — existem pedidos em: ${names}`);
                        return;
                      }
                      setFlow(preset.statuses);
                    }}
                    className={cn(
                      "flex flex-col items-start gap-1 px-4 py-3 rounded-md border text-left transition-all",
                      isBlocked
                        ? "border-[#E5E2DD] bg-gray-50 opacity-50 cursor-not-allowed"
                        : isActive
                          ? "border-primary bg-white ring-1 ring-primary cursor-pointer"
                          : "border-[#E5E2DD] bg-white hover:border-gray-400 cursor-pointer"
                    )}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <span className="text-sm font-semibold text-gray-900">{preset.name}</span>
                      {isActive && <Check className="w-4 h-4 text-primary ml-auto" />}
                    </div>
                    <span className="text-xs text-muted-foreground">{preset.description}</span>
                    <div className="flex items-center gap-1 mt-1">
                      {preset.statuses.map((s, i) => (
                        <div key={s} className="flex items-center gap-1">
                          <span className={cn("w-1.5 h-1.5 rounded-full", statusColors[s])} />
                          {i < preset.statuses.length - 1 && (
                            <span className="text-[10px] text-gray-300">→</span>
                          )}
                        </div>
                      ))}
                      <span className="text-[10px] text-muted-foreground ml-1">
                        {preset.statuses.length} etapas
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pipeline */}
        <div className="bg-white rounded-md border border-[#E5E2DD] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E2DD] flex items-center gap-2">
            <ListOrdered className="h-4 w-4 text-primary" />
            <h2 className="font-tomato text-base font-semibold text-gray-900">
              Pipeline de Status
            </h2>
          </div>
          <div className="px-5 py-5">
            <p className="text-sm text-muted-foreground mb-4">
              Configure as etapas que um pedido percorre na sua loja. Arraste para reordenar
              os status intermediários. "Recebido" e "Entregue" são obrigatórios.
            </p>

            {/* Flow visual */}
            <div className="space-y-1">
              {flow.map((status, index) => {
                const isFixed = status === "received" || status === "delivered";
                const isDragging = draggedIndex === index;

                return (
                  <div
                    key={status}
                    draggable={!isFixed}
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-md border transition-all",
                      isDragging
                        ? "border-primary bg-[#FAF9F7] opacity-70"
                        : "border-[#E5E2DD] bg-white",
                      !isFixed && "cursor-grab active:cursor-grabbing"
                    )}
                  >
                    {/* Drag handle */}
                    <div className={cn("flex-shrink-0", isFixed && "invisible")}>
                      <GripVertical className="w-4 h-4 text-gray-400" />
                    </div>

                    {/* Step number */}
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#F0EFEB] flex items-center justify-center text-xs font-semibold text-gray-600">
                      {index + 1}
                    </div>

                    {/* Status indicator */}
                    <span className={cn("w-2 h-2 rounded-full flex-shrink-0", statusColors[status])} />

                    {/* Label */}
                    <span className="text-sm font-medium text-gray-900 flex-1">
                      {statusLabels[status] || status}
                    </span>

                    {/* Fixed badge, active orders badge, or remove button */}
                    {isFixed ? (
                      <span className="text-[10px] font-semibold text-muted-foreground underline underline-offset-2 decoration-gray-400">
                        Obrigatório
                      </span>
                    ) : hasActiveOrders(status) ? (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-orange-600 underline underline-offset-2 decoration-orange-600"
                        title="Existem pedidos em andamento neste status"
                      >
                        <AlertCircle className="w-3 h-3" />
                        Pedidos ativos
                      </span>
                    ) : (
                      <button
                        onClick={() => toggleStatus(status)}
                        className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                        title="Remover do fluxo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Connector arrows */}
            <div className="flex items-center justify-center gap-2 my-4 text-xs text-muted-foreground">
              {flow.map((status, i) => (
                <div key={status} className="flex items-center gap-2">
                  <span className={cn("w-2 h-2 rounded-full", statusColors[status])} />
                  {i < flow.length - 1 && <span className="text-gray-400">→</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Status disponíveis para adicionar */}
        <div className="bg-white rounded-md border border-[#E5E2DD] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E2DD]">
            <h2 className="font-tomato text-base font-semibold text-gray-900">
              Etapas Disponíveis
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Clique para adicionar ou remover etapas do fluxo.
            </p>
          </div>
          <div className="px-5 py-4">
            <div className="flex flex-wrap gap-2">
              {optionalStatuses.map((status: string) => {
                const active = isInFlow(status);
                const locked = active && hasActiveOrders(status);
                return (
                  <button
                    key={status}
                    onClick={() => toggleStatus(status)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md border text-sm font-medium transition-all",
                      locked
                        ? "border-orange-600 bg-white text-orange-600 cursor-not-allowed"
                        : active
                          ? "border-primary bg-white text-primary cursor-pointer"
                          : "border-[#E5E2DD] bg-white text-gray-500 hover:border-gray-400 cursor-pointer"
                    )}
                  >
                    <span className={cn("w-2 h-2 rounded-full", statusColors[status])} />
                    {statusLabels[status]}
                    {locked && <AlertCircle className="w-3.5 h-3.5" />}
                    {active && !locked && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <Button
            variant="ghost"
            onClick={handleReset}
            className="text-sm text-muted-foreground cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 mr-1.5" />
            Restaurar padrão
          </Button>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={!hasChanges}
            className="w-full sm:w-auto h-10 rounded-md border border-gray-300 cursor-pointer hover:bg-[#FAF9F7]"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="w-full sm:w-auto h-10 rounded-md bg-primary hover:bg-primary/90 text-white border border-gray-300 cursor-pointer text-base font-semibold"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Salvar alterações"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
