import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/app/components/ui/dialog'
import { Form, FormControl, FormItem, FormLabel } from '@/app/components/ui/form'
import { FormField } from '@/app/components/ui/form'
import { Input } from '@/app/components/ui/input'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Textarea } from '@/app/components/ui/textarea'
import { Info, Camera, X, Loader2 } from 'lucide-react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCatalogGroup } from './useCatalogGroup'
import Image from 'next/image'
import { Button } from '@/app/components/ui/button'

export default function GroupModal({ isOpen, onOpenChange }: { isOpen: boolean, onOpenChange: (open: boolean) => void }) {
  const { createCatalogGroup, isCreatingGroup } = useCatalogGroup()
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  
  const form = useForm({
    defaultValues: {
      name: '',
      priority: 1,
      image: undefined,
      description: '',
    },
    resolver: zodResolver(z.object({
      name: z.string().min(1),
      priority: z.number().min(1),
      image: z.instanceof(File).optional(),
      description: z.string().min(1),
    }))
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      form.setValue('image', file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleChangeImageClick = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        form.setValue('image', file)
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreviewImage(reader.result as string)
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  const onSubmit = (data: any) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('priority', data.priority.toString());
    formData.append('image', data.image);
    formData.append('description', data.description);
    createCatalogGroup(formData)
    onOpenChange(false)
    form.reset()
    setPreviewImage(null)
  }
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent className='rounded-xs sm:h-auto max-w-[95vw] sm:max-w-[720px] p-4 sm:p-6 md:p-8 bg-white rounded-sm max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#212121] [&::-webkit-scrollbar-thumb]:rounded-sm [&::-webkit-scrollbar]:px-2'>
      <DialogHeader>
        <DialogTitle className="text-start font-outfit text-xl md:text-2xl font-bold">NOVO GRUPO</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-outfit text-sm font-bold text-foreground">NOME</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: Carne moída" className="border border-gray-300 h-12" />
                </FormControl>
              </FormItem>
            )}
          />
          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="image"
              render={({ field: { onChange, ...rest } }) => (
                <FormItem className="flex-1">
                  <FormLabel className="font-outfit text-sm font-bold text-foreground">IMAGEM</FormLabel>
                  <div className="flex flex-col gap-2">
                    {previewImage ? (
                      <div className="flex items-center justify-center flex-col gap-2 w-[200px]">
                        <Image
                          src={previewImage}
                          alt="Preview"
                          width={200}
                          height={200}
                          className="rounded-xs object-cover w-[200px] h-[200px]"
                        />
                        <button
                          type="button"
                          onClick={handleChangeImageClick}
                          className="cursor-pointer w-[200px] text-sm font-semibold h-10 bg-muted-foreground text-white rounded-xs flex items-center justify-center gap-2 hover:bg-muted-foreground/80 transition-colors"
                        >
                          TROCAR
                          <Camera size={16} />
                        </button>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} name={rest.name} ref={rest.ref} />
                      </div>
                    ) : (
                      <label className="flex h-12 items-center gap-2 border rounded cursor-pointer hover:bg-gray-100 max-w-48">
                        <div className="w-12 h-full bg-black flex items-center justify-center rounded-l">
                          <Camera size={32} className="text-white" />
                        </div>
                        <span className="font-semibold pl-4">Procurar</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} name={rest.name} ref={rest.ref} />
                      </label>
                    )}
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel className="flex items-center gap-1 font-outfit text-sm font-bold text-foreground">PRIORIDADE DO GRUPO <Info size={16} /></FormLabel>
                  <FormControl>
                    <Input {...field} type="number" min={1} className="border border-gray-300 h-12" placeholder="Ex: 1" />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-outfit text-sm font-bold text-foreground">DESCRIÇÃO</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Digite a descrição do grupo" rows={3} className="border border-gray-300 h-12" />
                </FormControl>
              </FormItem>
            )}
          />
          <Button onClick={form.handleSubmit(onSubmit)} className="w-full" disabled={isCreatingGroup}>{isCreatingGroup ? <Loader2 className="animate-spin" /> : 'CRIAR GRUPO'}</Button>
        </form>
      </Form>
    </DialogContent>
  </Dialog>
  )
}
