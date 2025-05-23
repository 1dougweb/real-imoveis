import { useState } from "react";
import { Outlet, Navigate, useNavigate } from "react-router-dom";
import AdminSidebar from "@/components/AdminSidebar";
import { useAuth } from "@/hooks";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import NotificationsDropdown, { Notification } from "@/components/NotificationsDropdown";
import UserDropdown from "@/components/UserDropdown";

const Admin = () => {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();
  
  // Estado para as notificações
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "Novo contrato",
      message: "Um novo contrato foi assinado",
      time: "Agora mesmo",
      read: false,
      type: "success"
    },
    {
      id: 2,
      title: "Documento enviado",
      message: "Cliente enviou comprovante de renda",
      time: "2 horas atrás",
      read: false,
      type: "info"
    },
    {
      id: 3,
      title: "Visita agendada",
      message: "Nova visita agendada para amanhã",
      time: "5 horas atrás",
      read: true,
      type: "info"
    }
  ]);
  
  // Verifica se o usuário está carregando
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600"></div>
      </div>
    );
  }
  
  // Redireciona para login se não estiver autenticado
  if (!isAuthenticated || !user) {
    return <Navigate to="/admin/login" replace />;
  }
  
  // Verifica se o usuário tem o papel de admin
  const isAdmin = user.roles?.includes('admin');
  
  // Redireciona se não for admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Acesso Negado</h1>
        <p className="text-gray-600 mb-6">Você não tem permissão para acessar esta área.</p>
        <a 
          href="/" 
          className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
        >
          Voltar para o início
        </a>
      </div>
    );
  }

  // Função para marcar uma notificação como lida
  const handleMarkAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  // Função para marcar todas as notificações como lidas
  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  // Função para navegar para a página de notificações
  const handleViewAllNotifications = () => {
    navigate('/admin/notificacoes');
  };

  // Função para navegar para a página de perfil
  const handleProfileClick = () => {
    navigate('/admin/perfil');
  };

  // Função para navegar para a página de configurações
  const handleSettingsClick = () => {
    navigate('/admin/configuracoes');
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar for desktop and mobile */}
      <AdminSidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
      
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-72">
        {/* Header with user info and notifications */}
        <header className="bg-white border-b p-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileOpen(true)}
              className="lg:hidden mr-2"
          >
            <Menu className="h-6 w-6" />
          </Button>
            <h1 className="text-lg font-semibold text-gray-800 hidden sm:block">Painel Administrativo</h1>
          </div>
          
          {/* User and notifications section */}
          <div className="flex items-center space-x-2">
            <NotificationsDropdown 
              notifications={notifications}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
              onViewAll={handleViewAllNotifications}
            />
            
            <UserDropdown 
              user={user}
              onLogout={logout}
              onProfileClick={handleProfileClick}
              onSettingsClick={handleSettingsClick}
            />
          </div>
        </header>
        
        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Admin;
