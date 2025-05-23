import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Properties from "./pages/properties"; // Updated import path
import About from "./pages/About";
import Contact from "./pages/Contact";
import ClientPanel from "./pages/ClientPanel";
import ClientLogin from "./pages/ClientLogin";
import ClientRegister from "./pages/ClientRegister";
import Documents from "./pages/client/Documents";
import Profile from "./pages/client/Profile";
import AssociatedProperties from "./pages/client/AssociatedProperties";
import Contracts from "./pages/client/Contracts";
import Dashboard from "./pages/client/Dashboard";
import PropertyDetail from "./pages/PropertyDetail";
import NotFound from "./pages/NotFound";

// Admin imports
import Admin from "./pages/Admin";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminLoginPage from "./pages/admin/LoginPage";

// Lazy loaded admin pages
import { lazy, Suspense } from "react";
const AdminLoading = () => <div className="flex items-center justify-center min-h-[400px]">Carregando...</div>;

// Admin Properties
const PropertiesList = lazy(() => import("./pages/admin/properties/PropertiesList"));
const PropertiesSales = lazy(() => import("./pages/admin/properties/PropertiesSales"));
const PropertiesRentals = lazy(() => import("./pages/admin/properties/PropertiesRentals"));
const PropertiesSold = lazy(() => import("./pages/admin/properties/PropertiesSold"));
const PropertiesRented = lazy(() => import("./pages/admin/properties/PropertiesRented"));
const PropertiesInactive = lazy(() => import("./pages/admin/properties/PropertiesInactive"));
const PropertiesUpload = lazy(() => import("./pages/admin/properties/PropertiesUpload"));
const PropertiesSeo = lazy(() => import("./pages/admin/properties/PropertiesSeo"));
const PropertiesLocations = lazy(() => import("./pages/admin/properties/PropertiesLocations"));
const PropertiesFeatured = lazy(() => import("./pages/admin/properties/PropertiesFeatured"));
const PropertyForm = lazy(() => import("./pages/admin/properties/PropertyForm"));

// Admin People
const PeopleEmployees = lazy(() => import("./pages/admin/people/PeopleEmployees"));
const PeopleSellers = lazy(() => import("./pages/admin/people/PeopleSellers"));
const PeopleBuyers = lazy(() => import("./pages/admin/people/PeopleBuyers"));
const PeopleTenants = lazy(() => import("./pages/admin/people/PeopleTenants"));
const PeopleUsers = lazy(() => import("./pages/admin/people/PeopleUsers"));
const PeopleContractGenerator = lazy(() => import("./pages/admin/people/PeopleContractGenerator"));
const PeopleContracts = lazy(() => import("./pages/admin/people/PeopleContracts"));
const PeopleReports = lazy(() => import("./pages/admin/people/PeopleReports"));

// Admin Catalog
const CatalogRoles = lazy(() => import("./pages/admin/catalog/CatalogRoles"));
const CatalogPropertyTypes = lazy(() => import("./pages/admin/catalog/CatalogPropertyTypes"));
const CatalogCities = lazy(() => import("./pages/admin/catalog/CatalogCities"));
const CatalogNeighborhoods = lazy(() => import("./pages/admin/catalog/CatalogNeighborhoods"));
const CatalogFrequencies = lazy(() => import("./pages/admin/catalog/CatalogFrequencies"));
const CatalogAccess = lazy(() => import("./pages/admin/catalog/CatalogAccess"));
const CatalogAccesses = lazy(() => import("./pages/admin/catalog/CatalogAccesses"));

// Admin Financial
const FinancialPayables = lazy(() => import("./pages/admin/financial/FinancialPayables"));
const FinancialReceivables = lazy(() => import("./pages/admin/financial/FinancialReceivables"));
const FinancialCashFlow = lazy(() => import("./pages/admin/financial/FinancialCashFlow"));
const FinancialCommissions = lazy(() => import("./pages/admin/financial/FinancialCommissions"));
const FinancialSales = lazy(() => import("./pages/admin/financial/FinancialSales"));
const FinancialRentals = lazy(() => import("./pages/admin/financial/FinancialRentals"));
const BankAccounts = lazy(() => import("./pages/admin/financial/BankAccounts"));
const NovaTransacaoPage = lazy(() => import("./pages/admin/financial/nova-transacao"));

// Admin Reports
const ReportsTransactions = lazy(() => import("./pages/admin/reports/ReportsTransactions"));
const ReportsCommissions = lazy(() => import("./pages/admin/reports/ReportsCommissions"));
const ReportsSales = lazy(() => import("./pages/admin/reports/ReportsSales"));
const ReportsRentals = lazy(() => import("./pages/admin/reports/ReportsRentals"));
const ReportsPayables = lazy(() => import("./pages/admin/reports/ReportsPayables"));
const ReportsReceivables = lazy(() => import("./pages/admin/reports/ReportsReceivables"));
const ReportsReceipts = lazy(() => import("./pages/admin/reports/ReportsReceipts"));
const TransactionCategories = lazy(() => import("./pages/admin/reports/TransactionCategories"));

