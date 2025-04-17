import { AuthFormFooterProps } from "@/app/types/utils";
import Link from "next/link";

export function AuthFormFooter({ isLogin = false }: AuthFormFooterProps) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-foreground/40 font-regular -mt-4">
        {isLogin ? "Ainda não se cadastrou?" : "Já tem uma conta?"}{' '}
        <Link 
          href={isLogin ? "/register" : "/login"} 
          className="font-semibold underline hover:text-foreground/60"
        >
          {isLogin ? "Cadastre-se agora" : "Faça login"}
        </Link>
      </p>
      <Link href="#" className="font-antarctican-mono font-bold text-primary hover:underline">
        Esqueci minha senha
      </Link>
    </div>
  );
}