"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import { Camera, Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCatalogGroup, useCatalogItem } from "@/hooks/useCatalogGroup";
import { useCatalogComplement } from "@/hooks/useCatalogComplement";
import { Checkbox } from "@/components/ui/checkbox";

import { updateCatalogItem } from "@/api/requests/catalog_item/requests";
import { DeleteConfirmation } from "@/components/ui/delete-confirmation";
import { toast } from "sonner";
import { fixImageUrl } from "@/utils/image-url";

// =============================================================================
// TIPOS
// =============================================================================

interface EditItemModalProps {
  id: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Extra {
  id?: string;
  name: string;
  price: string;
}

interface PrepareMethod {
  id?: string;
  name: string;
}

interface StepOption {
  id?: string;
  name: string;
}

interface Step {
  id?: string;
  name: string;
  options: StepOption[];
}

// =============================================================================
// CONSTANTES
// =============================================================================

const DAYS_OF_WEEK = [
  { key: 'sunday_active', label: 'Dom' },
  { key: 'monday_active', label: 'Seg' },
  { key: 'tuesday_active', label: 'Ter' },
  { key: 'wednesday_active', label: 'Qua' },
  { key: 'thursday_active', label: 'Qui' },
  { key: 'friday_active', label: 'Sex' },
  { key: 'saturday_active', label: 'Sáb' },
] as const;

type DayKey = typeof DAYS_OF_WEEK[number]['key'];

const DEFAULT_ACTIVE_DAYS: Record<DayKey, boolean> = {
  sunday_active: true,
  monday_active: true,
  tuesday_active: true,
  wednesday_active: true,
  thursday_active: true,
  friday_active: true,
  saturday_active: true,
};

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

export function EditItemModal({ id, isOpen, onOpenChange }: EditItemModalProps) {
  // Hooks
  const queryClient = useQueryClient();
  const { catalog, isLoading } = useCatalogGroup();
  const { catalogItem, isLoadingCatalogItem, deleteCatalogItem, isDeletingCatalogItem } = useCatalogItem(id);

  // Estados - Dados básicos
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [itemType, setItemType] = useState<'unit' | 'weight_per_kg' | 'weight_per_g'>('unit');
  const [price, setPrice] = useState('');
  const [minWeight, setMinWeight] = useState('');
  const [maxWeight, setMaxWeight] = useState('');
  const [measureInterval, setMeasureInterval] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Estados - Desconto
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>('fixed');
  const [discountValue, setDiscountValue] = useState('');

  // Estados - Extras/Adicionais
  const [hasExtras, setHasExtras] = useState(false);
  const [extras, setExtras] = useState<Extra[]>([{ name: '', price: '' }]);

  // Estados - Modos de Preparo
  const [hasPrepareMethods, setHasPrepareMethods] = useState(false);
  const [prepareMethods, setPrepareMethods] = useState<PrepareMethod[]>([{ name: '' }]);

  // Estados - Etapas
  const [hasSteps, setHasSteps] = useState(false);
  const [steps, setSteps] = useState<Step[]>([{ name: '', options: [{ name: '' }] }]);

  // Estados - Tags Visuais
  const [newTag, setNewTag] = useState(false);
  const [bestSellerTag, setBestSellerTag] = useState(false);
  const [highlight, setHighlight] = useState(false);
  const [promotionTag, setPromotionTag] = useState(false);

  // Estados - Dias da semana
  const [activeDays, setActiveDays] = useState<Record<DayKey, boolean>>(DEFAULT_ACTIVE_DAYS);
  const [active, setActive] = useState(true);

  // Estados - Complementos Compartilhados
  const { complementGroups } = useCatalogComplement();
  const [selectedComplements, setSelectedComplements] = useState<string[]>([]);



  // Estados - UI
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [showDisableWarning, setShowDisableWarning] = useState(false);
  const [disableWarningItems, setDisableWarningItems] = useState<string[]>([]);

  // Refs para rastrear se havia dados salvos ao carregar
  const originalHasExtras = useRef(false);
  const originalHasPrepareMethods = useRef(false);
  const originalHasSteps = useRef(false);

  // Variáveis derivadas
  const priceNumber = parseFloat(price.replace(',', '.')) || 0;
  const isFullyLoaded = !isLoading && !isLoadingCatalogItem && !!catalogItem;
  const allActiveDays = Object.values(activeDays).every(v => v);

  const calculateFinalPrice = () => {
    if (!hasDiscount || !discountValue) return priceNumber;
    const discountNum = parseFloat(discountValue.replace(',', '.')) || 0;
    if (discountType === 'percentage') {
      return Math.max(0, priceNumber - (priceNumber * discountNum / 100));
    }
    return Math.max(0, priceNumber - discountNum);
  };

  const finalPrice = calculateFinalPrice();

  // =============================================================================
  // EFEITOS
  // =============================================================================

  // Busca dados frescos ao abrir o modal
  useEffect(() => {
    if (isOpen && id) {
      queryClient.invalidateQueries({ queryKey: ['catalog-item', id] });
    }
  }, [isOpen]);

  // Popular campos quando item carrega
  useEffect(() => {
    if (catalogItem && isOpen) {
      const item = catalogItem.data.attributes;

      setName(item.name || '');
      setDescription(item.description || '');
      setSelectedGroupId(catalogItem.data.attributes.group?.data?.id || '');
      setItemType((item.item_type as any) || 'unit');
      setPrice(item.price ? item.price.toFixed(2).replace('.', ',') : '');
      setMinWeight(item.min_weight ? item.min_weight.toString() : '');
      setMaxWeight(item.max_weight ? item.max_weight.toString() : '');
      setMeasureInterval(item.measure_interval ? item.measure_interval.toString() : '');
      setPreviewImage(item.image_url ? (fixImageUrl(item.image_url) || null) : null);
      setActive(item.active ?? true);


      // Desconto
      if (item.price_with_discount && item.price_with_discount < item.price) {
        setHasDiscount(true);
        setDiscountValue(item.price_with_discount.toFixed(2).replace('.', ','));
        setDiscountType('fixed');
      } else {
        setHasDiscount(false);
        setDiscountValue('');
      }

      // Tags visuais
      setNewTag(!!(item as any).new_tag);
      setBestSellerTag(!!(item as any).best_seller_tag);
      setHighlight(!!(item as any).highlight);
      setPromotionTag(!!(item as any).promotion_tag);

      // Dias da semana
      setActiveDays({
        sunday_active: !!(item as any).sunday_active,
        monday_active: !!(item as any).monday_active,
        tuesday_active: !!(item as any).tuesday_active,
        wednesday_active: !!(item as any).wednesday_active,
        thursday_active: !!(item as any).thursday_active,
        friday_active: !!(item as any).friday_active,
        saturday_active: !!(item as any).saturday_active,
      });

      // Extras
      if (item.extra?.data?.length > 0) {
        setHasExtras(true);
        setExtras(item.extra.data.map((extra: any) => ({
          id: extra.id,
          name: extra.attributes.name,
          price: parseFloat(extra.attributes.price).toFixed(2).replace('.', ','),
        })));
      } else {
        setHasExtras(false);
        setExtras([{ name: '', price: '' }]);
      }

      // Modos de preparo
      if (item.prepare_method?.data?.length > 0) {
        setHasPrepareMethods(true);
        setPrepareMethods(item.prepare_method.data.map((method: any) => ({
          id: method.id,
          name: method.attributes.name,
        })));
      } else {
        setHasPrepareMethods(false);
        setPrepareMethods([{ name: '' }]);
      }

      // Etapas
      if (item.steps?.data?.length > 0) {
        setHasSteps(true);
        setSteps(item.steps.data.map((step: any) => ({
          id: step.id,
          name: step.attributes.name,
          options: step.attributes.options?.data?.map((option: any) => ({
            id: option.id,
            name: option.attributes.name,
          })) || [{ name: '' }],
        })));
      } else {
        setHasSteps(false);
        setSteps([{ name: '', options: [{ name: '' }] }]);
      }

      // Complementos Compartilhados
      if (item.shared_complements?.data) {
        setSelectedComplements(item.shared_complements.data.map((g: any) => g.id));
      } else {
        setSelectedComplements([]);
      }


      // Registra estado original para detectar desativações com dados salvos
      originalHasExtras.current = item.extra?.data?.length > 0;
      originalHasPrepareMethods.current = item.prepare_method?.data?.length > 0;
      originalHasSteps.current = item.steps?.data?.length > 0;
    }
  }, [catalogItem, isOpen]);

  // =============================================================================
  // FUNÇÕES AUXILIARES
  // =============================================================================

  const formatPrice = (value: string) => {
    const numValue = value.replace(/\D/g, '');
    if (!numValue) return '';
    const floatValue = parseFloat(numValue) / 100;
    return floatValue.toFixed(2).replace('.', ',');
  };

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // =============================================================================
  // VALIDAÇÃO
  // =============================================================================

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Mínimo 2 caracteres';
    }

