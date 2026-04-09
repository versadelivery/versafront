export interface ShopResponse {
  data: {
    id: string
    type: string
    attributes: {
      cellphone: string
      name: string
      slug: string
      image_url?: string | null
      welcome_message?: string | null
      banner_text?: string | null
      banner_active?: boolean
      header_color?: string | null
      background_color?: string | null
      group_color?: string | null
      catalog_layout?: string | null
      accent_color?: string | null
      business_category?: string | null
      shop_delivery_config: {
        data: {
          id: string
          type: string
          attributes: {
            delivery_fee_kind: "to_be_agreed" | "fixed" | "per_neighborhood"
            amount: number
            min_value_free_delivery: string | null
            minimum_order_value: number | null
            shop_delivery_neighborhoods: {
              data: Array<{
                id: string
                type: string
                attributes: {
                  name: string
                  amount: number
                  min_value_free_delivery: string | null
                }
              }>
            }
          }
        }
      }
      shop_payment_config: {
        data: {
          id: string
          type: string
          attributes: {
            cash: boolean
            debit: boolean
            credit: boolean
            manual_pix: boolean
            cash_adjustment_type: string
            cash_adjustment_value: string
            cash_value_type: string
            debit_adjustment_type: string
            debit_adjustment_value: string
            debit_value_type: string
            credit_adjustment_type: string
            credit_adjustment_value: string
            credit_value_type: string
            manual_pix_adjustment_type: string
            manual_pix_adjustment_value: string
            manual_pix_value_type: string
          }
        }
      }
      shop_status?: {
        is_open: boolean
        current_time?: string
        timezone?: string
      }
      catalog_groups: {
        data: Array<{
          id: string
          type: string
          attributes: {
            name: string
            description: string
            priority: number
            image_url: string | null
            items: Array<{
              data: {
                id: string
                type: string
                attributes: {
                  name: string
                  description: string
                  item_type: 'unit' | 'weight' | 'volume'
                  unit_of_measurement: string | null
                  price: string
                  price_with_discount: string | null
                  measure_interval: string | null
                  min_weight: string | null
                  max_weight: string | null
                  priority: number
                  image_url: string | null
                  extra: {
                    data: Array<{
                      id: string
                      type: string
                      attributes: {
                        name: string
                        price: string
                      }
                    }>
                  }
                  prepare_method: {
                    data: Array<{
                      id: string
                      type: string
                      attributes: {
                        name: string
                      }
                    }>
                  }
                  steps: {
                    data: Array<{
                      id: string
                      type: string
                      attributes: {
                        name: string
                        options: {
                          data: Array<{
                            id: string
                            type: string
                            attributes: {
                              name: string
                            }
                          }>
                        }
                      }
                    }>
                  }
                }
              }
            }>
          }
        }>
      }
    }
  }
}

export interface Group {
  storeName: string
  id: string
  name: string
  description: string
  image: string
  order: number
  isActive: boolean
  items: Item[]
  cellphone: string
}

export interface Item {
  id: string
  type: string
  attributes: {
    name: string
    description: string
    item_type: 'unit' | 'weight' | 'volume'
    unit_of_measurement: string | null
    price: string
    price_with_discount: string | null
    measure_interval: string | null
    min_weight: string | null
    max_weight: string | null
    priority: number
    image_url: string | null
    extra: {
      data: Array<{
        id: string
        type: string
        attributes: {
          name: string
          price: string
        }
      }>
    }
    prepare_method: {
      data: Array<{
        id: string
        type: string
        attributes: {
          name: string
        }
      }>
    }
    steps: {
      data: Array<{
        id: string
        type: string
        attributes: {
          name: string
          options: {
            data: Array<{
              id: string
              type: string
              attributes: {
                name: string
              }
            }>
          }
        }
      }>
    }
  }
  isFavorite?: boolean
} 