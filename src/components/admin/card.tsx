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
      <div className="bg-white rounded-md p-5 border border-[#E5E2DD] hover:border-primary/50 transition-colors h-full flex flex-col">
        <div className="flex items-start gap-4 flex-1">
          <div className={`p-2.5 rounded-md ${iconBgColor} shrink-0`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 mb-1 truncate">{title}</h3>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
              Acessar
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
