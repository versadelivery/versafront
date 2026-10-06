/* eslint-disable @typescript-eslint/no-explicit-any */
// Converte um item do pedido vindo da API/WebSocket (JSON:API) no formato usado pelo OrderDetailsModal.
export function mapOrderItem(item: any) {
  return {
    id: item.id,
    catalog_item_id: item.attributes.catalog_item?.data?.id ? parseInt(item.attributes.catalog_item.data.id) : null,
    name: item.attributes.catalog_item?.data?.attributes?.name || item.attributes.name || 'Item não encontrado',
    price: parseFloat(item.attributes.price_with_discount || item.attributes.price),
    total_price: parseFloat(item.attributes.total_price || '0'),
    quantity: item.attributes.quantity,
    observation: item.attributes.observation,
    image: item.attributes.catalog_item?.data?.attributes?.image_url,
    weight: (item.attributes as any).weight != null ? parseFloat((item.attributes as any).weight) : undefined,
    item_type: item.attributes.item_type,
    selected_extras: (item.attributes as any).selected_extras?.map((e: any) => ({
      id: e.id,
      name: e.name,
      price: parseFloat(e.price)
    })) || [],
    selected_prepare_methods: (item.attributes as any).selected_prepare_methods?.map((m: any) => ({
      id: m.id,
      name: m.name
    })) || [],
    available_extras: item.attributes.catalog_item?.data?.attributes?.extra?.data?.map((extra: any) => ({
      id: parseInt(extra.id),
      name: extra.attributes.name,
      price: parseFloat(extra.attributes.price)
    })) || [],
    available_prepare_methods: item.attributes.catalog_item?.data?.attributes?.prepare_method?.data?.map((method: any) => ({
      id: parseInt(method.id),
      name: method.attributes.name
    })) || [],
    prepare_methods_limit: (item.attributes.catalog_item?.data?.attributes as any)?.prepare_methods_limit ?? null,
    assembly_pricing_mode: (item.attributes.catalog_item?.data?.attributes as any)?.assembly_pricing_mode ?? 'sum',
    available_steps: item.attributes.catalog_item?.data?.attributes?.steps?.data?.map((step: any) => ({
      id: parseInt(step.id),
      name: step.attributes.name,
      required: !!step.attributes.required,
      options: step.attributes.options?.data?.map((option: any) => ({
        id: parseInt(option.id),
        name: option.attributes.name,
        price: parseFloat(option.attributes.price) || 0
      })) || []
    })) || [],
    extras: (item.attributes as any).selected_extras?.map((e: any) => ({
      name: e.name,
      price: parseFloat(e.price)
    })) || [],
    prepare_methods: (item.attributes as any).selected_prepare_methods?.map((m: any) => ({
      name: m.name
    })) || [],
    steps: item.attributes.catalog_item?.data?.attributes?.steps?.data?.map((step: any) => ({
      name: step.attributes.name,
      options: step.attributes.options?.data?.map((option: any) => ({
        name: option.attributes.name
      })) || []
    })) || [],
    selected_steps: (item.attributes as any).selected_steps?.map((s: any) => ({
      id: s.id,
      step_name: s.step_name,
      option_name: s.option_name,
      catalog_item_step_id: s.catalog_item_step_id,
      catalog_item_step_option_id: s.catalog_item_step_option_id,
      price: parseFloat(s.price) || 0
    })) || [],
    complements: (item.attributes as any).complements?.map((comp: any) => ({
      name: comp.name,
      price: parseFloat(comp.price)
    })) || []
  };
}
