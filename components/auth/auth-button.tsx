"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthButtonProps } from "@/app/types";

export function AuthButton({
  type = "button",
  variant = "primary",
  className = "",
  withArrow = false,
  children,
  ...props
}: AuthButtonProps) {
  const baseClasses = "font-antarctican-mono rounded-none cursor-pointer w-80 text-lg font-bold p-8";
  
  const variantClasses = variant === "primary" 
    ? "bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white" 
    : "bg-transparent border-2 border-foreground/40 text-foreground/40 hover:border-none hover:bg-foreground/40 hover:text-white";

  const disabledClasses = "opacity-50 cursor-not-allowed";

  return (
    <Button 
      type={type}
      className={cn(
        baseClasses,
        variantClasses,
        props.disabled && disabledClasses,
        className
      )}
      {...props}
    >
      {children}
      {withArrow && <ArrowRight className="h-5 w-5" />}
    </Button>
  );
}