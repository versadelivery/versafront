"use client";

import Link from "next/link";
import { Card } from "@/app/components/ui/card";
import { LucideIcon, ArrowRight, Settings } from "lucide-react";
import { Button } from "@/app/components/ui/button";

type ActionIconType = "arrow" | "settings" | "edit";

interface AdminDashboardCardProps {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  iconBgColor: string;
  actionIcon?: ActionIconType;
}

export function AdminDashboardCard({
  href,
  icon: Icon,
  title,
  description,
  iconBgColor,
  actionIcon = "arrow",
}: AdminDashboardCardProps) {
  return (
    <Link href={href} className="block h-full">
      <div className="bg-background rounded-lg p-6 border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-md h-full flex flex-col">
        <div className="flex items-start gap-4 flex-1">
          <div className={`p-3 rounded-lg ${iconBgColor} shrink-0`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-outfit text-lg font-semibold mb-2 truncate">{title}</h3>
            <p className="font-outfit text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>
            <Button 
              variant="ghost" 
              className="font-outfit text-primary hover:text-primary/80 p-0 h-auto mt-auto"
            >
              <span className="flex items-center gap-1">
                Acessar
                <ArrowRight className="w-4 h-4" />
              </span>
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}