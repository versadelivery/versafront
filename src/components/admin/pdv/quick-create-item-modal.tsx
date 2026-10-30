"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarcodeFields } from "@/components/admin/catalog/barcode-fields";
import { createCatalogItem } from "@/api/requests/catalog_item/requests";
import { formatCurrencyInput, parseCurrencyInput } from "@/utils/format-price";
import { getApiErrorMessage, getApiFieldErrors } from "@/utils/api-error";
import type { CatalogItemLike } from "@/lib/barcode/to-scan-item";

export interface QuickCreateRequest {
  // Texto lido pelo leitor, para repetir a bipada depois que o item existir
  code: string;
  // `barcode`: código de fábrica desconhecido. `scale`: etiqueta de balança com PLU desconhecido.
  kind: "barcode" | "scale";
  scaleCode?: number;
}

export interface CatalogGroupOption {
  id: string;
  name: string;
}

interface QuickCreateItemModalProps {
  request: QuickCreateRequest | null;
  groups: CatalogGroupOption[];
  onClose: () => void;
  // Depois de fechar: o PDV devolve o foco à busca (o Radix devolveria ao botão que abriu)
  onCloseAutoFocus?: () => void;
  // Item criado, no mesmo formato do catálogo (data.id + data.attributes)
  onCreated: (created: CatalogItemLike, request: QuickCreateRequest) => void;
}

type ItemKind = "unit" | "weight_per_kg";

// Valores neutros: o model exige limites de peso nos itens por peso, e a bipada os ignora.
const WEIGHT_LIMITS = { min_weight: "0.001", max_weight: "999", measure_interval: "0.001" };

export function QuickCreateItemModal({ request, groups, onClose, onCloseAutoFocus, onCreated }: QuickCreateItemModalProps) {
  const [name, setName] = useState("");
  const [groupId, setGroupId] = useState("");
  const [price, setPrice] = useState("");
  const [itemKind, setItemKind] = useState<ItemKind>("unit");
  const [scaleCode, setScaleCode] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!request) return;
    setName("");
    setPrice("");
    setErrors({});
    setGroupId(groups[0]?.id ?? "");
    // Etiqueta de balança só existe para item por peso
    setItemKind(request.kind === "scale" ? "weight_per_kg" : "unit");
    setScaleCode(request.scaleCode ? String(request.scaleCode) : "");
  }, [request]); // eslint-disable-line react-hooks/exhaustive-deps

  const validate = () => {
    const found: Record<string, string> = {};
    if (!name.trim()) found.name = "Informe o nome do produto";
    if (!groupId) found.group = "Escolha uma categoria";
    if (!(parseCurrencyInput(price) > 0)) found.price = "Informe o preço";
    if (itemKind === "weight_per_kg" && request?.kind === "scale" && !scaleCode) found.scaleCode = "Informe o código da balança";
    setErrors(found);
    return Object.keys(found).length === 0;
  };

  const handleSubmit = async () => {
    if (!request || submitting || !validate()) return;

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("catalog_group_id", groupId);
    formData.append("item_type", itemKind);
    formData.append("price", String(parseCurrencyInput(price)));
    // Cadastro rápido é só do PDV: não aparece na vitrine do delivery
    formData.append("available_delivery", "false");
    formData.append("active", "true");
    if (request.kind === "barcode") formData.append("barcode", request.code);
    if (itemKind === "weight_per_kg") {
      Object.entries(WEIGHT_LIMITS).forEach(([key, value]) => formData.append(key, value));
      if (scaleCode) formData.append("scale_code", scaleCode);
    }

    setSubmitting(true);
    try {
      const response = await createCatalogItem(formData);
      onCreated(response.data, request);
    } catch (error) {
      const fields = getApiFieldErrors(error);
      const mapped: Record<string, string> = {};
      if (fields.name?.[0]) mapped.name = fields.name[0];
      if (fields.price?.[0]) mapped.price = fields.price[0];
      if (fields.barcode?.[0]) mapped.barcode = fields.barcode[0];
      if (fields.scale_code?.[0]) mapped.scaleCode = fields.scale_code[0];
      if (fields.catalog_group_id?.[0]) mapped.group = fields.catalog_group_id[0];
      setErrors(Object.keys(mapped).length > 0 ? mapped : { form: getApiErrorMessage(error, "Erro ao cadastrar o item") });
    } finally {
      setSubmitting(false);
    }
  };

  const isScaleLabel = request?.kind === "scale";

  return (
    <Dialog open={request !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="w-[calc(100vw-1rem)] max-w-[480px] rounded-lg bg-white"
        onCloseAutoFocus={(event) => {
          if (!onCloseAutoFocus) return;
          event.preventDefault();
          onCloseAutoFocus();
        }}
      >
        <DialogHeader>
          <DialogTitle className="font-tomato text-lg font-semibold">Cadastrar produto</DialogTitle>
          <DialogDescription>
            {isScaleLabel
              ? "A etiqueta da balança trouxe um produto que não está cadastrado. Cadastre para lançar o peso lido."
              : "Esse código ainda não está cadastrado. Cadastre o produto e ele entra no carrinho."}
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}
        >
          <BarcodeFields
            barcode={request?.kind === "barcode" ? request.code : ""}
            scaleCode={scaleCode}
            showScaleCode={itemKind === "weight_per_kg"}
            barcodeReadOnly
            hideBarcode={isScaleLabel}
            errors={{ barcode: errors.barcode, scaleCode: errors.scaleCode }}
            onBarcodeChange={() => {}}
            onScaleCodeChange={(value) => {
              setScaleCode(value);
              setErrors((prev) => ({ ...prev, scaleCode: "" }));
            }}
          />

          <div className="space-y-1.5">
            <Label htmlFor="quick-name">Nome</Label>
            <Input
              id="quick-name"
              autoFocus
              autoComplete="off"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((prev) => ({ ...prev, name: "" }));
              }}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Categoria</Label>
            <Select value={groupId} onValueChange={(value) => { setGroupId(value); setErrors((prev) => ({ ...prev, group: "" })); }}>
              <SelectTrigger className={`w-full ${errors.group ? "border-destructive" : ""}`}>
                <SelectValue placeholder="Escolha a categoria" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.group && <p className="text-xs text-destructive">{errors.group}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select
                value={itemKind}
                onValueChange={(value: ItemKind) => setItemKind(value)}
                disabled={isScaleLabel}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unit">Unidade</SelectItem>
                  <SelectItem value="weight_per_kg">Peso (kg)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="quick-price">{itemKind === "weight_per_kg" ? "Preço do kg" : "Preço"}</Label>
              <Input
                id="quick-price"
                inputMode="decimal"
                autoComplete="off"
                placeholder="0,00"
                value={price}
                onChange={(e) => {
                  setPrice(formatCurrencyInput(e.target.value));
                  setErrors((prev) => ({ ...prev, price: "" }));
                }}
                className={errors.price ? "border-destructive" : ""}
              />
              {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
            </div>
          </div>

          {errors.form && <p className="text-sm text-destructive">{errors.form}</p>}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="border border-gray-300 cursor-pointer">
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting} className="cursor-pointer">
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Cadastrar e adicionar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
