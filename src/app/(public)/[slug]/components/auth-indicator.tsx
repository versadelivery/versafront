"use client"

import { useState } from 'react';
import { useClient } from "../client-context";
import { User, LogOut, LogIn, UserPlus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from 'next/navigation';

export default function AuthIndicator() {
  const { client, logout } = useClient();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogin = () => {
    const currentPath = window.location.pathname;
    router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
  };

  const handleRegister = () => {
    const currentPath = window.location.pathname;
    router.push(`/auth/register?redirect=${encodeURIComponent(currentPath)}`);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!client) {
    return (
      <div className="flex items-center">
        {/* Desktop */}
        <div className="hidden sm:flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogin}
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <LogIn className="w-4 h-4 mr-1.5" />
            Entrar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegister}
            className="text-sm font-medium border-gray-200 hover:border-gray-300"
          >
            <UserPlus className="w-4 h-4 mr-1.5" />
            Cadastrar
          </Button>
        </div>

        {/* Mobile */}
        <div className="sm:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleLogin} className="cursor-pointer">
                <LogIn className="w-4 h-4 mr-2" />
                Entrar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleRegister} className="cursor-pointer">
                <UserPlus className="w-4 h-4 mr-2" />
                Criar Conta
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors p-2 h-auto"
        >
          <Avatar className="w-8 h-8">
            <AvatarImage src={client.avatar_url} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {getInitials(client.name)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline text-sm font-medium">
            {client.name.split(' ')[0]}
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <div className="px-3 py-2">
          <p className="text-sm font-medium text-foreground">{client.name}</p>
          <p className="text-xs text-muted-foreground">{client.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-destructive hover:text-destructive focus:text-destructive cursor-pointer"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
