import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface AuthToggleProps {
  isLogin: boolean;
  setIsLogin: (value: boolean) => void;
}

export function AuthToggle({ isLogin, setIsLogin }: AuthToggleProps) {
  return (
    <div className="relative flex items-center justify-center p-1 rounded-lg bg-muted">
      <motion.div
        className="absolute left-0 top-0 h-full bg-primary rounded-md"
        initial={{ width: "50%", left: isLogin ? "0%" : "50%" }}
        animate={{ left: isLogin ? "0%" : "50%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
      <Button
        variant="ghost"
        className={`relative z-10 w-1/2 ${isLogin ? "text-primary-foreground" : ""}`}
        onClick={() => setIsLogin(true)}
      >
        Login
      </Button>
      <Button
        variant="ghost"
        className={`relative z-10 w-1/2 ${!isLogin ? "text-primary-foreground" : ""}`}
        onClick={() => setIsLogin(false)}
      >
        Registrar
      </Button>
    </div>
  );
}