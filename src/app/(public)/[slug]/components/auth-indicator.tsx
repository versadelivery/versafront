"use client"

import { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function AuthIndicator({ isDarkHeader = false }: { isDarkHeader?: boolean }) {
  const [customerName, setCustomerName] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('customer_info');
      if (stored) {
        const info = JSON.parse(stored);
        if (info.name) setCustomerName(info.name);
      }
    } catch {
      // ignore
    }
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!customerName) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      className="flex items-center gap-2 transition-colors p-2 h-auto pointer-events-none"
      style={isDarkHeader ? { color: 'rgba(255,255,255,0.85)' } : undefined}
    >
      <Avatar className="w-8 h-8">
        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
          {getInitials(customerName)}
        </AvatarFallback>
      </Avatar>
      <span className="hidden sm:inline text-sm font-medium">
        {customerName.split(' ')[0]}
      </span>
    </Button>
  );
}
