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
import { motion } from 'framer-motion';

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
      <motion.div 
        className="flex items-center gap-2"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleLogin}
          className="text-white hover:bg-white/10 hover:text-white transition-colors duration-200"
        >
          <LogIn className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Entrar</span>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRegister}
          className="bg-white/10 text-white border-white/20 hover:bg-white hover:text-black transition-all duration-200"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Cadastrar</span>
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="flex items-center gap-2 text-white hover:bg-white/10 hover:text-white transition-colors duration-200 p-2"
          >
            <Avatar className="w-8 h-8">
              <AvatarImage src={client.avatar_url} />
              <AvatarFallback className="bg-primary/20 text-white text-xs">
                {getInitials(client.name)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline text-sm font-medium">
              {client.name.split(' ')[0]}
            </span>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          align="end" 
          className="w-56 bg-white border border-gray-200 shadow-lg"
        >
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-gray-900">{client.name}</p>
            <p className="text-xs text-gray-500">{client.email}</p>
          </div>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={handleLogout}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
}
