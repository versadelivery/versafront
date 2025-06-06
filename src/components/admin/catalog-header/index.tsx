import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Props } from "./types";

export default function AdminHeader({ title, description, className }: Props) {
  return (
    <div className={`max-w-4xl px-4 py-8 ${className}`}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Link 
            href="/admin" 
            className="group flex items-center gap-3 text-muted-foreground hover:text-primary transition-all duration-300 px-4 py-2 rounded-lg hover:bg-primary/10"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="text-sm font-medium">
              Voltar
            </span>
          </Link>
        </div>
        
        <div className="space-y-4">
          <h1 className="font-outfit text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            {title}
          </h1>
          <p className="font-outfit text-lg text-muted-foreground pl-4 border-l-4 border-primary/30 max-w-2xl">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}