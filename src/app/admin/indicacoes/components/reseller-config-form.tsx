"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { ResellerConfig } from "../services/reseller-service";
import { useResellerConfig, useUpdateResellerConfig } from "../hooks/useReseller";

const configSchema = z.object({
  pix_key: z.string().optional(),
  pix_key_type: z.string().optional(),
  document: z.string().optional(),
  bank_name: z.string().optional(),
  bank_agency: z.string().optional(),
  bank_account: z.string().optional(),
});

type ConfigFormData = z.infer<typeof configSchema>;

export function ResellerConfigForm() {
  const { data, isLoading } = useResellerConfig();
  const { mutate: updateConfig, isPending } = useUpdateResellerConfig();

  const config: ResellerConfig | undefined = data?.data?.attributes;

  const { register, handleSubmit, setValue, watch } = useForm<ConfigFormData>({
    resolver: zodResolver(configSchema),
  });

  useEffect(() => {
    if (config) {
      setValue("pix_key", config.pix_key ?? "");
      setValue("pix_key_type", config.pix_key_type ?? "");
      setValue("document", config.document ?? "");
      setValue("bank_name", config.bank_name ?? "");
      setValue("bank_agency", config.bank_agency ?? "");
      setValue("bank_account", config.bank_account ?? "");
    }
  }, [config, setValue]);

  const onSubmit = (data: ConfigFormData) => {
    updateConfig(data);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
      <p className="text-sm text-muted-foreground">
        Informe os dados para receber seus repasses de comissão. Estes dados são utilizados
        pelo time para realizar o PIX ou transferência.
      </p>

      <div className="space-y-2">
        <Label>Tipo de chave PIX</Label>
        <Select
          value={watch("pix_key_type") ?? ""}
          onValueChange={(v) => setValue("pix_key_type", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cpf">CPF</SelectItem>
            <SelectItem value="cnpj">CNPJ</SelectItem>
            <SelectItem value="email">E-mail</SelectItem>
            <SelectItem value="phone">Telefone</SelectItem>
            <SelectItem value="random">Chave aleatória</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Chave PIX</Label>
        <Input {...register("pix_key")} placeholder="Sua chave PIX" />
      </div>

      <div className="space-y-2">
        <Label>CPF / CNPJ</Label>
        <Input {...register("document")} placeholder="000.000.000-00" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Banco</Label>
          <Input {...register("bank_name")} placeholder="Nubank" />
        </div>
        <div className="space-y-2">
          <Label>Agência</Label>
          <Input {...register("bank_agency")} placeholder="0001" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Conta</Label>
        <Input {...register("bank_account")} placeholder="12345-6" />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        Salvar dados de recebimento
      </Button>
    </form>
  );
}
