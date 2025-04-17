import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  title: string;
  description: string;
  className?: string;
}

export function Header({ title, description, className }: HeaderProps) {
  return (
    <>
      <div className={`flex items-center gap-4 mb-3 ${className}`}>
        <Link 
          href="/admin" 
          className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="font-outfit text-2xl font-bold">{title}</h1>
      </div>
      <p className="font-outfit text-base text-muted-foreground mb-8">{description}</p>
    </>
  );
}