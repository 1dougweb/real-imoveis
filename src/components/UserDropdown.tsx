import { User, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface UserInfo {
  id?: number | string;
  name?: string;
  email?: string;
  profile_photo_path?: string;
  roles?: string[];
}

interface UserDropdownProps {
  user: UserInfo;
  onLogout: () => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  align?: "start" | "end" | "center";
  showName?: boolean;
  className?: string;
}

const UserDropdown = ({
  user,
  onLogout,
  onProfileClick,
  onSettingsClick,
  align = "end",
  showName = true,
  className = "",
}: UserDropdownProps) => {
  // Obter as iniciais do usuário para o avatar
  const getUserInitials = () => {
    if (!user || !user.name) return "U";
    
    const nameParts = user.name.split(" ");
    if (nameParts.length === 1) return nameParts[0].substring(0, 2).toUpperCase();
    
    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
  };

  // Obter o primeiro nome do usuário
  const getFirstName = () => {
    if (!user || !user.name) return "";
    return user.name.split(' ')[0];
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={`flex items-center gap-2 ${className}`}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.profile_photo_path || ""} />
            <AvatarFallback>{getUserInitials()}</AvatarFallback>
          </Avatar>
          {showName && (
            <span className="text-sm font-medium hidden sm:inline-block">{getFirstName()}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {onProfileClick && (
          <DropdownMenuItem onClick={onProfileClick} className="cursor-pointer">
            <User className="h-4 w-4 mr-2" />
            Perfil
          </DropdownMenuItem>
        )}
        {onSettingsClick && (
          <DropdownMenuItem onClick={onSettingsClick} className="cursor-pointer">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-red-600">
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown; 