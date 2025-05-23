import { apiService } from '@/lib/api';
import { Contract } from './contractService';
import { Person } from './peopleService';
import { ComplementaryFilter } from './types';

// Extend the Contract interface to include the code property
declare module './contractService' {
  interface Contract {
    code?: string;
  }
}

export interface Transaction {
  id: number;
  type: 'receivable' | 'payable';
  description: string;
  amount: number;
  due_date: string;
  payment_date?: string;
  status: 'pending' | 'paid' | 'cancelled';
  category: 'rent' | 'sale' | 'commission' | 'maintenance' | 'tax' | 'other';
  person_id?: number;
  contract_id?: number;
  bank_account_id?: number;
  payment_type_id?: number;
  property_id?: number;
  notes?: string;
  person?: any;
  contract?: any;
  bankAccount?: any;
  paymentType?: any;
  property?: any;
}

export interface TransactionFilter {
  type?: 'payable' | 'receivable';
  status?: 'pending' | 'paid' | 'partial' | 'cancelled';
  category_id?: number;
  person_id?: number;
  contract_id?: number;
  property_id?: number;
  due_date_from?: string;
  due_date_to?: string;
  paid_date_from?: string;
  paid_date_to?: string;
  description?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface FinancialSummary {
  total: number;
  count: number;
  pending_amount: number;
  paid_amount: number;
  receivables: {
    total: number;
    pending: number;
  };
  payables: {
    total: number;
    pending: number;
  };
}

export interface CashFlowEntry {
  date: string;
  income: number;
  expense: number;
  balance: number;
}

export interface Commission {
  id: number;
  agent_id: number;
  agent?: {
    id: number;
    name: string;
    role: string;
  };
  contract_id: number;
  contract?: Contract;
  value: number;
  percentage: number;
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  commission_type_id: number;
  commission_type?: {
    id: number;
    name: string;
    default_percentage: number;
  };
  approved_at?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CommissionFilter {
  status?: 'pending' | 'approved' | 'paid' | 'cancelled';
  agent_id?: number;
  contract_id?: number;
  commission_type_id?: number;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface FinancialReport {
  start_date: string;
  end_date: string;
  total_receivable: number;
  total_payable: number;
  total_received: number;
  total_paid: number;
  balance: number;
  transactions: Array<{
    id: number;
    description: string;
    amount: number;
    type: string;
    status: string;
    due_date: string;
    paid_at?: string;
    person_name?: string;
    category_name?: string;
  }>;
}

export interface PropertyType {
  id: number;
  name: string;
  category: string;
}

export interface Property {
  id: number;
  title: string;
  reference: string;
  address: string;
  type_id: number;
  type?: PropertyType;
  status: string;
}

class FinancialService {
  async getTransactions(filters: TransactionFilter = {}): Promise<Transaction[]> {
    try {
      const response = await apiService.get('/transactions', { params: filters });
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar transações:", error);
      throw error;
    }
  }

  async getTransactionById(id: number): Promise<Transaction> {
    try {
      const response = await apiService.get(`/transactions/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createTransaction(data: Partial<Transaction>): Promise<Transaction> {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'receipt' && value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      }
    });

    try {
      const response = await apiService.post('/transactions', formData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateTransaction(id: number, data: Partial<Transaction>): Promise<Transaction> {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'receipt' && value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      }
    });

    try {
      const response = await apiService.put(`/transactions/${id}`, formData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteTransaction(id: number): Promise<void> {
    try {
      await apiService.delete(`/transactions/${id}`);
    } catch (error) {
      throw error;
    }
  }

  async markAsPaid(id: number, data: { payment_date?: string; notes?: string; receipt?: File }): Promise<Transaction> {
    const formData = new FormData();
    
    if (data.payment_date) formData.append('payment_date', data.payment_date);
    if (data.notes) formData.append('notes', data.notes);
    if (data.receipt) formData.append('receipt', data.receipt);

    try {
      const response = await apiService.post(`/transactions/${id}/mark-as-paid`, formData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async cancelTransaction(id: number, notes?: string): Promise<Transaction> {
    try {
      const response = await apiService.post(`/transactions/${id}/cancel`, { notes });
      return response.data;
    } catch (error) {
      console.error("Erro ao cancelar transação:", error);
      throw error;
    }
  }

  async getCommissions(filters: CommissionFilter = {}): Promise<Commission[]> {
    try {
      const response = await apiService.get('/commissions', { params: filters });
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar comissões:", error);
      throw error;
    }
  }

  async getCommissionById(id: number): Promise<Commission> {
    try {
      const response = await apiService.get(`/commissions/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createCommission(data: Partial<Commission>): Promise<Commission> {
    try {
      const response = await apiService.post('/commissions', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateCommission(id: number, data: Partial<Commission>): Promise<Commission> {
    try {
      const response = await apiService.put(`/commissions/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async approveCommission(id: number): Promise<Commission> {
    try {
      const response = await apiService.put(`/commissions/${id}/approve`);
      return response.data;
    } catch (error) {
      console.error("Erro ao aprovar comissão:", error);
      throw error;
    }
  }

  async payCommission(id: number, data: {
    paid_at: string;
    payment_type_id: number;
    bank_account_id?: number;
    receipt?: File;
    notes?: string;
  }): Promise<Commission> {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'receipt' && value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value.toString());
        }
      }
    });
    
    try {
      const response = await apiService.put(`/commissions/${id}/pay`, formData);
      return response.data;
    } catch (error) {
      console.error("Erro ao marcar comissão como paga:", error);
      throw error;
    }
  }

  async getRentals(filters: TransactionFilter = {}): Promise<Transaction[]> {
    try {
      const response = await apiService.get('/financial/rentals', { params: filters });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getSales(filters: TransactionFilter = {}): Promise<Transaction[]> {
    try {
      const response = await apiService.get('/financial/sales', { params: filters });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getCashFlow(startDate?: string, endDate?: string): Promise<CashFlowEntry[]> {
    try {
      const response = await apiService.get('/financial/cash-flow', {
        params: {
          start_date: startDate,
          end_date: endDate,
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getCategories(type?: 'receivable' | 'payable', excludeSystem: boolean = false): Promise<any[]> {
    try {
      const endpoint = type 
        ? `/transaction-categories?type=${type}` 
        : '/transaction-categories';
      const response = await apiService.get(endpoint);
      
      if (excludeSystem) {
        // Filter out system-generated categories
        return response.data.filter((category: any) => 
          category && 
          category.name && 
          !category.name.toLowerCase().includes('sistema') && 
          !category.name.toLowerCase().includes('system')
        );
      }
      
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
      throw error;
    }
  }

  async createCategory(data: { name: string; type: 'receivable' | 'payable' }): Promise<any> {
    try {
      const response = await apiService.post('/transaction-categories', data);
      return response.data;
    } catch (error) {
      console.error("Erro ao criar categoria:", error);
      throw error;
    }
  }

  async updateCategory(id: number, data: { name: string; type: 'receivable' | 'payable' }): Promise<any> {
    try {
      const response = await apiService.put(`/transaction-categories/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar categoria:", error);
      throw error;
    }
  }

  async deleteCategory(id: number): Promise<void> {
    try {
      await apiService.delete(`/transaction-categories/${id}`);
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
      throw error;
    }
  }

  async exportTransactionsExcel(filters: TransactionFilter = {}): Promise<Blob> {
    try {
      // Try first with the API endpoint
      try {
        // Fix the params format to avoid nesting under 'params'
        const response = await apiService.get('/transactions/export/excel', {
          params: filters,
          responseType: 'blob',
          paramsSerializer: params => {
            // Convert params object to URLSearchParams without nesting
            const searchParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
              if (value !== undefined && value !== null) {
                searchParams.append(key, String(value));
              }
            });
            return searchParams.toString();
          }
        });
        return response.data;
      } catch (apiError) {
        console.warn("API endpoint not available, using fallback Excel generation", apiError);
        
        // Fallback: Use client-side Excel generation if API endpoint is not available
        const ExcelJS = await import('exceljs');
        const workbook = new ExcelJS.default.Workbook();
        const worksheet = workbook.addWorksheet('Transações');
        
        // Get the transaction data
        const data = await this.getTransactions(filters);
        
        // Add headers
        worksheet.columns = [
          { header: 'ID', key: 'id', width: 10 },
          { header: 'Descrição', key: 'description', width: 40 },
          { header: 'Tipo', key: 'type', width: 15 },
          { header: 'Valor', key: 'amount', width: 15 },
          { header: 'Status', key: 'status', width: 15 },
          { header: 'Data Vencimento', key: 'due_date', width: 20 },
          { header: 'Data Pagamento', key: 'payment_date', width: 20 },
          { header: 'Categoria', key: 'category', width: 20 },
        ];
        
        // Add data rows
        data.forEach(item => {
          worksheet.addRow({
            id: item.id,
            description: item.description,
            type: item.type === 'receivable' ? 'Recebimento' : 'Pagamento',
            amount: item.amount,
            status: item.status === 'pending' ? 'Pendente' : item.status === 'paid' ? 'Pago' : 'Cancelado',
            due_date: item.due_date ? new Date(item.due_date).toLocaleDateString('pt-BR') : '-',
            payment_date: item.payment_date ? new Date(item.payment_date).toLocaleDateString('pt-BR') : '-',
            category: item.category,
          });
        });
        
        // Format the amount column
        worksheet.getColumn('amount').numFmt = '"R$"#,##0.00;[Red]-"R$"#,##0.00';
        
        // Style the header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF7D00' }, // Orange
        };
        worksheet.getRow(1).font = {
          color: { argb: 'FFFFFFFF' }, // White
          bold: true,
        };
        
        // Add summary at the bottom
        const totalReceivables = data
          .filter(t => t.type === 'receivable' && t.status === 'pending')
          .reduce((sum, t) => sum + t.amount, 0);
        
        const totalPayables = data
          .filter(t => t.type === 'payable' && t.status === 'pending')
          .reduce((sum, t) => sum + t.amount, 0);
        
        const totalReceived = data
          .filter(t => t.type === 'receivable' && t.status === 'paid')
          .reduce((sum, t) => sum + t.amount, 0);
        
        const totalPaid = data
          .filter(t => t.type === 'payable' && t.status === 'paid')
          .reduce((sum, t) => sum + t.amount, 0);
        
        const balance = totalReceived - totalPaid;
        
        // Add some empty rows before summary
        worksheet.addRow([]);
        worksheet.addRow([]);
        
        // Add summary rows
        const summaryRow = worksheet.addRow(['Resumo']);
        summaryRow.font = { bold: true, size: 14 };
        
        worksheet.addRow(['Total a Receber', totalReceivables]);
        worksheet.addRow(['Total a Pagar', totalPayables]);
        worksheet.addRow(['Total Recebido', totalReceived]);
        worksheet.addRow(['Total Pago', totalPaid]);
        
        const balanceRow = worksheet.addRow(['Saldo', balance]);
        balanceRow.font = { bold: true };
        balanceRow.getCell(2).font = {
          color: { argb: balance >= 0 ? 'FF008000' : 'FFFF0000' }, // Green or Red
          bold: true,
        };
        
        // Format the summary amounts
        for (let i = data.length + 4; i <= data.length + 8; i++) {
          if (worksheet.getRow(i).getCell(2).value !== undefined) {
            worksheet.getRow(i).getCell(2).numFmt = '"R$"#,##0.00;[Red]-"R$"#,##0.00';
          }
        }
        
        // Generate Excel file
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        return blob;
      }
    } catch (error) {
      console.error("Erro ao exportar transações para Excel:", error);
      throw error;
    }
  }

  async exportTransactionsPDF(filters: TransactionFilter = {}): Promise<Blob> {
    try {
      // Try first with the API endpoint
      try {
        // Fix the params format to avoid nesting under 'params'
        const response = await apiService.get('/transactions/export/pdf', {
          params: filters,
          responseType: 'blob',
          paramsSerializer: params => {
            // Convert params object to URLSearchParams without nesting
            const searchParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
              if (value !== undefined && value !== null) {
                searchParams.append(key, String(value));
              }
            });
            return searchParams.toString();
          }
        });
        return response.data;
      } catch (apiError) {
        console.warn("API endpoint not available, using fallback PDF generation", apiError);
        
        // Fallback: Use client-side PDF generation if API endpoint is not available
        const { jsPDF } = await import('jspdf');
        const autoTable = (await import('jspdf-autotable')).default;
        
        // Get the transaction data
        const data = await this.getTransactions(filters);
        
        // Create new PDF document
        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(18);
        doc.text('Relatório de Transações', 14, 22);
        
        // Add date range
        doc.setFontSize(11);
        const dateFrom = filters.due_date_from ? new Date(filters.due_date_from).toLocaleDateString('pt-BR') : '-';
        const dateTo = filters.due_date_to ? new Date(filters.due_date_to).toLocaleDateString('pt-BR') : '-';
        doc.text(`Período: ${dateFrom} até ${dateTo}`, 14, 30);
        
        // Generate table with transaction data
        const tableColumn = ["ID", "Descrição", "Tipo", "Valor", "Status", "Vencimento", "Pagamento"];
        const tableRows = data.map(item => [
          `#${item.id}`,
          item.description,
          item.type === 'receivable' ? 'Recebimento' : 'Pagamento',
          new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.amount),
          item.status === 'pending' ? 'Pendente' : item.status === 'paid' ? 'Pago' : 'Cancelado',
          item.due_date ? new Date(item.due_date).toLocaleDateString('pt-BR') : '-',
          item.payment_date ? new Date(item.payment_date).toLocaleDateString('pt-BR') : '-',
        ]);
        
        // Add the table to the PDF
        autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
          startY: 40,
          theme: 'striped',
          headStyles: { fillColor: [255, 125, 0], textColor: [255, 255, 255] },
          styles: { fontSize: 9 },
        });
        
        // Add summary information
        const totalReceivables = data
          .filter(t => t.type === 'receivable' && t.status === 'pending')
          .reduce((sum, t) => sum + t.amount, 0);
        
        const totalPayables = data
          .filter(t => t.type === 'payable' && t.status === 'pending')
          .reduce((sum, t) => sum + t.amount, 0);
        
        const totalReceived = data
          .filter(t => t.type === 'receivable' && t.status === 'paid')
          .reduce((sum, t) => sum + t.amount, 0);
        
        const totalPaid = data
          .filter(t => t.type === 'payable' && t.status === 'paid')
          .reduce((sum, t) => sum + t.amount, 0);
        
        const balance = totalReceived - totalPaid;
        
        const summaryY = (doc as any).lastAutoTable?.finalY + 20 || 200;
        doc.text('Resumo:', 14, summaryY);
        doc.text(`Total a Receber: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalReceivables)}`, 14, summaryY + 10);
        doc.text(`Total a Pagar: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPayables)}`, 14, summaryY + 20);
        doc.text(`Total Recebido: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalReceived)}`, 14, summaryY + 30);
        doc.text(`Total Pago: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPaid)}`, 14, summaryY + 40);
        doc.text(`Saldo: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balance)}`, 14, summaryY + 50);
        
        // Add footer with generation date
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.text(
            `Gerado em: ${new Date().toLocaleString('pt-BR')}`,
            14,
            doc.internal.pageSize.height - 10
          );
          doc.text(
            `Página ${i} de ${pageCount}`,
            doc.internal.pageSize.width - 40,
            doc.internal.pageSize.height - 10
          );
        }
        
        // Return the PDF as blob
        const blob = doc.output('blob');
        return blob;
      }
    } catch (error) {
      console.error("Erro ao exportar transações para PDF:", error);
      throw error;
    }
  }

