"use client"

import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
        <Search className="h-3.5 w-3.5" />
      </div>

      <input
        type="text"
        placeholder="Pesquisar produtos..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full pl-9 pr-8 py-1.5 border border-gray-200 rounded-full bg-white text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors duration-200"
      />

      {value && (
        <button
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => onChange('')}
          aria-label="Limpar busca"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
