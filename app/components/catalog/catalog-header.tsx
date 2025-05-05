import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  title: string;
  description: string;
  className?: string;
}

export function Header({ title, description, className }: HeaderProps) {
  return (
    <div className={`space-y-4 my-12 ${className}`}>
      <div className="flex items-center gap-4">
        <Link 
          href="/admin" 
          className="group flex items-center gap-2 text-muted-foreground hover:text-primary transition-all duration-300 p-2 rounded-lg hover:bg-primary/10"
        >
          <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
          <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Voltar
          </span>
        </Link>
        <h1 className="font-outfit text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          {title}
        </h1>
      </div>
      <p className="font-outfit text-base text-muted-foreground pl-4 border-l-2 border-primary/20">
        {description}
      </p>
    </div>
  );
}