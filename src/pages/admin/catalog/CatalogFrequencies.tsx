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
import { Edit, Loader2, Plus, Trash } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { catalogService, ComplementaryFilter } from "@/lib/services";

// Types
interface Frequency {
  id: number;
  name: string;
  days: number;
  created_at: string;
  updated_at: string;
}

const CatalogFrequencies = () => {
  const { toast } = useToast();
  
  // States
  const [frequencies, setFrequencies] = useState<Frequency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Frequency>>({
    name: '',
    days: 1
  });
  
  // Delete dialog states
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Filter states
  const [filter, setFilter] = useState<ComplementaryFilter>({
    search: '',
    page: 1,
    per_page: 50,
    sort_by: 'name',
    sort_direction: 'asc'
  });

  // Fetch data on mount and when filter changes
  useEffect(() => {
    fetchFrequencies();
  }, [filter]);

  // Fetch frequencies from API
  const fetchFrequencies = async () => {
    setLoading(true);
    try {
      const response = await catalogService.getFrequencies(filter);
      if (response.data && Array.isArray(response.data)) {
        setFrequencies(response.data);
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        setFrequencies(response.data.data);
      } else {
        setFrequencies([]);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao carregar frequências");
      console.error("Erro ao carregar frequências:", err);
    } finally {
      setLoading(false);
    }
  };

  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Convert days to number
    if (name === 'days') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 1
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      days: 1
    });
    setIsEditing(false);
  };

  const handleEditItem = (item: Frequency) => {
    setFormData({
      id: item.id,
      name: item.name,
      days: item.days
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast({
        title: "Erro de Validação",
        description: "O nome da frequência é obrigatório",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.days || formData.days < 1) {
      toast({
        title: "Erro de Validação",
        description: "O número de dias deve ser no mínimo 1",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (isEditing && formData.id) {
        await catalogService.updateFrequency(formData.id, formData);
        toast({
          title: "Frequência atualizada",
          description: "Frequência atualizada com sucesso"
        });
      } else {
        await catalogService.createFrequency(formData);
        toast({
          title: "Frequência criada",
          description: "Frequência criada com sucesso"
        });
      }
      
      setIsDialogOpen(false);
      resetForm();
      fetchFrequencies();
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
      await catalogService.deleteFrequency(deleteItemId);
      
      toast({
        title: "Frequência excluída",
        description: "Frequência excluída com sucesso"
      });
      
      fetchFrequencies();
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Ocorreu um erro ao excluir a frequência",
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Frequências</h1>
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
              Adicionar Frequência
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Editar Frequência" : "Adicionar Frequência"}</DialogTitle>
              <DialogDescription>
                {isEditing 
                  ? "Atualize as informações da frequência abaixo" 
                  : "Preencha os campos para criar uma nova frequência"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    placeholder="Ex: Mensal"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="days">Dias *</Label>
                  <Input
                    id="days"
                    name="days"
                    type="number"
                    min={1}
                    value={formData.days || 1}
                    onChange={handleInputChange}
                    placeholder="Ex: 30"
                    required
                  />
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
                <Label htmlFor="search">Buscar por nome</Label>
                <Input
                  id="search"
                  placeholder="Digite para buscar..."
                  value={filter.search || ''}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => setFilter({
                    search: '',
                    page: 1,
                    per_page: 50,
                    sort_by: 'name',
                    sort_direction: 'asc'
                  })}
                >
                  Limpar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Frequências */}
      <Card>
        <CardHeader>
          <CardTitle>Frequências</CardTitle>
          <CardDescription>
            Gerenciar as frequências disponíveis no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : error ? (
            <div className="text-center p-4 text-red-500">{error}</div>
          ) : frequencies.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              {filter.search 
                ? "Nenhuma frequência encontrada com os filtros atuais" 
                : "Nenhuma frequência cadastrada"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Dias</TableHead>
                    <TableHead className="w-[100px] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {frequencies.map((frequency) => (
                    <TableRow key={frequency.id}>
                      <TableCell className="font-medium">{frequency.name}</TableCell>
                      <TableCell>{frequency.days}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="icon" onClick={() => handleEditItem(frequency)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="text-red-500"
                              onClick={() => setDeleteItemId(frequency.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir a frequência "{frequency.name}"?
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
                                {isDeleting && deleteItemId === frequency.id && (
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

export default CatalogFrequencies;
