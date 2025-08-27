import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { authService, AuthResponse } from "@/services/client-service";
import { useClient } from "@/app/(public)/[slug]/client-context";

interface ClientData {
  name: string;
  email: string;
  password: string;
  cellphone: string;
}

export function useClientRegister() {
  const { setClient } = useClient();
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: (data: ClientData) => authService.register({ customer: data }),
    onSuccess: (data: AuthResponse) => {
      localStorage.setItem("client", JSON.stringify(data.customer));
      localStorage.setItem("client_token", data.token);
      setClient(data.customer);
      toast.success("Conta criada com sucesso");
      
      // Verificar se há redirecionamento via URL params
      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get('redirect');
      if (redirectTo) {
        router.push(decodeURIComponent(redirectTo));
      } else {
        router.push('/');
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
    mutationFn: (data: { email: string; password: string }) => authService.login({ customer: data }),
    onSuccess: (data: AuthResponse) => {
      localStorage.setItem("client", JSON.stringify(data.customer));
      localStorage.setItem("client_token", data.token);
      setClient(data.customer);
      toast.success("Conta logada com sucesso");
      
      // Verificar se há redirecionamento via URL params
      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get('redirect');
      if (redirectTo) {
        router.push(decodeURIComponent(redirectTo));
      } else {
        router.push('/');
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