// Admin Contracts
const ContractsPurchaseProposal = lazy(() => import("./pages/admin/contracts/ContractsPurchaseProposal"));
const ContractsRentalProposal = lazy(() => import("./pages/admin/contracts/ContractsRentalProposal"));
const ContractsInspectionReports = lazy(() => import("./pages/admin/contracts/ContractsInspectionReports"));
const ContractsSales = lazy(() => import("./pages/admin/contracts/ContractsSales"));
const ContractsRentals = lazy(() => import("./pages/admin/contracts/ContractsRentals"));

// Admin Settings
const AdminSettings = lazy(() => import("./pages/admin/settings/AdminSettings"));

// Admin Notifications
const NotificationsPage = lazy(() => import("./pages/admin/NotificationsPage"));

// Admin Profile
const ProfilePage = lazy(() => import("./pages/admin/ProfilePage"));

import { Analytics } from '@/components/Analytics';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Analytics />
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        {/* Admin Routes - Placed before other routes to ensure higher priority */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<Admin />}>
          <Route index element={<AdminDashboard />} />
          
          {/* Properties Routes */}
          <Route path="imoveis">
            <Route index element={
              <Suspense fallback={<AdminLoading />}>
                <PropertiesList />
              </Suspense>
            } />
            <Route path="venda" element={
              <Suspense fallback={<AdminLoading />}>
                <PropertiesSales />
              </Suspense>
            } />
            <Route path="locacao" element={
              <Suspense fallback={<AdminLoading />}>
                <PropertiesRentals />
              </Suspense>
            } />
            <Route path="vendidos" element={
              <Suspense fallback={<AdminLoading />}>
                <PropertiesSold />
              </Suspense>
            } />
            <Route path="alugados" element={
              <Suspense fallback={<AdminLoading />}>
                <PropertiesRented />
              </Suspense>
            } />
            <Route path="inativos" element={
              <Suspense fallback={<AdminLoading />}>
                <PropertiesInactive />
              </Suspense>
            } />
            <Route path="upload" element={
              <Suspense fallback={<AdminLoading />}>
                <PropertiesUpload />
              </Suspense>
            } />
            <Route path="seo" element={
              <Suspense fallback={<AdminLoading />}>
                <PropertiesSeo />
              </Suspense>
            } />
            <Route path="localizacoes" element={
              <Suspense fallback={<AdminLoading />}>
                <PropertiesLocations />
              </Suspense>
            } />
            <Route path="destaques" element={
              <Suspense fallback={<AdminLoading />}>
                <PropertiesFeatured />
              </Suspense>
            } />
            <Route path="novo" element={
              <Suspense fallback={<AdminLoading />}>
                <PropertyForm />
              </Suspense>
            } />
            <Route path=":id/editar" element={
              <Suspense fallback={<AdminLoading />}>
                <PropertyForm />
              </Suspense>
            } />
          </Route>

          {/* People Routes */}
          <Route path="pessoas">
            <Route path="funcionarios" element={
              <Suspense fallback={<AdminLoading />}>
                <PeopleEmployees />
              </Suspense>
            } />
            <Route path="vendedores" element={
              <Suspense fallback={<AdminLoading />}>
                <PeopleSellers />
              </Suspense>
            } />
            <Route path="compradores" element={
              <Suspense fallback={<AdminLoading />}>
                <PeopleBuyers />
              </Suspense>
            } />
            <Route path="locatarios" element={
              <Suspense fallback={<AdminLoading />}>
                <PeopleTenants />
              </Suspense>
            } />
            <Route path="usuarios" element={
              <Suspense fallback={<AdminLoading />}>
                <PeopleUsers />
              </Suspense>
            } />
            <Route path="contratos" element={
              <Suspense fallback={<AdminLoading />}>
                <PeopleContractGenerator />
              </Suspense>
            } />
            <Route path="relacao-contratos" element={
              <Suspense fallback={<AdminLoading />}>
                <PeopleContracts />
              </Suspense>
            } />
            <Route path="relatorios" element={
              <Suspense fallback={<AdminLoading />}>
                <PeopleReports />
              </Suspense>
            } />
          </Route>

          {/* Catalog Routes */}
          <Route path="cadastros">
            <Route path="cargos" element={
              <Suspense fallback={<AdminLoading />}>
                <CatalogRoles />
              </Suspense>
            } />
            <Route path="tipos" element={
              <Suspense fallback={<AdminLoading />}>
                <CatalogPropertyTypes />
              </Suspense>
            } />
            <Route path="cidades" element={
              <Suspense fallback={<AdminLoading />}>
                <CatalogCities />
              </Suspense>
            } />
            <Route path="bairros" element={
              <Suspense fallback={<AdminLoading />}>
                <CatalogNeighborhoods />
              </Suspense>
            } />
            <Route path="frequencias" element={
              <Suspense fallback={<AdminLoading />}>
                <CatalogFrequencies />
              </Suspense>
            } />
            <Route path="acessos" element={
              <Suspense fallback={<AdminLoading />}>
                <CatalogAccesses />
              </Suspense>
            } />
          </Route>

          {/* Financial Routes */}
          <Route path="financeiro">
            <Route path="contas-bancarias" element={
              <Suspense fallback={<AdminLoading />}>
                <BankAccounts />
              </Suspense>
            } />
            <Route path="contas-pagar" element={
              <Suspense fallback={<AdminLoading />}>
                <FinancialPayables />
              </Suspense>
            } />
            <Route path="contas-receber" element={
              <Suspense fallback={<AdminLoading />}>
                <FinancialReceivables />
              </Suspense>
            } />
            <Route path="nova-transacao" element={
              <Suspense fallback={<AdminLoading />}>
                <NovaTransacaoPage />
              </Suspense>
            } />
            <Route path="extrato-caixa" element={
              <Suspense fallback={<AdminLoading />}>
                <FinancialCashFlow />
              </Suspense>
            } />
            <Route path="comissoes" element={
              <Suspense fallback={<AdminLoading />}>
                <FinancialCommissions />
              </Suspense>
            } />
            <Route path="vendas" element={
              <Suspense fallback={<AdminLoading />}>
                <FinancialSales />
              </Suspense>
            } />
            <Route path="alugueis" element={
              <Suspense fallback={<AdminLoading />}>
                <FinancialRentals />
              </Suspense>
            } />
          </Route>

          {/* Reports Routes */}
          <Route path="relatorios">
            <Route path="movimentacoes" element={
              <Suspense fallback={<AdminLoading />}>
                <ReportsTransactions />
              </Suspense>
            } />
            <Route path="categorias" element={
              <Suspense fallback={<AdminLoading />}>
                <TransactionCategories />
              </Suspense>
            } />
            <Route path="comissoes" element={
              <Suspense fallback={<AdminLoading />}>
                <ReportsCommissions />
              </Suspense>
            } />
            <Route path="vendas" element={
              <Suspense fallback={<AdminLoading />}>
                <ReportsSales />
              </Suspense>
            } />
            <Route path="alugueis" element={
              <Suspense fallback={<AdminLoading />}>
                <ReportsRentals />
              </Suspense>
            } />
            <Route path="contas-pagar" element={
              <Suspense fallback={<AdminLoading />}>
                <ReportsPayables />
              </Suspense>
            } />
            <Route path="contas-receber" element={
              <Suspense fallback={<AdminLoading />}>
                <ReportsReceivables />
              </Suspense>
            } />
            <Route path="recibos" element={
              <Suspense fallback={<AdminLoading />}>
                <ReportsReceipts />
              </Suspense>
            } />
          </Route>

          {/* Contracts Routes */}
          <Route path="contratos">
            <Route path="proposta-compra" element={
              <Suspense fallback={<AdminLoading />}>
                <ContractsPurchaseProposal />
              </Suspense>
            } />
            <Route path="proposta-locacao" element={
              <Suspense fallback={<AdminLoading />}>
                <ContractsRentalProposal />
              </Suspense>
            } />
            <Route path="laudos-vistoria" element={
              <Suspense fallback={<AdminLoading />}>
                <ContractsInspectionReports />
              </Suspense>
            } />
            <Route path="vendas" element={
              <Suspense fallback={<AdminLoading />}>
                <ContractsSales />
              </Suspense>
            } />
            <Route path="alugueis" element={
              <Suspense fallback={<AdminLoading />}>
                <ContractsRentals />
              </Suspense>
            } />
          </Route>

          {/* Settings Route */}
          <Route path="configuracoes" element={
            <Suspense fallback={<AdminLoading />}>
              <AdminSettings />
            </Suspense>
          } />

          {/* Notifications Route */}
          <Route path="notificacoes" element={
            <Suspense fallback={<AdminLoading />}>
              <NotificationsPage />
            </Suspense>
          } />

          {/* Profile Route */}
          <Route path="perfil" element={
            <Suspense fallback={<AdminLoading />}>
              <ProfilePage />
            </Suspense>
          } />
        </Route>
        
        {/* Client Authentication Routes */}
        <Route path="/cliente/login" element={<ClientLogin />} />
        <Route path="/registro" element={<ClientRegister />} />
        
        {/* Main Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="imoveis" element={<Properties />} />
          <Route path="imoveis/:id" element={<PropertyDetail />} />
          <Route path="sobre" element={<About />} />
          <Route path="contato" element={<Contact />} />
          <Route path="painel" element={<ClientPanel />}>
            <Route index element={<Dashboard />} />
            <Route path="documentos" element={<Documents />} />
            <Route path="perfil" element={<Profile />} />
            <Route path="imoveis-associados" element={<AssociatedProperties />} />
            <Route path="contratos" element={<Contracts />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
