"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthButtonProps } from "@/types/utils";
import { Loader2 } from "lucide-react";

export function AuthButton({
  type = "button",
  variant = "primary",
  className = "",
  withArrow = false,
  children,
  isLoading = false,
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
        (props.disabled || isLoading) && disabledClasses,
        className
      )}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin" />
      ) : (
        <>
          {children}
          {withArrow && <ArrowRight className="h-5 w-5" />}
        </>
      )}
    </Button>
  );
}