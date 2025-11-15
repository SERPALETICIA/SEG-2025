import { Route, Routes, Navigate } from "react-router-dom";

import { LoginForm } from "@/cases/auth/components/login-form";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";

import { PublicRoute } from "./routes/public.route";
import { PrivateRoute } from "./routes/private.route";
import { MFARoute } from "./routes/mfa.route";

export default function App() {
  return (
    <div className="wrapper">
      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute>
              <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-sm">
                  <LoginForm />
                </div>
              </div>
            </PublicRoute>
          }
        />

        <Route
          path="/mfa/setup"
          element={
            <MFARoute>
              <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-sm">
                  {/* <MFASetupForm /> */}
                </div>
              </div>
            </MFARoute>
          }
        />
        <Route
          path="/mfa/verify"
          element={
            <MFARoute>
              <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-sm">
                  {/* <MFAVerifyForm /> */}
                </div>
              </div>
            </MFARoute>
          }
        />

        <Route
          path="/*"
          element={
            <PrivateRoute>
              <SidebarProvider>
                <AppSidebar />
                <main className="flex flex-col flex-1 p-4">
                  <Routes>
                    
                    <Route path="/dashboard" element={<div>Bem-vindo 👋</div>} />                    

                    <Route path="*" element={<Navigate to="/dashboard" />} />
                  </Routes>
                </main>
              </SidebarProvider>
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  );
}