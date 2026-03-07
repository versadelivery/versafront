import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Props } from "./types";

export default function AdminHeader({ title, description, className }: Props) {
  return (
    <div className={`w-full px-4 sm:px-6 lg:px-8 py-6 ${className}`}>
      <div className="max-w-[1920px] mx-auto">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Link
              href="/admin"
              className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-[#FAF9F7]"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-sm font-medium">
                Voltar
              </span>
            </Link>
          </div>

          <div className="space-y-2">
            <h1 className="font-tomato text-2xl font-bold text-gray-900">
              {title}
            </h1>
            <p className="text-base text-muted-foreground pl-3 border-l-4 border-primary max-w-2xl">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}