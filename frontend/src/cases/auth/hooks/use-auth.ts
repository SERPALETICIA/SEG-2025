import { useContext } from "react"
import { AuthContext } from "../contexts/auth.context.tsx"

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}