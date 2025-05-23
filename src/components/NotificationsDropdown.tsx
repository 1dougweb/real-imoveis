import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type?: 'info' | 'success' | 'warning' | 'error';
}

interface NotificationsDropdownProps {
  notifications: Notification[];
  onMarkAllAsRead?: () => void;
  onMarkAsRead?: (id: number) => void;
  onViewAll?: () => void;
  align?: "start" | "end" | "center";
  className?: string;
}

const NotificationsDropdown = ({
  notifications,
  onMarkAllAsRead,
  onMarkAsRead,
  onViewAll,
  align = "end",
  className = "",
}: NotificationsDropdownProps) => {
  // Contagem de notificações não lidas
  const unreadCount = notifications.filter(n => !n.read).length;

  // Função para lidar com o clique em uma notificação
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  // Função para obter a cor de fundo baseada no tipo da notificação
  const getNotificationBgColor = (notification: Notification) => {
    if (notification.read) return '';
    
    switch (notification.type) {
      case 'success':
        return 'bg-green-50';
      case 'warning':
        return 'bg-yellow-50';
      case 'error':
        return 'bg-red-50';
      case 'info':
      default:
        return 'bg-blue-50';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={`relative ${className}`}>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-500 text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-80">
        <DropdownMenuLabel className="font-normal">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold">Notificações</h2>
            {unreadCount > 0 && onMarkAllAsRead && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-auto p-0 text-xs text-blue-600 hover:text-blue-800"
                onClick={onMarkAllAsRead}
              >
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[300px] overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <DropdownMenuItem key={notification.id} className="p-0 focus:bg-gray-50">
                <div 
                  className={`w-full p-3 cursor-pointer ${getNotificationBgColor(notification)}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-sm">{notification.title}</span>
                    <span className="text-xs text-gray-500">{notification.time}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="py-4 text-center text-gray-500 text-sm">
              Nenhuma notificação
            </div>
          )}
        </div>
        {notifications.length > 0 && onViewAll && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="justify-center text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
              onClick={onViewAll}
            >
              Ver todas as notificações
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsDropdown; 