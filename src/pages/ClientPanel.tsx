import { Outlet, Navigate } from "react-router-dom";
import ClientSidebar from "@/components/ClientSidebar";
import { useAuth } from "@/hooks";
import { Loader2 } from "lucide-react";

const ClientPanel = () => {
  const { isAuthenticated, loading, user } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/cliente/login" />;
  }

  // Ensure user has client role
  const hasClientRole = user?.roles.includes('client');
  if (!hasClientRole) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen flex">
      <ClientSidebar />
      <div className="flex-1 p-8">
        <Outlet />
      </div>
    </div>
  );
};

export default ClientPanel;
