import { useState, useEffect } from "react";
import { NavLink, useLocation, Link } from "react-router-dom";
import { 
  Home, 
  Building, 
  Users, 
  FileText, 
  Settings, 
  DollarSign, 
  BarChart, 
  ChevronDown,
  LayoutDashboard,
  Upload,
  Search,
  FileEdit,
  Building2,
  Map,
  MapPin,
  CreditCard,
  Clock,
  Lock,
  BookOpen,
  User,
  HandCoins,
  Repeat,
  BellRing,
  Paperclip,
  Receipt,
  FileCheck,
  Menu,
  X,
  ArrowLeftFromLine
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks";
import { useNavigate } from "react-router-dom";
import { useSettings } from "@/lib/contexts/SettingsContext";
import { API_BASE_URL } from "@/config/api";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: number;
  onClick?: () => void;
}

const SidebarItem = ({ icon: Icon, label, path, badge, onClick }: SidebarItemProps) => (
  <li>
    <NavLink
      to={path}
      className={({ isActive }) =>
        cn(
          "flex items-center justify-between px-4 py-3 text-sm rounded-md",
          isActive
            ? "bg-orange-50 text-orange-600 font-medium"
            : "text-gray-700 hover:bg-gray-100"
        )
      }
      onClick={onClick}
    >
      <div className="flex items-center">
        <Icon className="h-5 w-5 mr-3" />
        <span>{label}</span>
      </div>
      {badge && (
        <Badge className="bg-orange-500">{badge}</Badge>
      )}
    </NavLink>
  </li>
);

interface SidebarGroupProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const SidebarGroup = ({ title, children, defaultOpen = false }: SidebarGroupProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
      >
        <span className="font-medium text-sm">{title}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <ul className="mt-1 space-y-1 pl-4">
          {children}
        </ul>
      )}
    </div>
  );
};

interface AdminSidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
}

// Utility function to safely get an image URL
const getSafeImageUrl = (url: string | null): string | null => {
  if (!url) return null;
  
  // If it's a data URL, return as is
  if (url.startsWith('data:')) {
    return url;
  }
  
  // If it's a relative URL (starts with /), prepend the API base URL
  if (url.startsWith('/')) {
    // Use the API_BASE_URL from config, but remove any trailing slash
    const baseUrl = API_BASE_URL.endsWith('/') 
      ? API_BASE_URL.slice(0, -1) 
      : API_BASE_URL;
    
    return `${baseUrl}${url}`;
  }
  
  // Otherwise, return as is
  return url;
};