    if (!description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    } else if (description.trim().length < 5) {
      newErrors.description = 'Mínimo 5 caracteres';
    }

    if (!selectedGroupId) {
      newErrors.group = 'Selecione um grupo';
    }

    if (!price) {
      newErrors.price = 'Preço é obrigatório';
    } else if (priceNumber <= 0) {
      newErrors.price = 'Preço deve ser maior que zero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // =============================================================================
  // HANDLERS - IMAGEM
  // =============================================================================

  const handleSelectImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  // =============================================================================
  // HANDLERS - EXTRAS
  // =============================================================================

  const handleAddExtra = () => {
    setExtras([...extras, { name: '', price: '' }]);
  };

  const handleRemoveExtra = (index: number) => {
    if (extras.length > 1) {
      setExtras(extras.filter((_, i) => i !== index));
    }
  };

  const handleExtraChange = (index: number, field: 'name' | 'price', value: string) => {
    const newExtras = [...extras];
    newExtras[index] = { ...newExtras[index], [field]: value };
    setExtras(newExtras);
  };

  // =============================================================================
  // HANDLERS - MODOS DE PREPARO
  // =============================================================================

  const handleAddPrepareMethod = () => {
    setPrepareMethods([...prepareMethods, { name: '' }]);
  };

  const handleRemovePrepareMethod = (index: number) => {
    if (prepareMethods.length > 1) {
      setPrepareMethods(prepareMethods.filter((_, i) => i !== index));
    }
  };

  const handlePrepareMethodChange = (index: number, value: string) => {
    const newMethods = [...prepareMethods];
    newMethods[index] = { ...newMethods[index], name: value };
    setPrepareMethods(newMethods);
  };

  // =============================================================================
  // HANDLERS - ETAPAS
  // =============================================================================

  const handleAddStep = () => {
    setSteps([...steps, { name: '', options: [{ name: '' }] }]);
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const handleStepNameChange = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], name: value };
    setSteps(newSteps);
  };

  const handleAddStepOption = (stepIndex: number) => {
    const newSteps = [...steps];
    newSteps[stepIndex].options.push({ name: '' });
    setSteps(newSteps);
  };

  const handleRemoveStepOption = (stepIndex: number, optionIndex: number) => {
    const newSteps = [...steps];
    if (newSteps[stepIndex].options.length > 1) {
      newSteps[stepIndex].options = newSteps[stepIndex].options.filter((_, i) => i !== optionIndex);
      setSteps(newSteps);
    }
  };

  const handleStepOptionChange = (stepIndex: number, optionIndex: number, value: string) => {
    const newSteps = [...steps];
    newSteps[stepIndex].options[optionIndex] = { ...newSteps[stepIndex].options[optionIndex], name: value };
    setSteps(newSteps);
  };

  // =============================================================================
  // SUBMIT
  // =============================================================================

  const proceedWithSubmit = async () => {
    setShowDisableWarning(false);
    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append('id', id);
      formData.append('name', name.trim());
      formData.append('description', description.trim());
      formData.append('catalog_group_id', selectedGroupId);
      formData.append('item_type', itemType);
      formData.append('price', priceNumber.toString());

      // Desconto
      if (hasDiscount && discountValue && finalPrice > 0 && finalPrice < priceNumber) {
        formData.append('price_with_discount', finalPrice.toString());
      } else {
        formData.append('price_with_discount', '');
      }

      // Campos de peso
      if (itemType !== 'unit') {
        if (minWeight) formData.append('min_weight', minWeight);
        if (maxWeight) formData.append('max_weight', maxWeight);
        if (measureInterval) formData.append('measure_interval', measureInterval);
      }

      // Imagem
      if (imageFile) {
        formData.append('image', imageFile);
      }

      // Tags visuais
      formData.append('new_tag', newTag.toString());
      formData.append('best_seller_tag', bestSellerTag.toString());
      formData.append('highlight', highlight.toString());
      formData.append('promotion_tag', promotionTag.toString());

      // Dias da semana
      DAYS_OF_WEEK.forEach(({ key }) => {
        formData.append(key, activeDays[key].toString());
      });

      formData.append('active', active.toString());

      // Complementos Compartilhados
      selectedComplements.forEach((id) => {
        formData.append('catalog_complement_group_ids[]', id);
      });


      // Extras
      if (hasExtras) {
        const validExtras = extras.filter((extra) => extra.name.trim() !== '');
        validExtras.forEach((extra, index) => {
          if (extra.id) {
            formData.append(`catalog_item_extras_attributes[${index}][id]`, extra.id);
          }
          formData.append(`catalog_item_extras_attributes[${index}][name]`, extra.name.trim());
          formData.append(`catalog_item_extras_attributes[${index}][price]`, (parseFloat(extra.price.replace(',', '.')) || 0).toString());
        });
      } else if (originalHasExtras.current) {
        extras.filter((e) => e.id).forEach((extra, index) => {
          formData.append(`catalog_item_extras_attributes[${index}][id]`, extra.id!);
          formData.append(`catalog_item_extras_attributes[${index}][_destroy]`, 'true');
        });
      }

      // Modos de preparo
      if (hasPrepareMethods) {
        const validMethods = prepareMethods.filter((method) => method.name.trim() !== '');
        validMethods.forEach((method, index) => {
          if (method.id) {
            formData.append(`catalog_item_prepare_methods_attributes[${index}][id]`, method.id);
          }
          formData.append(`catalog_item_prepare_methods_attributes[${index}][name]`, method.name.trim());
        });
      } else if (originalHasPrepareMethods.current) {
        prepareMethods.filter((m) => m.id).forEach((method, index) => {
          formData.append(`catalog_item_prepare_methods_attributes[${index}][id]`, method.id!);
          formData.append(`catalog_item_prepare_methods_attributes[${index}][_destroy]`, 'true');
        });
      }

      // Etapas
      if (hasSteps) {
        let stepIndex = 0;
        steps.forEach((step) => {
          if (step.name.trim() === '') return;
          const validOptions = step.options.filter((option) => option.name.trim() !== '');
          if (validOptions.length === 0) return;

          if (step.id) {
            formData.append(`catalog_item_steps_attributes[${stepIndex}][id]`, step.id);
          }
          formData.append(`catalog_item_steps_attributes[${stepIndex}][name]`, step.name.trim());

          validOptions.forEach((option, optionIndex) => {
            if (option.id) {
              formData.append(`catalog_item_steps_attributes[${stepIndex}][catalog_item_step_options_attributes][${optionIndex}][id]`, option.id);
            }
            formData.append(`catalog_item_steps_attributes[${stepIndex}][catalog_item_step_options_attributes][${optionIndex}][name]`, option.name.trim());
          });
          stepIndex++;
        });
      } else if (originalHasSteps.current) {
        steps.filter((s) => s.id).forEach((step, index) => {
          formData.append(`catalog_item_steps_attributes[${index}][id]`, step.id!);
          formData.append(`catalog_item_steps_attributes[${index}][_destroy]`, 'true');
        });
      }

      await updateCatalogItem(formData);
      queryClient.invalidateQueries({ queryKey: ['catalog'] });
      queryClient.invalidateQueries({ queryKey: ['catalog-item', id] });
      toast.success('Item atualizado com sucesso');
      onOpenChange(false);
    } catch {
      toast.error('Erro ao atualizar item');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const warnings: string[] = [];
    if (!hasExtras && originalHasExtras.current) warnings.push('adicionais');
    if (!hasPrepareMethods && originalHasPrepareMethods.current) warnings.push('modos de preparo');
    if (!hasSteps && originalHasSteps.current) warnings.push('etapas de montagem');

    if (warnings.length > 0) {
      setDisableWarningItems(warnings);
      setShowDisableWarning(true);
      return;
    }

    await proceedWithSubmit();
  };

  const handleDeleteItem = async () => {
    deleteCatalogItem();
    setIsDeleteConfirmationOpen(false);
    onOpenChange(false);
  };

  const handleClose = () => {
    if (isUpdating) return;
    onOpenChange(false);
  };

  // =============================================================================
  // RENDER - LOADING
  // =============================================================================

  if (!isFullyLoaded) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="rounded-lg sm:max-w-[640px] p-0 bg-white">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle>Carregando...</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="rounded-lg sm:max-w-[640px] p-0 bg-white max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
          <DialogTitle className="text-lg font-semibold">Editar Item</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Edite as informações do item
          </DialogDescription>
        </DialogHeader>

        {/* Formulário */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dados do Item</p>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">Item Ativo</span>
              <span className="text-xs text-muted-foreground">O item aparecerá no cardápio se estiver ativo</span>
            </div>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>


          {/* Nome */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Nome *</label>
            <Input
              value={name}
              onChange={(e) => { setName(e.target.value); clearError('name'); }}
              placeholder="Ex: Hambúrguer Artesanal"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Descrição *</label>
            <Textarea
              value={description}
              onChange={(e) => { setDescription(e.target.value); clearError('description'); }}
              placeholder="Descreva o item..."
              rows={3}
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          </div>

          {/* Grupo */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Grupo *</label>
            <Select value={selectedGroupId} onValueChange={(v) => { setSelectedGroupId(v); clearError('group'); }}>
              <SelectTrigger className={errors.group ? 'border-destructive' : ''}>
                <SelectValue placeholder={isLoading ? "Carregando..." : "Selecione um grupo"} />
              </SelectTrigger>
              <SelectContent>
                {catalog?.data?.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.attributes.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.group && <p className="text-xs text-destructive">{errors.group}</p>}
          </div>

          {/* Tipo de Unidade */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Tipo de Unidade</label>
            <Select value={itemType} onValueChange={(v) => setItemType(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unit">Unidade</SelectItem>
                <SelectItem value="weight_per_kg">Peso por kg</SelectItem>
                <SelectItem value="weight_per_g">Peso por g</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Campos de peso */}
          {itemType !== 'unit' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Peso Mínimo</label>
                  <Input type="number" value={minWeight} onChange={(e) => setMinWeight(e.target.value)} placeholder="0" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Peso Máximo</label>
                  <Input type="number" value={maxWeight} onChange={(e) => setMaxWeight(e.target.value)} placeholder="0" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Intervalo de Medida</label>
                <Input type="number" value={measureInterval} onChange={(e) => setMeasureInterval(e.target.value)} placeholder="0" />
              </div>
            </>
          )}

          {/* Preço */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Preço * {itemType === 'weight_per_kg' ? '(por kg)' : itemType === 'weight_per_g' ? '(por g)' : ''}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
              <Input
                value={price}
                onChange={(e) => { setPrice(formatPrice(e.target.value)); clearError('price'); }}
                placeholder="0,00"
                className={`pl-10 ${errors.price ? 'border-destructive' : ''}`}
              />
            </div>
            {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
          </div>

          {/* Desconto */}
          <div className="flex items-center justify-between rounded-lg p-3 bg-muted/40">
            <span className="text-sm font-medium">Produto com desconto?</span>
            <Switch checked={hasDiscount} onCheckedChange={(v) => { setHasDiscount(v); if (!v) setDiscountValue(''); }} />
          </div>

          {hasDiscount && (
            <div className="space-y-3">
              <div className="flex gap-1 bg-muted/40 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setDiscountType('fixed')}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${discountType === 'fixed' ? 'bg-white shadow-sm' : 'text-muted-foreground'}`}
                >
                  R$ Fixo
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountType('percentage')}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${discountType === 'percentage' ? 'bg-white shadow-sm' : 'text-muted-foreground'}`}
                >
                  % Porcentagem
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  {discountType === 'percentage' ? 'Desconto (%)' : 'Valor do Desconto (R$)'}
                </label>
                <Input
                  value={discountValue}
                  onChange={(e) => {
                    if (discountType === 'percentage') {
                      const num = e.target.value.replace(/\D/g, '');
                      const value = Math.min(100, parseInt(num) || 0);
                      setDiscountValue(value ? value.toString() : '');
                    } else {
                      setDiscountValue(formatPrice(e.target.value));
                    }
                  }}
                  placeholder={discountType === 'percentage' ? '0' : '0,00'}
                />
              </div>

              {priceNumber > 0 && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-white border border-gray-100">
                  <span className="text-sm text-muted-foreground">Preço final:</span>
                  <span className="text-sm font-bold">R$ {finalPrice.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
            </div>
          )}

          {/* Imagem */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Imagem</label>
            <button
              type="button"
              onClick={handleSelectImage}
              className="w-full border border-dashed border-gray-300 rounded-lg h-28 flex flex-col items-center justify-center gap-2 hover:bg-muted/30 transition-colors overflow-hidden"
            >
              {previewImage ? (
                <Image src={previewImage} alt="Preview" width={200} height={112} className="w-full h-full object-cover" unoptimized />
              ) : (
                <>
                  <Camera className="h-6 w-6 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Clique para adicionar</span>
                </>
              )}
            </button>
          </div>

          <hr className="border-gray-100" />

          {/* Tags Visuais */}
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tags Visuais</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center justify-between rounded-lg p-3 bg-muted/40">
              <span className="text-sm font-medium">Novo!</span>
              <Switch checked={newTag} onCheckedChange={setNewTag} />
            </div>
            <div className="flex items-center justify-between rounded-lg p-3 bg-muted/40">
              <span className="text-sm font-medium">Mais Vendido</span>
              <Switch checked={bestSellerTag} onCheckedChange={setBestSellerTag} />
            </div>
            <div className="flex items-center justify-between rounded-lg p-3 bg-muted/40">
              <span className="text-sm font-medium">Destaque</span>
              <Switch checked={highlight} onCheckedChange={setHighlight} />
            </div>
            <div className="flex items-center justify-between rounded-lg p-3 bg-muted/40">
              <span className="text-sm font-medium">Promoção</span>
              <Switch checked={promotionTag} onCheckedChange={setPromotionTag} />
            </div>
          </div>

          <hr className="border-gray-100" />
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Adicionais Compartilhados</p>
            </div>
            {complementGroups.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma lista de adicionais cadastrada.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {complementGroups.map((group: any) => {
                  const isSelected = selectedComplements.includes(group.id);
                  return (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setSelectedComplements(selectedComplements.filter(id => id !== group.id));
                        } else {
                          setSelectedComplements([...selectedComplements, group.id]);
                        }
                      }}
                      className={`flex items-center justify-between w-full p-3 rounded-lg border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-primary shadow-sm'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                        {group.attributes.name}
                      </span>
                      <Checkbox
                        id={`comp-edit-${group.id}`}
                        checked={isSelected}
                        className="pointer-events-none"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <hr className="border-gray-100" />
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Disponibilidade Semanal</p>

            <button
              type="button"
              onClick={() => {
                const allActive = Object.values(activeDays).every(v => v);
                const newState = {} as Record<DayKey, boolean>;
                DAYS_OF_WEEK.forEach(day => newState[day.key] = !allActive);
                setActiveDays(newState);
              }}
              className="text-[10px] font-medium text-primary hover:underline uppercase tracking-tight"
            >
              {allActiveDays ? 'Desmarcar todos' : 'Marcar todos'}
            </button>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {DAYS_OF_WEEK.map(({ key, label }) => {
              const isActive = activeDays[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveDays((prev) => ({ ...prev, [key]: !prev[key] }))}
                  className={`relative cursor-pointer flex flex-col items-center justify-center py-3 rounded-xl border-2 transition-all duration-200 ${
                    isActive 
                      ? 'bg-primary border-primary shadow-sm' 
                      : 'bg-transparent border-gray-100 text-gray-400 border-dashed hover:border-gray-300'
                  }`}
                >
                  <span className={`text-[10px] font-bold uppercase mb-0.5 ${isActive ? 'text-white' : 'text-gray-400'}`}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>

          <hr className="border-gray-100" />

          {/* SEÇÃO: ADICIONAIS */}
          <div className="flex items-center justify-between rounded-lg p-3 bg-muted/40">
            <span className="text-sm font-medium">Possui adicionais?</span>
            <Switch checked={hasExtras} onCheckedChange={setHasExtras} />
          </div>

          {hasExtras && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Campos vazios serão ignorados ao salvar</p>
              {extras.map((extra, index) => (
                <div key={extra.id || index} className="flex items-center gap-2">
                  <Input
                    value={extra.name}
                    onChange={(e) => handleExtraChange(index, 'name', e.target.value)}
                    placeholder="Nome do adicional"
                    className="flex-[2]"
                  />
                  <div className="relative flex-1">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">R$</span>
                    <Input
                      value={extra.price}
                      onChange={(e) => handleExtraChange(index, 'price', formatPrice(e.target.value))}
                      placeholder="0,00"
                      className="pl-8"
                    />
                  </div>
                  <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => handleRemoveExtra(index)} disabled={extras.length <= 1}>
                    <Trash2 className={`h-4 w-4 ${extras.length <= 1 ? 'text-muted-foreground/30' : 'text-destructive'}`} />
                  </Button>
                </div>
              ))}
              <button type="button" onClick={handleAddExtra} className="w-full border border-dashed border-gray-300 rounded-lg py-2 flex items-center justify-center gap-1.5 text-sm text-primary hover:bg-muted/30 transition-colors">
                <Plus className="h-4 w-4" /> Adicionar
              </button>
            </div>
          )}

          <hr className="border-gray-100" />

          {/* SEÇÃO: MODOS DE PREPARO */}
          <div className="flex items-center justify-between rounded-lg p-3 bg-muted/40">
            <span className="text-sm font-medium">Possui modos de preparo?</span>
            <Switch checked={hasPrepareMethods} onCheckedChange={setHasPrepareMethods} />
          </div>

          {hasPrepareMethods && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Campos vazios serão ignorados ao salvar</p>
              {prepareMethods.map((method, index) => (
                <div key={method.id || index} className="flex items-center gap-2">
                  <Input
                    value={method.name}
                    onChange={(e) => handlePrepareMethodChange(index, e.target.value)}
                    placeholder="Ex: Mal passado, Ao ponto..."
                    className="flex-1"
                  />
                  <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => handleRemovePrepareMethod(index)} disabled={prepareMethods.length <= 1}>
                    <Trash2 className={`h-4 w-4 ${prepareMethods.length <= 1 ? 'text-muted-foreground/30' : 'text-destructive'}`} />
                  </Button>
                </div>
              ))}
              <button type="button" onClick={handleAddPrepareMethod} className="w-full border border-dashed border-gray-300 rounded-lg py-2 flex items-center justify-center gap-1.5 text-sm text-primary hover:bg-muted/30 transition-colors">
                <Plus className="h-4 w-4" /> Adicionar
              </button>
            </div>
          )}

          <hr className="border-gray-100" />

          {/* SEÇÃO: ETAPAS */}
          <div className="flex items-center justify-between rounded-lg p-3 bg-muted/40">
            <span className="text-sm font-medium">Possui etapas de montagem?</span>
            <Switch checked={hasSteps} onCheckedChange={setHasSteps} />
          </div>

          {hasSteps && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Etapas ou opções vazias serão ignoradas ao salvar</p>
              {steps.map((step, stepIndex) => (
                <div key={step.id || stepIndex} className="bg-muted/30 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      value={step.name}
                      onChange={(e) => handleStepNameChange(stepIndex, e.target.value)}
                      placeholder="Nome da etapa (ex: Escolha o pão)"
                      className="flex-1"
                    />
                    <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => handleRemoveStep(stepIndex)} disabled={steps.length <= 1}>
                      <Trash2 className={`h-4 w-4 ${steps.length <= 1 ? 'text-muted-foreground/30' : 'text-destructive'}`} />
                    </Button>
                  </div>

                  <div className="pl-3 border-l-2 border-gray-200 space-y-1.5">
                    <p className="text-xs font-medium">Opções:</p>
                    {step.options.map((option, optionIndex) => (
                      <div key={option.id || optionIndex} className="flex items-center gap-2">
                        <span className="text-muted-foreground text-sm">•</span>
                        <Input
                          value={option.name}
                          onChange={(e) => handleStepOptionChange(stepIndex, optionIndex, e.target.value)}
                          placeholder="Nome da opção"
                          className="flex-1 h-8 text-sm"
                        />
                        <Button type="button" variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => handleRemoveStepOption(stepIndex, optionIndex)} disabled={step.options.length <= 1}>
                          <Trash2 className={`h-3.5 w-3.5 ${step.options.length <= 1 ? 'text-muted-foreground/30' : 'text-destructive'}`} />
                        </Button>
                      </div>
                    ))}
                    <button type="button" onClick={() => handleAddStepOption(stepIndex)} className="w-full border border-dashed border-gray-200 rounded-md py-1.5 flex items-center justify-center gap-1 text-xs text-primary hover:bg-white transition-colors">
                      <Plus className="h-3 w-3" /> Nova opção
                    </button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={handleAddStep} className="w-full border border-dashed border-gray-300 rounded-lg py-2 flex items-center justify-center gap-1.5 text-sm text-primary hover:bg-muted/30 transition-colors">
                <Plus className="h-4 w-4" /> Nova etapa
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <Button type="button" variant="destructive" className="w-28" onClick={() => setIsDeleteConfirmationOpen(true)} disabled={isDeletingCatalogItem || isUpdating}>
            {isDeletingCatalogItem ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Excluir'}
          </Button>
          <div className="flex-1" />
          <Button type="button" variant="outline" onClick={handleClose} disabled={isUpdating}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isUpdating}>
            {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Atualizar'}
          </Button>
        </div>
      </DialogContent>

      <DeleteConfirmation
        isOpen={isDeleteConfirmationOpen}
        onOpenChange={setIsDeleteConfirmationOpen}
        onConfirm={handleDeleteItem}
        isLoading={isDeletingCatalogItem}
        type="item"
      />

      <Dialog open={showDisableWarning} onOpenChange={setShowDisableWarning}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar desativação</DialogTitle>
            <DialogDescription>
              Ao salvar, todos os{' '}
              <strong>{disableWarningItems.join(' e ')}</strong> cadastrados serão
              excluídos permanentemente. Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowDisableWarning(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={proceedWithSubmit} disabled={isUpdating}>
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirmar e salvar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
