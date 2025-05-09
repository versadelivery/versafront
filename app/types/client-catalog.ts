export interface ShopResponse {
  data: {
    id: string
    type: string
    attributes: {
      cellphone: string
      name: string
      slug: string
      image_url?: string | null
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