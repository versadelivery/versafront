"use client";

import Link from "next/link";
import { Card } from "@/app/components/ui/card";
import { LucideIcon, ArrowRight, Settings } from "lucide-react";

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
    <Link href={href}>
      <Card className="bg-white rounded-sm p-12 shadow-lg border-none h-full relative">
        <div className="absolute top-8 right-8">
          {actionIcon === "arrow" ? (
            <ArrowRight className="h-5 w-5 text-gray-400" />
          ) : (
            <Settings className="h-5 w-5 text-gray-400" />
          )}
        </div>
        <div className="flex flex-col items-start text-center h-full">
          <div className={`${iconBgColor} p-4 rounded-lg mb-4`}>
            <Icon className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-start">{title}</h3>
          <p className="text-gray-600 text-sm text-start">{description}</p>
        </div>
      </Card>
    </Link>
  );
}