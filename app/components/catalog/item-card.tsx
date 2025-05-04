import Image from "next/image";

interface ItemCardProps {
  item: {
    id?: number;
    catalog_group_id: number;
    name: string;
    description?: string;
    item_type: string;
    unit_of_measurement?: string;
    price: number;
    price_with_discount?: number;
    min_weight?: number;
    max_weight?: number;
    measure_interval?: number;
    image?: string;
    catalog_item_extras_attributes?: any[];
    catalog_item_prepare_methods_attributes?: any[];
    catalog_item_steps_attributes?: any[];
  };
}

export function ItemCard({ item }: ItemCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden w-full max-w-sm">
      {item.image && (
        <div className="relative h-48 w-full">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
          />
        </div>
      )}
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
        
        {item.description && (
          <p className="text-sm text-gray-600 mt-2">{item.description}</p>
        )}
        
        <div className="mt-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-900">
              R$ {item.price ? item.price.toFixed(2).replace('.', ',') : '0,00'}
            </span>
            {item.price_with_discount && (
              <span className="text-sm text-gray-500 line-through">
                R$ {item.price_with_discount ? item.price_with_discount.toFixed(2).replace('.', ',') : '0,00'}
              </span>
            )}
          </div>
          
          {item.unit_of_measurement && (
            <p className="text-sm text-gray-500 mt-1">
              {item.min_weight && item.max_weight ? (
                `${item.min_weight} - ${item.max_weight} ${item.unit_of_measurement}`
              ) : (
                item.unit_of_measurement
              )}
            </p>
          )}
          
          {item.measure_interval && (
            <p className="text-sm text-gray-500 mt-1">
              Intervalo: {item.measure_interval} {item.unit_of_measurement}
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 