  async getFinancialReport(data: {
    start_date: string;
    end_date: string;
    type?: 'receivable' | 'payable' | 'all';
    category_id?: number;
    person_id?: number;
  }): Promise<FinancialReport> {
    try {
      const response = await apiService.get('/reports/financial', { params: data });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async generatePaymentReceipt(id: number): Promise<Blob> {
    try {
      const response = await apiService.get(`/transactions/${id}/receipt`, { responseType: 'blob' });
      return response.data;
    } catch (error) {
      console.error("Erro ao gerar recibo:", error);
      throw error;
    }
  }

  // Bank Accounts
  async getBankAccounts(params?: ComplementaryFilter & { bank_id?: number, person_id?: number }) {
    return apiService.get('/bank-accounts', { params });
  }

  async getBankAccountsByPerson(personId: number, params?: ComplementaryFilter) {
    return apiService.get(`/people/${personId}/bank-accounts`, { params });
  }

  async getBankAccount(id: number) {
    return apiService.get(`/bank-accounts/${id}`);
  }

  async createBankAccount(data: any) {
    return apiService.post('/bank-accounts', data);
  }

  async updateBankAccount(id: number, data: any) {
    return apiService.put(`/bank-accounts/${id}`, data);
  }

  async deleteBankAccount(id: number) {
    return apiService.delete(`/bank-accounts/${id}`);
  }

  // Banks
  async getBanks(params?: ComplementaryFilter) {
    return apiService.get('/banks', { params });
  }

  async getBank(id: number) {
    return apiService.get(`/banks/${id}`);
  }

  // People (for bank account associations)
  async getPeople(filters: { type?: string; search?: string } = {}) {
    try {
      const response = await apiService.get('/people', { params: filters });
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar pessoas:", error);
      return { data: [] };
    }
  }

  async getPerson(id: number) {
    try {
      const response = await apiService.get(`/people/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getPropertyTypes() {
    try {
      const response = await apiService.get('/property-types');
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar tipos de imóveis:", error);
      throw error;
    }
  }

  async getRentalsReport(filters: any = {}) {
    try {
      const response = await apiService.get('/financial/rentals', { params: filters });
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar relatório de aluguéis:", error);
      throw error;
    }
  }

  async generateDetailedRentalsReport(filters: any = {}): Promise<Blob> {
    try {
      // First try with API endpoint if available
      try {
        const response = await apiService.get('/reports/rentals/detailed', {
          params: filters,
          responseType: 'blob'
        });
        return response.data;
      } catch (apiError) {
        console.warn("API endpoint not available, using fallback PDF generation", apiError);
        
        // Fallback: Use client-side PDF generation
        const { jsPDF } = await import('jspdf');
        const autoTable = (await import('jspdf-autotable')).default;
        
        // Get the rentals data
        const response = await this.getRentalsReport(filters);
        const rentals = response.data || [];
        const stats = response.stats || {};
        
        // Create new PDF document
        const doc = new jsPDF();
        
        // Add title and logo
        doc.setFontSize(20);
        doc.setTextColor(255, 107, 0); // Orange color
        doc.text('Relatório Detalhado de Aluguéis', 14, 22);
        
        // Add date range
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0); // Black
        const dateFrom = filters.start_date ? new Date(filters.start_date).toLocaleDateString('pt-BR') : '-';
        const dateTo = filters.end_date ? new Date(filters.end_date).toLocaleDateString('pt-BR') : '-';
        doc.text(`Período: ${dateFrom} até ${dateTo}`, 14, 30);
        
        // Add summary information
        doc.setFontSize(14);
        doc.text('Resumo', 14, 40);
        
        doc.setFontSize(10);
        doc.text(`Total de Contratos: ${rentals.length}`, 14, 50);
        doc.text(`Contratos Ativos: ${rentals.filter(r => r.status === 'active').length}`, 14, 55);
        doc.text(`Valor Total Mensal: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
          rentals.reduce((sum, r) => sum + r.rent_value, 0)
        )}`, 14, 60);
        doc.text(`Total de Comissões: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
          rentals.reduce((sum, r) => sum + (r.commission_value || 0), 0)
        )}`, 14, 65);
        
        // Add statistics if available
        if (stats.by_neighborhood && stats.by_neighborhood.length > 0) {
          doc.setFontSize(14);
          doc.text('Distribuição por Bairro', 14, 80);
          
          const neighborhoodData = stats.by_neighborhood.map((item: any) => [
            item.name,
            item.count.toString(),
            new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.total_amount)
          ]);
          
          autoTable(doc, {
            head: [['Bairro', 'Quantidade', 'Valor Total']],
            body: neighborhoodData,
            startY: 85,
            theme: 'striped',
            headStyles: { fillColor: [255, 107, 0], textColor: [255, 255, 255] },
          });
        }
        
        // Add property type statistics if available
        if (stats.by_property_type && stats.by_property_type.length > 0) {
          const propertyTypeY = (doc as any).lastAutoTable?.finalY + 15 || 130;
          
          doc.setFontSize(14);
          doc.text('Distribuição por Tipo de Imóvel', 14, propertyTypeY);
          
          const propertyTypeData = stats.by_property_type.map((item: any) => [
            item.name,
            item.count.toString(),
            new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.total_amount)
          ]);
          
          autoTable(doc, {
            head: [['Tipo de Imóvel', 'Quantidade', 'Valor Total']],
            body: propertyTypeData,
            startY: propertyTypeY + 5,
            theme: 'striped',
            headStyles: { fillColor: [255, 107, 0], textColor: [255, 255, 255] },
          });
        }
        
        // Add detailed rentals list
        const detailsY = (doc as any).lastAutoTable?.finalY + 15 || 180;
        
        doc.setFontSize(14);
        doc.text('Lista de Contratos de Aluguel', 14, detailsY);
        
        const rentalRows = rentals.map((rental: any) => [
          rental.contract_code || `#${rental.contract_id}`,
          rental.property_title,
          rental.tenant_name,
          new Date(rental.start_date).toLocaleDateString('pt-BR'),
          new Date(rental.end_date).toLocaleDateString('pt-BR'),
          new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(rental.rent_value),
          rental.status === 'active' ? 'Ativo' : 
          rental.status === 'pending' ? 'Pendente' : 
          rental.status === 'finished' ? 'Finalizado' : 'Cancelado'
        ]);
        
