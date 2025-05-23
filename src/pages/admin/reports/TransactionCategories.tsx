import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Pencil, Trash2, RefreshCw } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { financialService } from "@/lib/services/financialService";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

interface Category {
  id: number;
  name: string;
  type: 'receivable' | 'payable';
  created_at: string;
  updated_at: string;
}

const TransactionCategories = () => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'receivable' as 'receivable' | 'payable'
  });
  const [formLoading, setFormLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'receivable' | 'payable'>('all');
  
  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Carregar categorias
  const loadCategories = async () => {
    setLoading(true);
    try {
      // Buscar categorias da API com exclusão das categorias de sistema
      const data = await financialService.getCategories(undefined, true);
      setCategories(data);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
      toast.error("Não foi possível carregar as categorias");
      
      // Dados simulados para demonstração em caso de erro
      const mockCategories: Category[] = [
        { id: 1, name: 'Aluguel', type: 'receivable', created_at: '2023-05-10', updated_at: '2023-05-10' },
        { id: 2, name: 'Venda de Imóvel', type: 'receivable', created_at: '2023-05-10', updated_at: '2023-05-10' },
        { id: 3, name: 'Comissão', type: 'receivable', created_at: '2023-05-10', updated_at: '2023-05-10' },
        { id: 4, name: 'Manutenção', type: 'payable', created_at: '2023-05-10', updated_at: '2023-05-10' },
        { id: 5, name: 'Impostos', type: 'payable', created_at: '2023-05-10', updated_at: '2023-05-10' },
        { id: 6, name: 'Serviços', type: 'payable', created_at: '2023-05-10', updated_at: '2023-05-10' },
      ];
      
      setCategories(mockCategories);
    } finally {
      setLoading(false);
    }
  };

  // Salvar categoria (criar ou atualizar)
  const saveCategory = async () => {
    setFormLoading(true);
    try {
      if (!formData.name.trim()) {
        toast.error("O nome da categoria é obrigatório");
        return;
      }

      if (selectedCategory) {
        // Atualizar categoria existente
        const updatedCategory = await financialService.updateCategory(selectedCategory.id, formData);
        
        // Atualizar estado local
        const updatedCategories = categories.map(cat => 
          cat.id === selectedCategory.id ? updatedCategory : cat
        );
        setCategories(updatedCategories);
        toast.success("Categoria atualizada com sucesso!");
      } else {
        // Criar nova categoria
        const newCategory = await financialService.createCategory(formData);
        
        // Adicionar ao estado local
        setCategories([...categories, newCategory]);
        toast.success("Categoria criada com sucesso!");
      }
      
      // Fechar o diálogo e resetar o formulário
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Erro ao salvar categoria:", error);
      toast.error("Erro ao salvar a categoria");
    } finally {
      setFormLoading(false);
    }
  };

  // Abrir diálogo de confirmação para excluir
  const confirmDeleteCategory = (id: number) => {
    setCategoryToDelete(id);
    setDeleteDialogOpen(true);
  };

  // Excluir categoria após confirmação
  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    
    setDeleteLoading(true);
    try {
      await financialService.deleteCategory(categoryToDelete);
      
      // Atualizar estado local
      setCategories(categories.filter(c => c.id !== categoryToDelete));
      toast.success("Categoria excluída com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
      toast.error("Erro ao excluir a categoria");
    } finally {
      setDeleteLoading(false);
      setCategoryToDelete(null);
    }
  };

  // Abrir diálogo para editar
  const editCategory = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      type: category.type
    });
    setIsDialogOpen(true);
  };

  // Resetar formulário
  const resetForm = () => {
    setSelectedCategory(null);
    setFormData({
      name: '',
      type: 'receivable'
    });
  };

  // Filtrar categorias
  const filteredCategories = filter === 'all' 
    ? categories 
    : categories.filter(c => c.type === filter);

  // Carregar categorias na inicialização
  useEffect(() => {
    loadCategories();
  }, []);

  // Definição das colunas da tabela
  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <span>#{row.original.id}</span>,
    },
    {
      accessorKey: "name",
      header: "Nome da Categoria",
    },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => (
        <Badge variant="outline" className={row.original.type === 'receivable' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}>
          {row.original.type === 'receivable' ? 'Recebimento' : 'Pagamento'}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => editCategory(row.original)}
            title="Editar"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => confirmDeleteCategory(row.original.id)}
            title="Excluir"
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Categorias de Transações</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadCategories}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Categoria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {selectedCategory ? 'Editar Categoria' : 'Nova Categoria'}
                </DialogTitle>
                <DialogDescription>
                  {selectedCategory 
                    ? 'Atualize os detalhes da categoria existente.' 
                    : 'Adicione uma nova categoria para classificar transações.'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Categoria</Label>
                  <Input 
                    id="name"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Aluguel, Comissão, Manutenção"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => setFormData({ ...formData, type: value as 'receivable' | 'payable' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="receivable">Recebimento</SelectItem>
                      <SelectItem value="payable">Pagamento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={saveCategory} disabled={formLoading}>
                  {formLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {selectedCategory ? 'Salvar Alterações' : 'Criar Categoria'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="space-y-2 w-full max-w-xs">
              <Label htmlFor="filter-type">Filtrar por Tipo</Label>
              <Select 
                value={filter} 
                onValueChange={(value) => setFilter(value as 'all' | 'receivable' | 'payable')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="receivable">Recebimentos</SelectItem>
                  <SelectItem value="payable">Pagamentos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Categorias */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Categorias</CardTitle>
          <CardDescription>
            Categorias utilizadas para classificar transações financeiras.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              Nenhuma categoria encontrada.
            </div>
          ) : (
            <DataTable 
              columns={columns} 
              data={filteredCategories} 
              searchColumn="name"
              searchPlaceholder="Buscar por nome..."
            />
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-gray-500">
            Total de categorias: {filteredCategories.length}
          </div>
        </CardFooter>
      </Card>

      {/* Diálogo de confirmação para exclusão */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Excluir Categoria"
        description="Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita e poderá afetar as transações existentes."
        confirmText="Sim, excluir"
        onConfirm={handleDeleteCategory}
        variant="delete"
        iconType="delete"
        isLoading={deleteLoading}
      />
    </div>
  );
};

export default TransactionCategories; 