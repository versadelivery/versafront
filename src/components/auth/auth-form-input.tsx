"use client";

import { AuthFormInputProps } from "@/types/utils";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export function AuthFormInput({
  type,
  name,
  value,
  onChange,
  placeholder,
  label,
  required = true,
  disabled = false,
  showPasswordToggle = false,
  error
}: AuthFormInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <label className="block text-sm font-medium text-[#474747] mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={showPasswordToggle ? (showPassword ? "text" : "password") : type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-4 py-3.5 rounded-xl border bg-white text-[#1B1B1B] placeholder:text-[#858585] transition-colors outline-none focus:border-[#009246] focus:ring-1 focus:ring-[#009246] ${
            error ? "border-red-400" : "border-[#E8E4DF]"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          required={required}
          disabled={disabled}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#858585] hover:text-[#474747] cursor-pointer"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        )}
      </div>
      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
    </div>
  );
}