const AdminSidebar = ({ isMobileOpen, setIsMobileOpen }: AdminSidebarProps) => {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();

  // Close sidebar on route change on mobile
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsMobileOpen(false);
    }
  }, [location.pathname, setIsMobileOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const closeSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsMobileOpen(false);
    }
  };

  return (
    <div 
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 border-r bg-white transition-transform duration-300 ease-in-out h-screen",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
      style={{ 
        "--primary-color": settings.primaryColor 
      } as React.CSSProperties}
    >
      <div className="sticky top-0 bg-white z-10 p-4 sm:p-6 border-b flex justify-between items-center">
        <Link to="/admin" className="flex-1 flex justify-center">
          <div className="flex flex-col items-center">
            {settings.useLogo && settings.logo ? (
              <img 
                src={getSafeImageUrl(settings.logo)} 
                alt={settings.companyName || 'Logo'} 
                className="h-16 w-auto object-contain"
                onError={(e) => {
                  console.warn('Error loading logo in sidebar');
                  e.currentTarget.src = ''; // Set empty src to prevent further errors
                }}
              />
            ) : (
              <>
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: settings.primaryColor }}
                >
                  <span className="text-white font-bold text-xl">
                    {settings.companyName ? settings.companyName.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase() : 'LR'}
                  </span>
                </div>
                <div className="text-center">
                  <h2 
                    className="text-lg font-bold"
                    style={{ color: settings.primaryColor }}
                  >
                    {settings.companyName ? settings.companyName.split(' ')[0] : 'Laranja'}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {settings.companyName ? settings.companyName.split(' ').slice(1).join(' ') : 'Real Imóveis'}
                  </p>
                </div>
              </>
            )}
          </div>
        </Link>
        <button 
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4" style={{ height: 'calc(100vh - 182px)' }}>
        <nav>
          <ul className="space-y-1 px-2">
            <SidebarItem icon={LayoutDashboard} label="Dashboard" path="/admin" onClick={closeSidebar} />

            <SidebarGroup title="Imóveis" defaultOpen={true}>
              <SidebarItem icon={Building} label="Todos os Imóveis" path="/admin/imoveis" onClick={closeSidebar} />
              <SidebarItem icon={Home} label="Imóveis à Venda" path="/admin/imoveis/venda" onClick={closeSidebar} />
              <SidebarItem icon={Building2} label="Imóveis para Locação" path="/admin/imoveis/locacao" onClick={closeSidebar} />
              <SidebarItem icon={FileCheck} label="Imóveis Vendidos" path="/admin/imoveis/vendidos" onClick={closeSidebar} />
              <SidebarItem icon={Receipt} label="Imóveis Alugados" path="/admin/imoveis/alugados" onClick={closeSidebar} />
              <SidebarItem icon={Lock} label="Imóveis Inativos" path="/admin/imoveis/inativos" onClick={closeSidebar} />
              <SidebarItem icon={Upload} label="Upload de Imagens" path="/admin/imoveis/upload" onClick={closeSidebar} />
              <SidebarItem icon={Search} label="SEO" path="/admin/imoveis/seo" onClick={closeSidebar} />
              <SidebarItem icon={Map} label="Cidades/Bairros" path="/admin/imoveis/localizacoes" onClick={closeSidebar} />
              <SidebarItem icon={FileEdit} label="Destaques" path="/admin/imoveis/destaques" onClick={closeSidebar} />
            </SidebarGroup>

            <SidebarGroup title="Pessoas">
              <SidebarItem icon={User} label="Funcionários" path="/admin/pessoas/funcionarios" badge={2} onClick={closeSidebar} />
              <SidebarItem icon={Users} label="Vendedores/Locadores" path="/admin/pessoas/vendedores" onClick={closeSidebar} />
              <SidebarItem icon={Users} label="Compradores" path="/admin/pessoas/compradores" onClick={closeSidebar} />
              <SidebarItem icon={Users} label="Locatários" path="/admin/pessoas/locatarios" onClick={closeSidebar} />
              <SidebarItem icon={Users} label="Usuários" path="/admin/pessoas/usuarios" onClick={closeSidebar} />
              <SidebarItem icon={FileText} label="Gerador de Contrato" path="/admin/pessoas/contratos" onClick={closeSidebar} />
              <SidebarItem icon={FileText} label="Contratos" path="/admin/pessoas/relacao-contratos" onClick={closeSidebar} />
              <SidebarItem icon={BarChart} label="Relatórios" path="/admin/pessoas/relatorios" onClick={closeSidebar} />
            </SidebarGroup>

            <SidebarGroup title="Cadastros">
              <SidebarItem icon={Users} label="Cargos" path="/admin/cadastros/cargos" onClick={closeSidebar} />
              <SidebarItem icon={Building} label="Tipos de Imóveis" path="/admin/cadastros/tipos" onClick={closeSidebar} />
              <SidebarItem icon={MapPin} label="Cidades" path="/admin/cadastros/cidades" onClick={closeSidebar} />
              <SidebarItem icon={Map} label="Bairros" path="/admin/cadastros/bairros" onClick={closeSidebar} />
              <SidebarItem icon={CreditCard} label="Contas Bancárias" path="/admin/cadastros/contas-bancarias" onClick={closeSidebar} />
              <SidebarItem icon={Clock} label="Frequências" path="/admin/cadastros/frequencias" onClick={closeSidebar} />
              <SidebarItem icon={Lock} label="Acessos" path="/admin/cadastros/acessos" onClick={closeSidebar} />
            </SidebarGroup>

            <SidebarGroup title="Financeiro">
              <SidebarItem icon={DollarSign} label="Contas a Pagar" path="/admin/financeiro/contas-pagar" onClick={closeSidebar} />
              <SidebarItem icon={DollarSign} label="Contas a Receber" path="/admin/financeiro/contas-receber" onClick={closeSidebar} />
              <SidebarItem icon={DollarSign} label="Extrato Caixa" path="/admin/financeiro/extrato-caixa" onClick={closeSidebar} />
              <SidebarItem icon={HandCoins} label="Comissões" path="/admin/financeiro/comissoes" onClick={closeSidebar} />
              <SidebarItem icon={Repeat} label="Vendas" path="/admin/financeiro/vendas" onClick={closeSidebar} />
              <SidebarItem icon={Home} label="Aluguéis" path="/admin/financeiro/alugueis" onClick={closeSidebar} />
            </SidebarGroup>

            <SidebarGroup title="Relatórios Financeiros">
              <SidebarItem icon={BarChart} label="Movimentações" path="/admin/relatorios/movimentacoes" onClick={closeSidebar} />
              <SidebarItem icon={BarChart} label="Comissões" path="/admin/relatorios/comissoes" onClick={closeSidebar} />
              <SidebarItem icon={BarChart} label="Vendas" path="/admin/relatorios/vendas" onClick={closeSidebar} />
              <SidebarItem icon={BarChart} label="Aluguéis" path="/admin/relatorios/alugueis" onClick={closeSidebar} />
              <SidebarItem icon={BarChart} label="Contas a Pagar" path="/admin/relatorios/contas-pagar" onClick={closeSidebar} />
              <SidebarItem icon={BarChart} label="Contas a Receber" path="/admin/relatorios/contas-receber" onClick={closeSidebar} />
              <SidebarItem icon={FileText} label="Recibo de Pagamento" path="/admin/relatorios/recibos" onClick={closeSidebar} />
            </SidebarGroup>

            <SidebarGroup title="Contratos e PDFs">
              <SidebarItem icon={FileText} label="Proposta de Compra" path="/admin/contratos/proposta-compra" onClick={closeSidebar} />
              <SidebarItem icon={FileText} label="Proposta de Locação" path="/admin/contratos/proposta-locacao" onClick={closeSidebar} />
              <SidebarItem icon={FileText} label="Laudos de Vistoria" path="/admin/contratos/laudos-vistoria" onClick={closeSidebar} />
              <SidebarItem icon={FileText} label="Vendas" path="/admin/contratos/vendas" onClick={closeSidebar} />
              <SidebarItem icon={FileText} label="Aluguéis" path="/admin/contratos/alugueis" onClick={closeSidebar} />
            </SidebarGroup>

            <SidebarItem icon={Settings} label="Configurações" path="/admin/configuracoes" onClick={closeSidebar} />
          </ul>
        </nav>
      </div>
      
      <div className="p-4 border-t">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-gray-700 hover:bg-gray-100"
          onClick={handleLogout}
        >
          <ArrowLeftFromLine className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>
    </div>
  );
};

export default AdminSidebar;
