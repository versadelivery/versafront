"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, LogOut } from "lucide-react";
import { removeToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { createCableWithToken } from "@/lib/cable";
import { toast } from "sonner";
import api from "@/api/config";
import { UserData } from "@/types/utils";

export default function PendingApprovalPage() {
  const router = useRouter();
  const { user, login } = useAuth();

  const checkStatus = async () => {
    try {
      const response = await api.get("/shops");
      // Se chegamos aqui sem erro 403, a loja ESTÁ aprovada (UserAuthenticatable permitiu)
      const shopData = response.data.data;
      
      if (shopData && shopData.attributes.approved) {
        toast.success("Loja aprovada! Redirecionando...");
        
        // Tenta recuperar o usuário do localStorage para garantir que temos os dados completos
        const storedUser = localStorage.getItem('auth_user');
        let updatedUser: UserData;
        
        if (storedUser) {
          updatedUser = JSON.parse(storedUser);
          if (updatedUser.shop) {
            updatedUser.shop.attributes.approved = true;
          }
        } else if (user) {
          updatedUser = { ...user };
          if (updatedUser.shop) {
            updatedUser.shop.attributes.approved = true;
          }
        } else {
          // Fallback se não tivermos o usuário no estado ou storage ainda
          // Redireciona mesmo assim, o useAuth no /admin vai cuidar do resto
          router.push("/admin");
          return;
        }
        
        localStorage.setItem('auth_user', JSON.stringify(updatedUser));
        router.push("/admin");
      }
    } catch (error: any) {
      if (error.response?.status === 403) {
        console.log("Ainda aguardando aprovação...");
      } else {
        console.error("Erro ao verificar status:", error);
      }
    }
  };

  useEffect(() => {
    checkStatus();

    if (!user?.shop?.id) return;

    const cable = createCableWithToken();
    if (!cable) return;

    const subscription = cable.subscriptions.create(
      {
        channel: "ShopStatusChannel",
      },
      {
        received: (data: { event: string }) => {
          if (data.event === "approved") {
            toast.success("Sua loja foi aprovada! Redirecionando...");
            // Atualiza o localstorage para o próximo F5
            const updatedUser = { ...user } as UserData;
            if (updatedUser.shop) {
              updatedUser.shop.attributes.approved = true;
              localStorage.setItem('auth_user', JSON.stringify(updatedUser));
            }
            setTimeout(() => {
              router.push("/admin");
            }, 1000);
          }
        },
        connected: () => console.log("Conectado ao ShopStatusChannel"),
        disconnected: () => console.log("Desconectado do ShopStatusChannel"),
      }
    );

    return () => {
      subscription.unsubscribe();
      cable.disconnect();
    };
  }, [user?.shop?.id, router]);

  const handleLogout = () => {
    removeToken();
    localStorage.removeItem('auth_user');
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-orange-100 rounded-full">
              <Clock className="h-12 w-12 text-orange-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Aguardando Aprovação</CardTitle>
          <CardDescription className="text-base">
            Seu cadastro foi realizado com sucesso e está sendo analisado pela nossa equipe.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">
              Você receberá uma notificação assim que sua loja for aprovada.
              Isso geralmente leva até <strong>24 horas úteis</strong>.
            </p>
          </div>
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Enquanto isso, você pode entrar em contato conosco caso tenha alguma dúvida.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
