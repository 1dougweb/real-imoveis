import { NavLink, useNavigate } from "react-router-dom";
import { File, User, Home, FileText, LayoutDashboard, Bell, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks";
import { useToast } from "@/components/ui/use-toast";

const ClientSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const links = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/painel" },
    { icon: User, label: "Perfil", path: "/painel/perfil" },
    { icon: File, label: "Documentos", path: "/painel/documentos" },
    { icon: Home, label: "Imóveis Associados", path: "/painel/imoveis-associados" },
    { icon: FileText, label: "Contratos", path: "/painel/contratos" },
    { icon: Settings, label: "Configurações", path: "/painel/configuracoes" },
  ];

  // Mock notifications data
  const notifications = [
    {
      id: 1,
      title: "Documento aprovado",
      message: "Seu comprovante de renda foi aprovado",
      time: "2 horas atrás"
    },
    {
      id: 2,
      title: "Contrato de locação",
      message: "Novo contrato disponível para assinatura",
      time: "1 dia atrás"
    },
    {
      id: 3,
      title: "Visita agendada",
      message: "Visita ao Apartamento Leblon confirmada",
      time: "3 dias atrás"
    }
  ];

  // Handle logout
  const handleLogout = async () => {
    await logout();
    toast({
      title: "Logout realizado com sucesso",
      duration: 3000,
    });
    navigate("/cliente/login");
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user || !user.name) return "CL";
    
    const nameParts = user.name.split(" ");
    if (nameParts.length === 1) return nameParts[0].substring(0, 2).toUpperCase();
    
    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="w-64 border-r bg-white h-full flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3 mb-6">
          <Avatar>
            <AvatarImage src={user?.profile_photo_path || ""} alt="Avatar" />
            <AvatarFallback>{getUserInitials()}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-gray-800">{user?.name || "Cliente"}</h3>
            <p className="text-xs text-gray-500">{user?.email || ""}</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Painel do Cliente</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5 text-gray-600" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-orange-500 text-white">
                  {notifications.length}
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-4 border-b">
                <h3 className="font-medium">Notificações</h3>
              </div>
              <div className="max-h-[300px] overflow-auto">
                {notifications.map(notification => (
                  <DropdownMenuItem key={notification.id} className="p-0 focus:bg-gray-50">
                    <div className="p-3 hover:bg-gray-50 w-full cursor-pointer">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-gray-800">{notification.title}</h4>
                        <span className="text-xs text-gray-500">{notification.time}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
              <div className="p-2 border-t">
                <Button variant="ghost" className="w-full justify-center text-orange-500 hover:text-orange-600 hover:bg-orange-50">
                  Ver todas
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-1 p-2">
          {links.map((link) => (
            <li key={link.path}>
              <NavLink
                to={link.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center px-4 py-3 text-sm rounded-md",
                    isActive
                      ? "bg-orange-50 text-orange-600 font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  )
                }
              >
                <link.icon className="h-5 w-5 mr-3" />
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t mt-auto">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-gray-700 hover:bg-gray-100"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>
    </div>
  );
};

export default ClientSidebar;
