import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Notification } from "@/components/NotificationsDropdown";
import { Check, Trash2, Bell } from "lucide-react";

const NotificationsPage = () => {
  // Estado para armazenar as notificações
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);

  // Carregar notificações (simulado)
  useEffect(() => {
    // Simulação de carregamento de dados
    const fetchNotifications = async () => {
      setLoading(true);
      
      // Dados mockados para demonstração
      const mockNotifications: Notification[] = [
        {
          id: 1,
          title: "Novo contrato assinado",
          message: "O contrato de venda do imóvel #1234 foi assinado pelo cliente João Silva.",
          time: "Agora mesmo",
          read: false,
          type: "success"
        },
        {
          id: 2,
          title: "Documento enviado",
          message: "Cliente Maria Oliveira enviou comprovante de renda para análise.",
          time: "2 horas atrás",
          read: false,
          type: "info"
        },
        {
          id: 3,
          title: "Visita agendada",
          message: "Nova visita agendada para amanhã às 14h no Apartamento Leblon.",
          time: "5 horas atrás",
          read: true,
          type: "info"
        },
        {
          id: 4,
          title: "Pagamento pendente",
          message: "O pagamento da comissão do imóvel #5678 está pendente há 3 dias.",
          time: "1 dia atrás",
          read: false,
          type: "warning"
        },
        {
          id: 5,
          title: "Contrato expirado",
          message: "O contrato de aluguel do imóvel #9012 expira em 7 dias.",
          time: "2 dias atrás",
          read: true,
          type: "error"
        },
        {
          id: 6,
          title: "Novo lead recebido",
          message: "Um novo lead foi recebido para o imóvel #3456.",
          time: "3 dias atrás",
          read: true,
          type: "info"
        },
        {
          id: 7,
          title: "Avaliação de cliente",
          message: "O cliente Pedro Santos avaliou seu atendimento com 5 estrelas.",
          time: "4 dias atrás",
          read: true,
          type: "success"
        }
      ];
      
      // Simular atraso de rede
      setTimeout(() => {
        setNotifications(mockNotifications);
        setLoading(false);
      }, 800);
    };

    fetchNotifications();
  }, []);

  // Filtrar notificações com base na aba ativa
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !notification.read;
    if (activeTab === "read") return notification.read;
    return true;
  });

  // Marcar uma notificação como lida
  const handleMarkAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  // Marcar todas as notificações como lidas
  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  // Excluir uma notificação
  const handleDelete = (id: number) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== id)
    );
  };

  // Excluir todas as notificações
  const handleDeleteAll = () => {
    setNotifications([]);
  };

  // Obter a cor de fundo baseada no tipo da notificação
  const getNotificationBgColor = (notification: Notification) => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-l-4 border-green-500';
      case 'warning':
        return 'bg-yellow-50 border-l-4 border-yellow-500';
      case 'error':
        return 'bg-red-50 border-l-4 border-red-500';
      case 'info':
      default:
        return 'bg-blue-50 border-l-4 border-blue-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Notificações</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={!notifications.some(n => !n.read)}
          >
            <Check className="h-4 w-4 mr-2" />
            Marcar todas como lidas
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDeleteAll}
            disabled={notifications.length === 0}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Limpar tudo
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="unread">Não lidas</TabsTrigger>
                <TabsTrigger value="read">Lidas</TabsTrigger>
              </TabsList>
              <span className="text-sm text-gray-500">
                {notifications.filter(n => !n.read).length} não lidas
              </span>
            </div>
          </Tabs>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : filteredNotifications.length > 0 ? (
            <div className="space-y-4">
              {filteredNotifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`p-4 rounded-md ${getNotificationBgColor(notification)} ${!notification.read ? 'font-medium' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <h3 className="text-sm font-semibold">{notification.title}</h3>
                        {!notification.read && (
                          <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Nova
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                    <div className="flex space-x-1 ml-4">
                      {!notification.read && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-blue-600"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-red-600"
                        onClick={() => handleDelete(notification.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Nenhuma notificação</h3>
              <p className="mt-1 text-sm text-gray-500">
                {activeTab === "all" 
                  ? "Você não tem notificações no momento." 
                  : activeTab === "unread" 
                    ? "Você não tem notificações não lidas." 
                    : "Você não tem notificações lidas."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsPage; 