import { useMutation, useQuery } from "@tanstack/react-query";
import { clientLogin, clientRegister, fetchShopBySlug } from "./slug-service";
import { ClientData } from "./types";
import { toast } from "sonner";
import { useClient } from "./client-context";
import { useRouter } from "next/navigation";

export function useShopBySlug(slug: string, options?: { staleTime?: number }) {
  const { setShop } = useClient();
  
  return useQuery({
    queryKey: ["shop", slug],
    queryFn: async () => {
      const data = await fetchShopBySlug(slug);
      setShop(data);
      return data;
    },
    retry: false,
    staleTime: options?.staleTime || 1000 * 60 * 60 * 24 // 24 horas por padrão
  });
}

export function useClientRegister() {
  const { setClient } = useClient();
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: (data: ClientData) => clientRegister(data),
    onSuccess: (data) => {
      localStorage.setItem("client", JSON.stringify(data.customer));
      localStorage.setItem("client_token", data.token);
      setClient(data as any);
      toast.success("Conta criada com sucesso");
      
      // Verificar se há redirecionamento via URL params
      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get('redirect');
      if (redirectTo) {
        router.push(`/${window.location.pathname.split('/')[1]}/${redirectTo}`);
      } else {
        router.back();
      }
    },
    onError: (error: any) => {
      console.error('Erro no registro:', error);
      let errorMessage = "Erro ao registrar conta";
      
      if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    },
  });

  return { register: mutation.mutate, isLoading: mutation.isPending };
}

export function useClientLogin() {
  const { setClient } = useClient();
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: (data: { email: string; password: string }) => clientLogin(data.email, data.password),
    onSuccess: (data) => {
      localStorage.setItem("client", JSON.stringify(data.customer));
      localStorage.setItem("client_token", data.token);
      setClient(data);
      toast.success("Conta logada com sucesso");
      
      // Verificar se há redirecionamento via URL params
      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get('redirect');
      if (redirectTo) {
        router.push(`/${window.location.pathname.split('/')[1]}/${redirectTo}`);
      } else {
        router.back();
      }
    },
    onError: (error: any) => {
      console.error('Erro no login:', error);
      let errorMessage = "Erro ao fazer login";
      
      if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    },
  });

  return { login: mutation.mutate, isLoading: mutation.isPending };
}