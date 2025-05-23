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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Loader2, Plus, Trash } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { catalogService, ComplementaryFilter } from "@/lib/services";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { FloatingLabelSelect } from "@/components/ui/floating-label-select";
import { Switch } from "@/components/ui/switch";

// Types
interface City {
  id: number;
  name: string;
  state_id: number;
  state?: {
    id: number;
    name: string;
    abbreviation: string;
  };
  created_at: string;
  updated_at: string;
}

interface State {
  id: number;
  name: string;
  abbreviation: string;
}

const CatalogCities = () => {
  const { toast } = useToast();
  
  // States
  const [cities, setCities] = useState<City[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<City>>({
    name: '',
    state_id: 0
  });
  
  // Delete dialog states
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Filter states
  const [filter, setFilter] = useState<ComplementaryFilter & { state_id?: number }>({
    search: '',
    page: 1,
    per_page: 50,
    sort_by: 'name',
    sort_direction: 'asc',
    state_id: undefined
  });

  // Fetch data on mount and when filter changes
  useEffect(() => {
    fetchCities();
  }, [filter]);
  
  // Fetch states on mount
  useEffect(() => {
    fetchStates();
  }, []);

  // Fetch cities from API
  const fetchCities = async () => {
    setLoading(true);
    try {
      const response = await catalogService.getCities(filter);
      if (response.data && Array.isArray(response.data)) {
        setCities(response.data);
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        setCities(response.data.data);
      } else {
        setCities([]);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao carregar cidades");
      console.error("Erro ao carregar cidades:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch states from API
  const fetchStates = async () => {
    setLoadingStates(true);
    try {
      const response = await catalogService.getStates();
      if (response.data && Array.isArray(response.data)) {
        setStates(response.data);
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        setStates(response.data.data);
      } else {
        setStates([]);
      }
    } catch (err: any) {
      console.error("Erro ao carregar estados:", err);
    } finally {
      setLoadingStates(false);
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
  
  const handleStateChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      state_id: parseInt(value)
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      state_id: 0
    });
    setIsEditing(false);
  };

  const handleEditItem = (item: City) => {
    setFormData({
      id: item.id,
      name: item.name,
      state_id: item.state_id
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast({
        title: "Erro de Validação",
        description: "O nome da cidade é obrigatório",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.state_id) {
      toast({
        title: "Erro de Validação",
        description: "O estado é obrigatório",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (isEditing && formData.id) {
        await catalogService.updateCity(formData.id, formData);
        toast({
          title: "Cidade atualizada",
          description: "Cidade atualizada com sucesso"
        });
      } else {
        await catalogService.createCity(formData);
        toast({
          title: "Cidade criada",
          description: "Cidade criada com sucesso"
        });
      }
      
      setIsDialogOpen(false);
      resetForm();
      fetchCities();
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
      await catalogService.deleteCity(deleteItemId);
      
      toast({
        title: "Cidade excluída",
        description: "Cidade excluída com sucesso"
      });
      
      fetchCities();
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Ocorreu um erro ao excluir a cidade",
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
  
  const handleStateFilter = (value: string) => {
    setFilter(prev => ({
      ...prev,
      state_id: value === "0" ? undefined : parseInt(value),
      page: 1
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Cidades</h1>
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
              Adicionar Cidade
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Editar Cidade" : "Adicionar Cidade"}</DialogTitle>
              <DialogDescription>
                {isEditing 
                  ? "Atualize as informações da cidade abaixo" 
                  : "Preencha os campos para criar uma nova cidade"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <FloatingLabelSelect 
                    label="Estado *"
                    value={formData.state_id?.toString() || ""}
                    onValueChange={handleStateChange}
                    required
                    placeholder="Selecione um estado"
                  >
                    {loadingStates ? (
                      <div className="flex items-center justify-center py-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="ml-2">Carregando estados...</span>
                      </div>
                    ) : (
                      states.map(state => (
                        <SelectItem key={state.id} value={state.id.toString()}>
                          {state.name} ({state.abbreviation})
                        </SelectItem>
                      ))
                    )}
                  </FloatingLabelSelect>
                </div>
                <div className="space-y-2">
                  <FloatingLabelInput
                    id="name"
                    name="name"
                    label="Nome *"
                    value={formData.name || ''}
                    onChange={handleInputChange}
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
            <div className="flex gap-4">
              <div className="flex-1">
                <FloatingLabelInput
                  id="search"
                  label="Buscar por nome"
                  value={filter.search || ''}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="flex-1">
                <FloatingLabelSelect
                  label="Filtrar por estado"
                  value={filter.state_id?.toString() || ""}
                  onValueChange={handleStateFilter}
                  placeholder="Todos os estados"
                >
                  <SelectItem value="0">Todos os estados</SelectItem>
                  {states.map(state => (
                    <SelectItem key={state.id} value={state.id.toString()}>
                      {state.name} ({state.abbreviation})
                    </SelectItem>
                  ))}
                </FloatingLabelSelect>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => setFilter({
                    search: '',
                    page: 1,
                    per_page: 50,
                    sort_by: 'name',
                    sort_direction: 'asc',
                    state_id: undefined
                  })}
                >
                  Limpar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Cidades */}
      <Card>
        <CardHeader>
          <CardTitle>Cidades</CardTitle>
          <CardDescription>
            Gerenciar as cidades disponíveis no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : error ? (
            <div className="text-center p-4 text-red-500">{error}</div>
          ) : cities.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              {filter.search || filter.state_id
                ? "Nenhuma cidade encontrada com os filtros atuais" 
                : "Nenhuma cidade cadastrada"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="w-[100px] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cities.map((city) => (
                    <TableRow key={city.id}>
                      <TableCell className="font-medium">{city.name}</TableCell>
                      <TableCell>{city.state?.name} ({city.state?.abbreviation})</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="icon" onClick={() => handleEditItem(city)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="text-red-500"
                              onClick={() => setDeleteItemId(city.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir a cidade "{city.name}"?
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
                                {isDeleting && deleteItemId === city.id && (
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

export default CatalogCities;
