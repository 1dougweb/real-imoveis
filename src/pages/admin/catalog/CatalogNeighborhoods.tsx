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

// Types
interface Neighborhood {
  id: number;
  name: string;
  city_id: number;
  city?: {
    id: number;
    name: string;
    state_id: number;
    state?: {
      id: number;
      name: string;
      abbreviation: string;
    };
  };
  created_at: string;
  updated_at: string;
}

interface City {
  id: number;
  name: string;
  state_id: number;
  state?: {
    id: number;
    name: string;
    abbreviation: string;
  };
}

interface State {
  id: number;
  name: string;
  abbreviation: string;
}

const CatalogNeighborhoods = () => {
  const { toast } = useToast();
  
  // States
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingStates, setLoadingStates] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Neighborhood>>({
    name: '',
    city_id: 0
  });
  
  // Delete dialog states
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Filter states
  const [filter, setFilter] = useState<ComplementaryFilter & { city_id?: number, state_id?: number }>({
    search: '',
    page: 1,
    per_page: 50,
    sort_by: 'name',
    sort_direction: 'asc',
    city_id: undefined,
    state_id: undefined
  });

  // Fetch data on mount and when filter changes
  useEffect(() => {
    fetchNeighborhoods();
  }, [filter]);
  
  // Fetch states on mount
  useEffect(() => {
    fetchStates();
  }, []);

  // Fetch cities when state filter changes
  useEffect(() => {
    if (filter.state_id) {
      fetchCitiesByState(filter.state_id);
    } else {
      // If no state is selected, fetch all cities or clear cities
      fetchAllCities();
    }
  }, [filter.state_id]);

  // Fetch neighborhoods from API
  const fetchNeighborhoods = async () => {
    setLoading(true);
    try {
      const response = await catalogService.getNeighborhoods(filter);
      if (response.data && Array.isArray(response.data)) {
        setNeighborhoods(response.data);
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        setNeighborhoods(response.data.data);
      } else {
        setNeighborhoods([]);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao carregar bairros");
      console.error("Erro ao carregar bairros:", err);
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

  // Fetch all cities from API
  const fetchAllCities = async () => {
    setLoadingCities(true);
    try {
      const response = await catalogService.getCities();
      if (response.data && Array.isArray(response.data)) {
        setCities(response.data);
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        setCities(response.data.data);
      } else {
        setCities([]);
      }
    } catch (err: any) {
      console.error("Erro ao carregar cidades:", err);
    } finally {
      setLoadingCities(false);
    }
  };

  // Fetch cities by state from API
  const fetchCitiesByState = async (stateId: number) => {
    setLoadingCities(true);
    try {
      const response = await catalogService.getCities({ state_id: stateId });
      if (response.data && Array.isArray(response.data)) {
        setCities(response.data);
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        setCities(response.data.data);
      } else {
        setCities([]);
      }
    } catch (err: any) {
      console.error("Erro ao carregar cidades do estado:", err);
    } finally {
      setLoadingCities(false);
      // Reset city filter when changing states
      if (filter.city_id) {
        setFilter(prev => ({
          ...prev,
          city_id: undefined
        }));
      }
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
  
  const handleCityChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      city_id: parseInt(value)
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      city_id: 0
    });
    setIsEditing(false);
  };

  const handleEditItem = (item: Neighborhood) => {
    setFormData({
      id: item.id,
      name: item.name,
      city_id: item.city_id
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast({
        title: "Erro de Validação",
        description: "O nome do bairro é obrigatório",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.city_id) {
      toast({
        title: "Erro de Validação",
        description: "A cidade é obrigatória",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (isEditing && formData.id) {
        await catalogService.updateNeighborhood(formData.id, formData);
        toast({
          title: "Bairro atualizado",
          description: "Bairro atualizado com sucesso"
        });
      } else {
        await catalogService.createNeighborhood(formData);
        toast({
          title: "Bairro criado",
          description: "Bairro criado com sucesso"
        });
      }
      
      setIsDialogOpen(false);
      resetForm();
      fetchNeighborhoods();
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
      await catalogService.deleteNeighborhood(deleteItemId);
      
      toast({
        title: "Bairro excluído",
        description: "Bairro excluído com sucesso"
      });
      
      fetchNeighborhoods();
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Ocorreu um erro ao excluir o bairro",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setDeleteItemId(null);
    }
  };

  // Filter handlers
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(prev => ({
      ...prev,
      search: e.target.value
    }));
  };
  
  const handleStateFilter = (value: string) => {
    setFilter(prev => ({
      ...prev,
      state_id: value === "0" ? undefined : parseInt(value),
      // Reset city filter when changing states
      city_id: undefined
    }));
  };
  
  const handleCityFilter = (value: string) => {
    setFilter(prev => ({
      ...prev,
      city_id: value === "0" ? undefined : parseInt(value)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Bairros</h1>
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
              Adicionar Bairro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Editar Bairro" : "Adicionar Bairro"}</DialogTitle>
              <DialogDescription>
                {isEditing 
                  ? "Atualize as informações do bairro abaixo" 
                  : "Preencha os campos para criar um novo bairro"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <FloatingLabelSelect 
                    label="Cidade *"
                    value={formData.city_id?.toString() || ""} 
                    onValueChange={handleCityChange}
                    required
                    placeholder="Selecione uma cidade"
                  >
                    {loadingCities ? (
                      <div className="flex items-center justify-center py-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="ml-2">Carregando cidades...</span>
                      </div>
                    ) : (
                      cities.map(city => (
                        <SelectItem key={city.id} value={city.id.toString()}>
                          {city.name} - {city.state?.abbreviation || ""}
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
            <div className="flex gap-4 ite">
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
                  label="Estado"
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
              <div className="flex-1">
                <FloatingLabelSelect 
                  label="Cidade"
                  value={filter.city_id?.toString() || ""} 
                  onValueChange={handleCityFilter}
                  disabled={loadingCities || cities.length === 0}
                  placeholder="Todas as cidades"
                >
                  <SelectItem value="0">Todas as cidades</SelectItem>
                  {cities.map(city => (
                    <SelectItem key={city.id} value={city.id.toString()}>
                      {city.name}
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
                    city_id: undefined,
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

      {/* Tabela de Bairros */}
      <Card>
        <CardHeader>
          <CardTitle>Bairros</CardTitle>
          <CardDescription>
            Gerenciar os bairros disponíveis no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : error ? (
            <div className="text-center p-4 text-red-500">{error}</div>
          ) : neighborhoods.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              {filter.search || filter.city_id || filter.state_id
                ? "Nenhum bairro encontrado com os filtros atuais" 
                : "Nenhum bairro cadastrado"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Cidade</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="w-[100px] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {neighborhoods.map((neighborhood) => (
                    <TableRow key={neighborhood.id}>
                      <TableCell className="font-medium">{neighborhood.name}</TableCell>
                      <TableCell>{neighborhood.city?.name}</TableCell>
                      <TableCell>{neighborhood.city?.state?.abbreviation}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="icon" onClick={() => handleEditItem(neighborhood)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="text-red-500"
                              onClick={() => setDeleteItemId(neighborhood.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir o bairro "{neighborhood.name}"?
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
                                {isDeleting && deleteItemId === neighborhood.id && (
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

export default CatalogNeighborhoods;
