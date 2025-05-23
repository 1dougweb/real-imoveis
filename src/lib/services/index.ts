// Re-exporta todos os serviços para facilitar a importação
export { authService } from './authService';
export { propertyService } from './propertyService';
export { peopleService } from './peopleService';
export { visitService } from './visitService';
export { dashboardService } from './dashboardService';
export { contractService } from './contractService';
export { financialService } from './financialService';
export { catalogService } from './catalogService';

// Re-exporta também os tipos para uso em componentes
export type {
  LoginCredentials,
  RegisterData,
  AuthResponse
} from './authService';

export type {
  Property,
  PropertyFilter,
  PaginatedResponse
} from './propertyService';

export type {
  Person,
  PersonFilter
} from './peopleService';

export type {
  Visit,
  VisitFilter
} from './visitService';

export type {
  PropertyCountResponse,
  PropertyStatusResponse,
  VisitCountResponse,
  ContractCountResponse,
  PeopleCountResponse,
  FinancialSummaryResponse,
  Contract as DashboardContract
} from './dashboardService';

export type {
  Contract,
  ContractFilter,
  ProposalData
} from './contractService';

export type {
  Transaction,
  TransactionFilter,
  Commission,
  CommissionFilter,
  FinancialReport
} from './financialService';

export type {
  Role,
  PropertyType,
  City,
  Neighborhood,
  Feature,
  Bank,
  BankAccount,
  Frequency,
  PaymentType,
  ComplementaryFilter
} from './catalogService'; 