"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface AdminDashboardCardProps {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  iconBgColor: string;
}

export function AdminDashboardCard({
  href,
  icon: Icon,
  title,
  description,
  iconBgColor,
}: AdminDashboardCardProps) {
  return (
    <Link href={href}>
      <Card className="bg-white rounded-sm p-12 shadow-lg border-none h-full">
        <div className="flex flex-col items-start text-center h-full">
          <div className={`${iconBgColor} p-4 rounded-lg mb-4`}>
            <Icon className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-gray-600 text-sm text-start">{description}</p>
        </div>
      </Card>
    </Link>
  );
}