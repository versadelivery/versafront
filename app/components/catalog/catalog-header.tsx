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
      <div className={`flex items-center gap-4 mb-2 ${className}`}>
        <Link href="/admin" className="text-gray-500 hover:text-primary transition-colors cursor-pointer">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
      <p className="text-gray-500 mb-6 sm:mb-8">{description}</p>
    </>
  );
}