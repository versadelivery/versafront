"use client";

import Link from "next/link";
import { LucideIcon, ArrowRight } from "lucide-react";

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
    <Link href={href} className="block h-full group">
      <div className="bg-white rounded-md p-4 sm:p-5 border border-[#E5E2DD] hover:border-primary/50 transition-colors h-full flex flex-col">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start sm:gap-4 flex-1">
          <div className={`p-2.5 rounded-md ${iconBgColor} shrink-0`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0 w-full text-center sm:flex-1 sm:text-left">
            <h3 className="font-tomato text-sm sm:text-base leading-tight font-semibold text-gray-900 sm:mb-1 break-words sm:truncate">{title}</h3>
            <p className="hidden sm:block text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>
            <span className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
              Acessar
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
