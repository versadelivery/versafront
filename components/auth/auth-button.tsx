"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface AuthButtonProps {
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  variant?: "primary" | "secondary";
  children: React.ReactNode;
  className?: string;
  withArrow?: boolean;
}

export function AuthButton({
  type = "button",
  onClick,
  variant = "primary",
  children,
  className = "",
  withArrow = false
}: AuthButtonProps) {
  const baseClasses = "font-antarctican-mono rounded-none cursor-pointer w-80 text-lg font-bold p-8";
  
  const variantClasses = variant === "primary" 
    ? "bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white" 
    : "bg-transparent border-2 border-foreground/40 text-foreground/40 hover:border-none hover:bg-foreground/40 hover:text-white";

  return (
    <Button 
      type={type}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses} ${className}`}
    >
      {children}
      {withArrow && <ArrowRight className="h-5 w-5" />}
    </Button>
  );
}