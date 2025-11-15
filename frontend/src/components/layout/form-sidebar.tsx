import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { ReactNode } from "react";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Trash2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

type FormSidebarProps = {
  title: string;
  onSave: () => void;
  onDelete?: () => void;
  children: ReactNode;
  loading: boolean;
};
export function FormSidebar({
  title,
  onSave,
  onDelete,
  children,
  loading,
}: FormSidebarProps) {

  const navigate = useNavigate();
  const location = useLocation();

  function handleCloseForm(open: boolean) {
    if (!open) {
      const currentPath = location.pathname;
      const newPath = currentPath.substring(0, currentPath.lastIndexOf("/"));
      navigate(newPath);
    }
  }

  return (
    <Sheet open={true} onOpenChange={handleCloseForm}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            Preencha os campos abaixo e clique no botão Salvar.
          </SheetDescription>
        </SheetHeader>
        <div className="px-8">
          {children}
        </div>
        <SheetFooter className="felx flex-row justify-between">
          <div className="flex flex-row gap-1">
            <Button
              onClick={onSave}
              disabled={loading}
            >
              Salvar
            </Button>

            <SheetClose asChild>
              <Button
                variant="outline"
                disabled={loading}
              >
                Cancelar
              </Button>
            </SheetClose>
          </div>
          {onDelete && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={onDelete}
                >
                  <Trash2 />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Remover o registro</p>
              </TooltipContent>
            </Tooltip>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}