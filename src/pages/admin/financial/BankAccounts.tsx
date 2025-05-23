import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Loader2, Plus, Trash } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { financialService, ComplementaryFilter } from "@/lib/services";

// Types
interface BankAccount {
  id: number;
  bank_id: number;
  person_id: number | null;
  branch: string;
  account: string;
  account_type: string;
  description: string | null;
  is_default: boolean;
  bank?: {
    id: number;
    name: string;
    code: string;
  };
  person?: {
    id: number;
    name: string;
    document: string;
    person_type: string;
  };
  created_at: string;
  updated_at: string;
}

interface Bank {
  id: number;
  name: string;
  code: string;
}

interface Person {
  id: number;
  name: string;
  document: string;
  person_type: string;
}

const accountTypes = [
  { value: "corrente", label: "Conta Corrente" },
  { value: "poupança", label: "Conta Poupança" },
  { value: "salário", label: "Conta Salário" },
  { value: "investimento", label: "Conta de Investimento" },
];

const BankAccounts = () => {
  const { toast } = useToast();
  
  // States
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [loadingPeople, setLoadingPeople] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<BankAccount>>({
    bank_id: 0,
    person_id: null,
    branch: '',
    account: '',
    account_type: 'corrente',
    description: '',
    is_default: false
  });
  
  // Delete dialog states
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Filter states
  const [filter, setFilter] = useState<ComplementaryFilter & { bank_id?: number, person_id?: number }>({
    search: '',
    page: 1,
    per_page: 50,
    sort_by: 'created_at',
    sort_direction: 'desc',
    bank_id: undefined,
    person_id: undefined
  });

  // Fetch data on mount and when filter changes
  useEffect(() => {
    fetchBankAccounts();
  }, [filter]);
  
  // Fetch banks and people on mount
  useEffect(() => {
    fetchBanks();
    fetchPeople();
  }, []);

  // Fetch bank accounts from API
  const fetchBankAccounts = async () => {
    setLoading(true);
    try {
      const response = await financialService.getBankAccounts(filter);
      if (response.data && Array.isArray(response.data)) {
        setBankAccounts(response.data);
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        setBankAccounts(response.data.data);
      } else {
        setBankAccounts([]);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao carregar contas bancárias");
      console.error("Erro ao carregar contas bancárias:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch banks from API
  const fetchBanks = async () => {
    setLoadingBanks(true);
    try {
      const response = await financialService.getBanks();
      if (response.data && Array.isArray(response.data)) {
        setBanks(response.data);
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        setBanks(response.data.data);
      } else {
        setBanks([]);
      }
    } catch (err: any) {
      console.error("Erro ao carregar bancos:", err);
    } finally {
      setLoadingBanks(false);
    }
  };

  // Fetch people from API
  const fetchPeople = async () => {
    setLoadingPeople(true);
    try {
      const response = await financialService.getPeople(); // Assuming this service method exists
      if (response.data && Array.isArray(response.data)) {
        setPeople(response.data);
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        setPeople(response.data.data);
      } else {
        setPeople([]);
      }
    } catch (err: any) {
      console.error("Erro ao carregar pessoas:", err);
    } finally {
      setLoadingPeople(false);
    }
  };

  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleBankChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      bank_id: parseInt(value)
    }));
  };
  
  const handlePersonChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      person_id: value ? parseInt(value) : null
    }));
  };
  
  const handleAccountTypeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      account_type: value
    }));
  };
  
  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      is_default: checked
    }));
  };

  const resetForm = () => {
    setFormData({
      bank_id: 0,
      person_id: null,
      branch: '',
      account: '',
      account_type: 'corrente',
      description: '',
      is_default: false
    });
    setIsEditing(false);
  };

  const handleEditItem = (item: BankAccount) => {
    setFormData({
      id: item.id,
      bank_id: item.bank_id,
      person_id: item.person_id,
      branch: item.branch,
      account: item.account,
      account_type: item.account_type,
      description: item.description,
      is_default: item.is_default
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.bank_id) {
      toast({
        title: "Erro de Validação",
        description: "O banco é obrigatório",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.branch) {
      toast({
        title: "Erro de Validação",
        description: "A agência é obrigatória",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.account) {
      toast({
        title: "Erro de Validação",
        description: "O número da conta é obrigatório",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (isEditing && formData.id) {
        await financialService.updateBankAccount(formData.id, formData);
        toast({
          title: "Conta bancária atualizada",
          description: "Conta bancária atualizada com sucesso"
        });
      } else {
        await financialService.createBankAccount(formData);
        toast({
          title: "Conta bancária criada",
          description: "Conta bancária criada com sucesso"
        });
      }
      
      setIsDialogOpen(false);
      resetForm();
      fetchBankAccounts();
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Ocorreu um erro durante a operação",
        variant: "destructive"
      });
    }
  };

  const handleDeleteItem = async () => {
    if (!deleteItemId) return;
    
    setIsDeleting(true);
    try {
      await financialService.deleteBankAccount(deleteItemId);
      
      toast({
        title: "Conta bancária excluída",
        description: "Conta bancária excluída com sucesso"
      });
      
      fetchBankAccounts();
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Ocorreu um erro ao excluir a conta bancária",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setDeleteItemId(null);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(prev => ({
      ...prev,
      search: e.target.value,
      page: 1
    }));
  };
  
  const handleBankFilter = (bankId: string) => {
    setFilter(prev => ({
      ...prev,
      bank_id: bankId ? parseInt(bankId) : undefined,
      page: 1
    }));
  };
  
  const handlePersonFilter = (personId: string) => {
    setFilter(prev => ({
      ...prev,
      person_id: personId ? parseInt(personId) : undefined,
      page: 1
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Contas Bancárias</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-orange-500 hover:bg-orange-600"
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Conta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Editar Conta Bancária" : "Adicionar Conta Bancária"}</DialogTitle>
              <DialogDescription>
                {isEditing 
                  ? "Atualize as informações da conta bancária abaixo" 
                  : "Preencha os campos para criar uma nova conta bancária"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="bank_id">Banco *</Label>
                  <Select 
                    value={formData.bank_id?.toString() || ""} 
                    onValueChange={handleBankChange}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um banco" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingBanks ? (
                        <div className="flex items-center justify-center py-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="ml-2">Carregando bancos...</span>
                        </div>
                      ) : (
                        banks.map(bank => (
                          <SelectItem key={bank.id} value={bank.id.toString()}>
                            {bank.code} - {bank.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="person_id">Titular (opcional)</Label>
                  <Select 
                    value={formData.person_id?.toString() || ""} 
                    onValueChange={handlePersonChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um titular" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sem titular vinculado</SelectItem>
                      {loadingPeople ? (
                        <div className="flex items-center justify-center py-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="ml-2">Carregando pessoas...</span>
                        </div>
                      ) : (
                        people.map(person => (
                          <SelectItem key={person.id} value={person.id.toString()}>
                            {person.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="branch">Agência *</Label>
                    <Input
                      id="branch"
                      name="branch"
                      value={formData.branch || ''}
                      onChange={handleInputChange}
                      placeholder="Ex: 0001"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account">Conta *</Label>
                    <Input
                      id="account"
                      name="account"
                      value={formData.account || ''}
                      onChange={handleInputChange}
                      placeholder="Ex: 12345-6"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account_type">Tipo de Conta *</Label>
                  <Select 
                    value={formData.account_type || "corrente"} 
                    onValueChange={handleAccountTypeChange}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de conta" />
                    </SelectTrigger>
                    <SelectContent>
                      {accountTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição (opcional)</Label>
                  <Input
                    id="description"
                    name="description"
                    value={formData.description || ''}
                    onChange={handleInputChange}
                    placeholder="Ex: Conta principal"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="is_default"
                    checked={formData.is_default || false}
                    onCheckedChange={handleCheckboxChange}
                  />
                  <Label htmlFor="is_default" className="cursor-pointer">
                    Definir como conta padrão
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {isEditing ? "Atualizar" : "Adicionar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtro */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Buscar</Label>
                <Input
                  id="search"
                  placeholder="Buscar por agência, conta ou descrição..."
                  value={filter.search || ''}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="bank_filter">Banco</Label>
                <Select 
                  value={filter.bank_id?.toString() || ""} 
                  onValueChange={handleBankFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os bancos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os bancos</SelectItem>
                    {banks.map(bank => (
                      <SelectItem key={bank.id} value={bank.id.toString()}>
                        {bank.code} - {bank.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label htmlFor="person_filter">Titular</Label>
                <Select 
                  value={filter.person_id?.toString() || ""} 
                  onValueChange={handlePersonFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os titulares" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os titulares</SelectItem>
                    {people.map(person => (
                      <SelectItem key={person.id} value={person.id.toString()}>
                        {person.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => setFilter({
                    search: '',
                    page: 1,
                    per_page: 50,
                    sort_by: 'created_at',
                    sort_direction: 'desc',
                    bank_id: undefined,
                    person_id: undefined
                  })}
                >
                  Limpar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Contas Bancárias */}
      <Card>
        <CardHeader>
          <CardTitle>Contas Bancárias</CardTitle>
          <CardDescription>
            Gerenciar as contas bancárias cadastradas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : error ? (
            <div className="text-center p-4 text-red-500">{error}</div>
          ) : bankAccounts.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              {filter.search || filter.bank_id || filter.person_id
                ? "Nenhuma conta bancária encontrada com os filtros atuais" 
                : "Nenhuma conta bancária cadastrada"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Banco</TableHead>
                    <TableHead>Agência</TableHead>
                    <TableHead>Conta</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Titular</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Padrão</TableHead>
                    <TableHead className="w-[100px] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bankAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell>{account.bank?.name}</TableCell>
                      <TableCell>{account.branch}</TableCell>
                      <TableCell>{account.account}</TableCell>
                      <TableCell>
                        {accountTypes.find(type => type.value === account.account_type)?.label || account.account_type}
                      </TableCell>
                      <TableCell>{account.person?.name || "-"}</TableCell>
                      <TableCell>{account.description || "-"}</TableCell>
                      <TableCell>{account.is_default ? "Sim" : "Não"}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="icon" onClick={() => handleEditItem(account)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="text-red-500"
                              onClick={() => setDeleteItemId(account.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir esta conta bancária?
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setDeleteItemId(null)}>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={handleDeleteItem}
                                disabled={isDeleting}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                {isDeleting && deleteItemId === account.id && (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                )}
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BankAccounts; 