        autoTable(doc, {
          head: [['Contrato', 'Imóvel', 'Inquilino', 'Início', 'Término', 'Valor', 'Status']],
          body: rentalRows,
          startY: detailsY + 5,
          theme: 'striped',
          headStyles: { fillColor: [255, 107, 0], textColor: [255, 255, 255] },
          styles: { fontSize: 8 },
        });
        
        // Add footer with generation date
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.text(
            `Gerado em: ${new Date().toLocaleString('pt-BR')}`,
            14,
            doc.internal.pageSize.height - 10
          );
          doc.text(
            `Página ${i} de ${pageCount}`,
            doc.internal.pageSize.width - 40,
            doc.internal.pageSize.height - 10
          );
        }
        
        // Return the PDF as blob
        return doc.output('blob');
      }
    } catch (error) {
      console.error("Erro ao gerar relatório detalhado de aluguéis:", error);
      throw error;
    }
  }

  async exportCommissionsExcel(filters: CommissionFilter = {}): Promise<Blob> {
    try {
      // Try first with the API endpoint
      try {
        // Fix the params format to avoid nesting under 'params'
        const response = await apiService.get('/commissions/export/excel', {
          params: filters,
          responseType: 'blob',
          paramsSerializer: params => {
            // Convert params object to URLSearchParams without nesting
            const searchParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
              if (value !== undefined && value !== null) {
                searchParams.append(key, String(value));
              }
            });
            return searchParams.toString();
          }
        });
        return response.data;
      } catch (apiError) {
        console.warn("API endpoint not available, using fallback Excel generation", apiError);
        
        // Fallback: Use client-side Excel generation if API endpoint is not available
        const ExcelJS = await import('exceljs');
        const workbook = new ExcelJS.default.Workbook();
        const worksheet = workbook.addWorksheet('Comissões');
        
        // Get the commission data
        const data = await this.getCommissions(filters);
        
        // Add headers
        worksheet.columns = [
          { header: 'ID', key: 'id', width: 10 },
          { header: 'Corretor', key: 'agent', width: 30 },
          { header: 'Contrato', key: 'contract', width: 15 },
          { header: 'Percentual', key: 'percentage', width: 15 },
          { header: 'Valor', key: 'value', width: 15 },
          { header: 'Status', key: 'status', width: 15 },
          { header: 'Data Pagamento', key: 'paid_at', width: 20 },
        ];
        
        // Add data rows
        data.forEach(item => {
          worksheet.addRow({
            id: item.id,
            agent: item.agent?.name || '-',
            contract: item.contract?.code || `#${item.contract_id}`,
            percentage: `${item.percentage}%`,
            value: item.value,
            status: item.status === 'pending' ? 'Pendente' : 
                   item.status === 'approved' ? 'Aprovada' : 
                   item.status === 'paid' ? 'Paga' : 'Cancelada',
            paid_at: item.paid_at ? new Date(item.paid_at).toLocaleDateString('pt-BR') : '-',
          });
        });
        
        // Format the value column
        worksheet.getColumn('value').numFmt = '"R$"#,##0.00;[Red]-"R$"#,##0.00';
        
        // Style the header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF7D00' }, // Orange
        };
        worksheet.getRow(1).font = {
          color: { argb: 'FFFFFFFF' }, // White
          bold: true,
        };
        
        // Add summary at the bottom
        const totalPending = data
          .filter(c => c.status === 'pending')
          .reduce((sum, c) => sum + c.value, 0);
        
        const totalApproved = data
          .filter(c => c.status === 'approved')
          .reduce((sum, c) => sum + c.value, 0);
        
        const totalPaid = data
          .filter(c => c.status === 'paid')
          .reduce((sum, c) => sum + c.value, 0);
        
        const totalCancelled = data
          .filter(c => c.status === 'cancelled')
          .reduce((sum, c) => sum + c.value, 0);
        
        // Add some empty rows before summary
        worksheet.addRow([]);
        worksheet.addRow([]);
        
        // Add summary rows
        const summaryRow = worksheet.addRow(['Resumo']);
        summaryRow.font = { bold: true, size: 14 };
        
        worksheet.addRow(['Total Pendente', totalPending]);
        worksheet.addRow(['Total Aprovado', totalApproved]);
        worksheet.addRow(['Total Pago', totalPaid]);
        worksheet.addRow(['Total Cancelado', totalCancelled]);
        
        // Format the summary amounts
        for (let i = data.length + 4; i <= data.length + 7; i++) {
          if (worksheet.getRow(i).getCell(2).value !== undefined) {
            worksheet.getRow(i).getCell(2).numFmt = '"R$"#,##0.00;[Red]-"R$"#,##0.00';
          }
        }
        
        // Generate Excel file
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        return blob;
      }
    } catch (error) {
      console.error("Erro ao exportar comissões para Excel:", error);
      throw error;
    }
  }

  async exportCommissionsPDF(filters: CommissionFilter = {}): Promise<Blob> {
    try {
      // Try first with the API endpoint
      try {
        // Fix the params format to avoid nesting under 'params'
        const response = await apiService.get('/commissions/export/pdf', {
          params: filters,
          responseType: 'blob',
          paramsSerializer: params => {
            // Convert params object to URLSearchParams without nesting
            const searchParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
              if (value !== undefined && value !== null) {
                searchParams.append(key, String(value));
              }
            });
            return searchParams.toString();
          }
        });
        return response.data;
      } catch (apiError) {
        console.warn("API endpoint not available, using fallback PDF generation", apiError);
        
        // Fallback: Use client-side PDF generation if API endpoint is not available
        const { jsPDF } = await import('jspdf');
        const autoTable = (await import('jspdf-autotable')).default;
        
        // Get the commission data
        const data = await this.getCommissions(filters);
        
        // Create new PDF document
        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(18);
        doc.text('Relatório de Comissões', 14, 22);
        
        // Add date range
        doc.setFontSize(11);
        const dateFrom = filters.date_from ? new Date(filters.date_from).toLocaleDateString('pt-BR') : '-';
        const dateTo = filters.date_to ? new Date(filters.date_to).toLocaleDateString('pt-BR') : '-';
        doc.text(`Período: ${dateFrom} até ${dateTo}`, 14, 30);
        
        // Generate table with commission data
        const tableColumn = ["ID", "Corretor", "Contrato", "Percentual", "Valor", "Status", "Pagamento"];
        const tableRows = data.map(item => [
          `#${item.id}`,
          item.agent?.name || '-',
          item.contract?.code || `#${item.contract_id}`,
          `${item.percentage}%`,
          new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.value),
          item.status === 'pending' ? 'Pendente' : 
          item.status === 'approved' ? 'Aprovada' : 
          item.status === 'paid' ? 'Paga' : 'Cancelada',
          item.paid_at ? new Date(item.paid_at).toLocaleDateString('pt-BR') : '-',
        ]);
        
        // Add the table to the PDF
        autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
          startY: 40,
          theme: 'striped',
          headStyles: { fillColor: [255, 125, 0], textColor: [255, 255, 255] },
          styles: { fontSize: 9 },
        });
        
        // Add summary information
        const totalPending = data
          .filter(c => c.status === 'pending')
          .reduce((sum, c) => sum + c.value, 0);
        
        const totalApproved = data
          .filter(c => c.status === 'approved')
          .reduce((sum, c) => sum + c.value, 0);
        
        const totalPaid = data
          .filter(c => c.status === 'paid')
          .reduce((sum, c) => sum + c.value, 0);
        
        const totalCancelled = data
          .filter(c => c.status === 'cancelled')
          .reduce((sum, c) => sum + c.value, 0);
        
        const summaryY = (doc as any).lastAutoTable?.finalY + 20 || 200;
        doc.text('Resumo:', 14, summaryY);
        doc.text(`Total Pendente: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPending)}`, 14, summaryY + 10);
        doc.text(`Total Aprovado: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalApproved)}`, 14, summaryY + 20);
        doc.text(`Total Pago: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPaid)}`, 14, summaryY + 30);
        doc.text(`Total Cancelado: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalCancelled)}`, 14, summaryY + 40);
        
        // Add footer with generation date
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.text(
            `Gerado em: ${new Date().toLocaleString('pt-BR')}`,
            14,
            doc.internal.pageSize.height - 10
          );
          doc.text(
            `Página ${i} de ${pageCount}`,
            doc.internal.pageSize.width - 40,
            doc.internal.pageSize.height - 10
          );
        }
        
        // Return the PDF as blob
        const blob = doc.output('blob');
        return blob;
      }
    } catch (error) {
      console.error("Erro ao exportar comissões para PDF:", error);
      throw error;
    }
  }
}

export const financialService = new FinancialService(); 