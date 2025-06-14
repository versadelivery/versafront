import { useMutation, useQuery } from "@tanstack/react-query";
import { clientLogin, clientRegister, fetchShopBySlug } from "./slug-service";
import { ClientData } from "./types";
import { toast } from "sonner";
import { useClient } from "./client-context";
import { useRouter } from "next/navigation";

export function useShopBySlug(slug: string) {
  const { setShop } = useClient();
  
  return useQuery({
    queryKey: ["shop", slug],
    queryFn: async () => {
      const data = await fetchShopBySlug(slug);
      setShop(data);
      return data;
    },
    retry: false,
    staleTime: 1000 * 60 * 60 * 24
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
      router.back();
    },
    onError: () => {
      toast.error("Erro ao registrar conta");
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
      router.back();
    },
    onError: () => {
      toast.error("Erro ao logar conta");
    },
  });

  return { login: mutation.mutate, isLoading: mutation.isPending };
}