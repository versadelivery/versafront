"use client";

import { AuthFormInputProps } from "@/app/types";
import { Input } from "@/components/ui/input";
import { Eye } from "lucide-react";
import { useState } from "react";

export function AuthFormInput({
  type,
  name,
  value,
  onChange,
  placeholder,
  label,
  required = true,
  showPasswordToggle = false
}: AuthFormInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <label className="block text-foreground/40 font-bold mb-2">{label}</label>
      <div className="relative">
        <Input
          type={showPasswordToggle && showPassword ? "text" : type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="rounded-sm bg-transparent w-full p-8 border pr-10 placeholder:text-foreground/40"
          required={required}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
          >
            <Eye className="h-5 w-5 mr-4" />
          </button>
        )}
      </div>
    </div>
  );
}