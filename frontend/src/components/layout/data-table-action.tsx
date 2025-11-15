import { useLocation, useNavigate } from "react-router-dom";
import { Tooltip } from "@/components/ui/tooltip";
import { TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { EditIcon } from "lucide-react";
import { Button } from "../ui/button";

type DataTableActionProps = {
  itemId: string | number;
}
export function DataTableAction({
  itemId
}: DataTableActionProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleView = () => {
    const baseUrl = location.pathname;
    navigate(`${baseUrl}/${itemId}`);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="icon" onClick={handleView}>
          <EditIcon />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Editar/remover o registro</p>
      </TooltipContent>
    </Tooltip>
  );
}