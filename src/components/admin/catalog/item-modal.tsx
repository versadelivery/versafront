"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import { Camera, Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useCatalogGroup } from "@/hooks/useCatalogGroup";
import { useCatalogComplement } from "@/hooks/useCatalogComplement";
import { Checkbox } from "@/components/ui/checkbox";


// =============================================================================
// TIPOS
// =============================================================================

interface NewItemModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Extra {
  name: string;
  price: string;
}

interface PrepareMethod {
  name: string;
}

interface StepOption {
  name: string;
}

interface Step {
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

export function NewItemModal({ isOpen, onOpenChange }: NewItemModalProps) {
  // Hooks
  const { catalog, isLoading, createCatalogItem, isCreatingItem } = useCatalogGroup();

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



  // Estados - Erros
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Variáveis derivadas
  const priceNumber = parseFloat(price.replace(',', '.')) || 0;

  const calculateFinalPrice = () => {
    if (!hasDiscount || !discountValue) return priceNumber;
    const discountNum = parseFloat(discountValue.replace(',', '.')) || 0;
    if (discountType === 'percentage') {
      return Math.max(0, priceNumber - (priceNumber * discountNum / 100));
    }
    return Math.max(0, priceNumber - discountNum);
  };

  const finalPrice = calculateFinalPrice();
  const allActiveDays = Object.values(activeDays).every(v => v);

  // =============================================================================
  // EFEITOS
  // =============================================================================

  useEffect(() => {
    if (isOpen && catalog?.data?.[0]?.id && !selectedGroupId) {
      setSelectedGroupId(catalog.data[0].id);
    }
  }, [isOpen, catalog]);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // =============================================================================
  // FUNÇÕES AUXILIARES
  // =============================================================================

  const resetForm = () => {
    setName('');
    setDescription('');
    setSelectedGroupId(catalog?.data?.[0]?.id || '');
    setItemType('unit');
    setPrice('');
    setMinWeight('');
    setMaxWeight('');
    setMeasureInterval('');
    setPreviewImage(null);
    setImageFile(null);
    setHasDiscount(false);
    setDiscountType('fixed');
    setDiscountValue('');
    setHasExtras(false);
    setExtras([{ name: '', price: '' }]);
    setHasPrepareMethods(false);
    setPrepareMethods([{ name: '' }]);
    setHasSteps(false);
    setSteps([{ name: '', options: [{ name: '' }] }]);
    setNewTag(false);
    setBestSellerTag(false);
    setHighlight(false);
    setPromotionTag(false);
    setActiveDays(DEFAULT_ACTIVE_DAYS);
    setActive(true);

    setErrors({});
  };

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
    newMethods[index] = { name: value };
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
    newSteps[stepIndex].options[optionIndex] = { name: value };
    setSteps(newSteps);
  };

  // =============================================================================
  // SUBMIT
  // =============================================================================

