import { Navigate } from "react-router-dom";
import { useAuth } from "@/cases/auth/hooks/use-auth";

export function MFARoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Se o usuário já validou MFA, não pode estar aqui.
  if (user.hasMFA && user.isMfaValidated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}