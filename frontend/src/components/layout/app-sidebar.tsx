import { Shield, LogOut } from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useEffect, useState, type ComponentProps } from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { useAuth } from "@/cases/auth/hooks/use-auth"

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth();

  const [activeRoute, setActiveRoute] = useState("")

  useEffect(() => {
    const segments = location.pathname.substring(1).split("/")
    const urlRoute = segments[0] ? `/${segments[0]}` : "/"
    setActiveRoute(urlRoute)
  }, [location]);

   async function handleLogout() {
    logout()
    navigate("/", { replace: true })
  }

  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Shield className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">SEG-2025</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="#" className="font-medium">Cadastros</Link>
                </SidebarMenuButton>
                <SidebarMenuSub className="ml-0 border-l-0 px-1.5">
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild 
                      isActive={activeRoute == '/customers'}
                    >
                      <Link to="/customers">Clientes</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild 
                      isActive={activeRoute == '/products'}
                    >
                      <Link to="/products">Produtos</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild 
                      isActive={activeRoute == '/orders'}
                    >
                      <Link to="/orders">Pedidos</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
            </SidebarMenuItem>

            
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="#" className="font-medium">Configurações</Link>
                </SidebarMenuButton>
                <SidebarMenuSub className="ml-0 border-l-0 px-1.5">
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild 
                      isActive={activeRoute == '/users'}
                    >
                      <Link to="/users">Usuários</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </SidebarMenuItem>
            
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="text-red-500 hover:text-red-600"
            >
              <LogOut className="size-4 mr-2" />
              Sair
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}