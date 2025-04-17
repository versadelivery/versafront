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
    <Link href={href} className="block">
      <div className="bg-background rounded-lg p-6 border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-md">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${iconBgColor}`}>
            <Icon className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-outfit text-lg font-semibold mb-2">{title}</h3>
            <p className="font-outfit text-sm text-muted-foreground mb-4">{description}</p>
            <Button 
              variant="ghost" 
              className="font-outfit text-primary hover:text-primary/80 p-0 h-auto"
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