  const handleSubmit = () => {
    if (!validateForm()) return;

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('description', description.trim());
    formData.append('catalog_group_id', selectedGroupId);
    formData.append('item_type', itemType);
    formData.append('price', priceNumber.toString());

    // Desconto
    if (hasDiscount && discountValue && finalPrice > 0 && finalPrice < priceNumber) {
      formData.append('price_with_discount', finalPrice.toString());
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



    // Extras - filtrar apenas os que têm nome preenchido
    if (hasExtras) {
      const validExtras = extras.filter((extra) => extra.name.trim() !== '');
      validExtras.forEach((extra, index) => {
        formData.append(`catalog_item_extras_attributes[${index}][name]`, extra.name.trim());
        formData.append(`catalog_item_extras_attributes[${index}][price]`, (parseFloat(extra.price.replace(',', '.')) || 0).toString());
      });
    }

    // Modos de preparo
    if (hasPrepareMethods) {
      const validMethods = prepareMethods.filter((method) => method.name.trim() !== '');
      validMethods.forEach((method, index) => {
        formData.append(`catalog_item_prepare_methods_attributes[${index}][name]`, method.name.trim());
      });
    }

    // Etapas
    if (hasSteps) {
      let stepIndex = 0;
      steps.forEach((step) => {
        if (step.name.trim() === '') return;
        const validOptions = step.options.filter((option) => option.name.trim() !== '');
        if (validOptions.length === 0) return;

        formData.append(`catalog_item_steps_attributes[${stepIndex}][name]`, step.name.trim());
        validOptions.forEach((option, optionIndex) => {
          formData.append(`catalog_item_steps_attributes[${stepIndex}][catalog_item_step_options_attributes][${optionIndex}][name]`, option.name.trim());
        });
        stepIndex++;
      });
    }

    createCatalogItem(formData);
    handleClose();
  };

  const handleClose = () => {
    if (isCreatingItem) return;
    resetForm();
    onOpenChange(false);
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="rounded-lg sm:max-w-[640px] p-0 bg-white max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
          <DialogTitle className="text-lg font-semibold">Novo Item</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Adicione um novo item ao catálogo
          </DialogDescription>
        </DialogHeader>

        {/* Formulário */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* SEÇÃO: DADOS BÁSICOS */}
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
                <Image src={previewImage} alt="Preview" width={200} height={112} className="w-full h-full object-cover" />
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
                  className={`relative flex flex-col items-center justify-center py-3 rounded-xl border-2 transition-all duration-200 ${
                    isActive 
                      ? 'bg-primary/5 border-primary text-primary shadow-sm' 
                      : 'bg-transparent border-gray-100 text-gray-400 border-dashed hover:border-gray-300'
                  }`}
                >
                  <span className={`text-[10px] font-bold uppercase mb-0.5 ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                    {label}
                  </span>
                  <div className={`w-1.5 h-1.5 rounded-full mt-1 ${isActive ? 'bg-primary' : 'bg-gray-200'}`} />
                </button>
              );
            })}
          </div>

          <hr className="border-gray-100" />
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Complementos Compartilhados</p>
            {complementGroups.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma lista de complementos cadastrada.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {complementGroups.map((group: any) => (
                  <div key={group.id} className="flex items-center space-x-2 p-2 rounded-lg border border-gray-100 bg-gray-50/50">
                    <Checkbox
                      id={`comp-${group.id}`}
                      checked={selectedComplements.includes(group.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedComplements([...selectedComplements, group.id]);
                        } else {
                          setSelectedComplements(selectedComplements.filter(id => id !== group.id));
                        }
                      }}
                    />
                    <label
                      htmlFor={`comp-${group.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {group.attributes.name}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <hr className="border-gray-100" />
          <div className="flex items-center justify-between rounded-lg p-3 bg-muted/40">
            <span className="text-sm font-medium">Possui adicionais?</span>
            <Switch checked={hasExtras} onCheckedChange={setHasExtras} />
          </div>


          {hasExtras && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Campos vazios serão ignorados ao salvar</p>
              {extras.map((extra, index) => (
                <div key={index} className="flex items-center gap-2">
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
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={() => handleRemoveExtra(index)}
                    disabled={extras.length <= 1}
                  >
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
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={method.name}
                    onChange={(e) => handlePrepareMethodChange(index, e.target.value)}
                    placeholder="Ex: Mal passado, Ao ponto..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={() => handleRemovePrepareMethod(index)}
                    disabled={prepareMethods.length <= 1}
                  >
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
                <div key={stepIndex} className="bg-muted/30 rounded-lg p-3 space-y-2">
                  {/* Nome da etapa */}
                  <div className="flex items-center gap-2">
                    <Input
                      value={step.name}
                      onChange={(e) => handleStepNameChange(stepIndex, e.target.value)}
                      placeholder="Nome da etapa (ex: Escolha o pão)"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0"
                      onClick={() => handleRemoveStep(stepIndex)}
                      disabled={steps.length <= 1}
                    >
                      <Trash2 className={`h-4 w-4 ${steps.length <= 1 ? 'text-muted-foreground/30' : 'text-destructive'}`} />
                    </Button>
                  </div>

                  {/* Opções da etapa */}
                  <div className="pl-3 border-l-2 border-gray-200 space-y-1.5">
                    <p className="text-xs font-medium">Opções:</p>
                    {step.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center gap-2">
                        <span className="text-muted-foreground text-sm">•</span>
                        <Input
                          value={option.name}
                          onChange={(e) => handleStepOptionChange(stepIndex, optionIndex, e.target.value)}
                          placeholder="Nome da opção"
                          className="flex-1 h-8 text-sm"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          onClick={() => handleRemoveStepOption(stepIndex, optionIndex)}
                          disabled={step.options.length <= 1}
                        >
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
          <Button type="button" variant="outline" className="flex-1" onClick={handleClose} disabled={isCreatingItem}>
            Cancelar
          </Button>
          <Button type="button" className="flex-1" onClick={handleSubmit} disabled={isCreatingItem}>
            {isCreatingItem ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar Item'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
