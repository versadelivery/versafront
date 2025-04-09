import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { FieldError } from "react-hook-form";

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder: string;
  icon: ReactNode;
  error?: FieldError;
  register: any;
  className?: string;
}

export function FormField({
  label,
  name,
  type = "text",
  placeholder,
  icon,
  error,
  register,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={name} className="flex items-center gap-2 text-muted-foreground">
        {icon}
        {label}
      </Label>
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        {...register(name)}
        className={error ? "border-destructive" : ""}
      />
      {error && <p className="text-sm text-destructive">{error.message}</p>}
    </div>
  );
}