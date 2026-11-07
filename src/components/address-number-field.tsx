"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { NO_NUMBER, isNoNumber } from "@/utils/address-number";

interface AddressNumberFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
  className?: string;
}

// Número do endereço + opção "Sem número" (S/N), sempre em campo separado da rua
export function AddressNumberField({ id, value, onChange, hasError, className }: AddressNumberFieldProps) {
  const noNumber = isNoNumber(value);

  return (
    <div className="flex items-center gap-3">
      <Input
        id={id}
        value={noNumber ? NO_NUMBER : value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => isNoNumber(value) && value !== NO_NUMBER && onChange(NO_NUMBER)}
        placeholder="123"
        maxLength={10}
        disabled={noNumber}
        autoComplete="off"
        aria-invalid={hasError || undefined}
        className={cn("h-11 min-w-0 flex-1", hasError && "border-red-500 focus-visible:ring-red-500", className)}
      />
      <label className="flex shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap text-sm text-gray-700">
        <input
          type="checkbox"
          checked={noNumber}
          onChange={(e) => onChange(e.target.checked ? NO_NUMBER : "")}
          data-testid={`${id}-sn`}
          className="h-4 w-4 accent-[var(--color-primary,#009444)]"
        />
        Sem número (S/N)
      </label>
    </div>
  );
}
