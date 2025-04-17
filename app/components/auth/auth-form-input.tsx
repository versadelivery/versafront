"use client";

import { AuthFormInputProps } from "@/app/types/utils";
import { Input } from "@/app/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export function AuthFormInput({
  type,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  label,
  required = true,
  showPasswordToggle = false,
  error
}: AuthFormInputProps & {
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <label className="block text-foreground/40 font-bold mb-2">{label}</label>
      <div className="relative">
        <Input
          type={showPasswordToggle ? (showPassword ? "text" : "password") : type}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`rounded-sm bg-transparent w-full p-8 border pr-10 placeholder:text-foreground/40 ${
            error ? "border-red-500" : ""
          }`}
          required={required}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="cursor-pointer not-only:absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}