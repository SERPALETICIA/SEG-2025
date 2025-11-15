import { useAuth } from "@/cases/auth/hooks/use-auth"
import { Navigate } from "react-router-dom"

export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  if (user) {
    
    if (user.hasMFA && user.isFirstMfaAccess) {
      return <Navigate to="/mfa/setup" replace />;
    }

    // se o usuário já possui MFA, mas ainda não validou
    if (user.hasMFA && !user.isMfaValidated) {
      return <Navigate to="/mfa/verify" replace />;
    }

    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}