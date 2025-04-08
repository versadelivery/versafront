"use client"

import { Filter, ChevronDown } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { useState } from 'react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { Group } from '@/app/types/client-catalog'

interface FiltersProps {
  selectedGroups: string[]
  onGroupsChange: (groups: string[]) => void
  priceRange: [number, number]
  onPriceRangeChange: (range: [number, number]) => void
  groups: Group[]
}

export function Filters({
  selectedGroups,
  onGroupsChange,
  priceRange,
  onPriceRangeChange,
  groups,
}: FiltersProps) {
  const [showFilters, setShowFilters] = useState(false)

  const handleGroupChange = (groupId: string) => {
    if (selectedGroups.includes(groupId)) {
      onGroupsChange(selectedGroups.filter(id => id !== groupId))
    } else {
      onGroupsChange([...selectedGroups, groupId])
    }
  }

  return (
    <aside className="w-full md:w-64 flex-shrink-0 bg-white">
      <button
        className="w-full md:hidden mb-4 flex items-center justify-between p-2 border rounded-lg"
        onClick={() => setShowFilters(!showFilters)}
      >
        <span>Filtros</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
      </button>
      
      <div className={`${showFilters ? 'block' : 'hidden'} md:block space-y-6 bg-white`}>
        <Card className='bg-white border-none'>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium">Grupos</h3>
              <ScrollArea className="h-[200px] pr-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="all"
                      checked={selectedGroups.length === 0}
                      onCheckedChange={() => onGroupsChange([])}
                    />
                    <Label htmlFor="all" className="text-sm cursor-pointer">Todos</Label>
                  </div>
                  {groups.map((group) => (
                    <div key={group.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={group.id}
                        checked={selectedGroups.includes(group.id)}
                        onCheckedChange={() => handleGroupChange(group.id)}
                      />
                      <Label 
                        htmlFor={group.id} 
                        className="text-sm cursor-pointer truncate max-w-[200px]"
                        title={group.name}
                      >
                        {group.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium">Faixa de Preço</h3>
              <Slider
                value={priceRange}
                onValueChange={onPriceRangeChange}
                min={0}
                max={500}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>R$ {priceRange[0]}</span>
                <span>R$ {priceRange[1]}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </aside>
  )
} 