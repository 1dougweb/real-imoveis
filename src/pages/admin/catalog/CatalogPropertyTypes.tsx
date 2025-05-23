import { useState, useEffect } from "react";
import { catalogService, PropertyType, ComplementaryFilter } from "@/lib/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  CardFooter,
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
import { Edit, Trash, Plus, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const CatalogPropertyTypes = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para o formulário de criação/edição
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<PropertyType>>({
    name: '',
    description: ''
  });
  
  // Estado para o item sendo excluído
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Filtro básico
  const [filter, setFilter] = useState<ComplementaryFilter>({
    search: '',
    page: 1,
    per_page: 50,
    sort_by: 'name',
    sort_direction: 'asc'
  });

  // Buscar dados
  useEffect(() => {
    fetchPropertyTypes();
  }, [filter]);

  const fetchPropertyTypes = async () => {
    setLoading(true);
    try {
      const response = await catalogService.getPropertyTypes(filter);
      if (response.success) {
        // Garantir que estamos usando o array dentro de data
        setPropertyTypes(response.data?.data || []);
      } else {
        setError(response.message || "Erro ao carregar tipos de imóveis");
      }
    } catch (err: any) {
      setError(err.message || "Erro ao carregar tipos de imóveis");
      console.error("Erro ao carregar tipos de imóveis:", err);
    } finally {
      setLoading(false);
    }
  };

  // Manipuladores de formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: ''
    });
    setIsEditing(false);
  };

  const handleEditItem = (item: PropertyType) => {
    setFormData({
      id: item.id,
      name: item.name,
      description: item.description
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "O nome do tipo de imóvel é obrigatório",
        variant: "destructive"
      });
      return;
    }
    
    try {
      let response;
      
      if (isEditing && formData.id) {
        response = await catalogService.updatePropertyType(formData.id, formData);
      } else {
        response = await catalogService.createPropertyType(formData);
      }
      
      if (response.success) {
        toast({
          title: isEditing ? "Tipo de imóvel atualizado" : "Tipo de imóvel criado",
          description: response.message || "Operação realizada com sucesso"
        });
        
        setIsDialogOpen(false);
        resetForm();
        fetchPropertyTypes();
      } else {
        toast({
          title: "Erro",
          description: response.message || "Ocorreu um erro durante a operação",
          variant: "destructive"
        });
      }
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
      const response = await catalogService.deletePropertyType(deleteItemId);
      
      if (response.success) {
        toast({
          title: "Tipo de imóvel excluído",
          description: response.message || "Operação realizada com sucesso"
        });
        
        fetchPropertyTypes();
      } else {
        toast({
          title: "Erro",
          description: response.message || "Ocorreu um erro ao excluir o tipo de imóvel",
          variant: "destructive"
        });
      }
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Ocorreu um erro ao excluir o tipo de imóvel",
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
        <h1 className="text-2xl font-bold">Tipos de Imóveis</h1>
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
              Adicionar Tipo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Editar Tipo de Imóvel" : "Adicionar Tipo de Imóvel"}</DialogTitle>
              <DialogDescription>
                {isEditing 
                  ? "Atualize as informações do tipo de imóvel abaixo" 
                  : "Preencha os campos para criar um novo tipo de imóvel"}
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
                    placeholder="Ex: Apartamento"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description || ''}
                    onChange={handleInputChange}
                    placeholder="Descrição detalhada do tipo de imóvel"
                    rows={3}
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
        </CardContent>
      </Card>

      {/* Tabela de Tipos de Imóveis */}
      <Card>
        <CardHeader>
          <CardTitle>Tipos de Imóveis</CardTitle>
          <CardDescription>
            Gerenciar os tipos de imóveis disponíveis no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : error ? (
            <div className="text-center p-4 text-red-500">{error}</div>
          ) : propertyTypes.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              {filter.search 
                ? "Nenhum tipo de imóvel encontrado com os filtros atuais" 
                : "Nenhum tipo de imóvel cadastrado"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="w-[150px]">Data de Criação</TableHead>
                    <TableHead className="w-[100px] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {propertyTypes.map((type) => (
                    <TableRow key={type.id}>
                      <TableCell>{type.id}</TableCell>
                      <TableCell className="font-medium">{type.name}</TableCell>
                      <TableCell>{type.description || '-'}</TableCell>
                      <TableCell>{new Date(type.created_at).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="icon" onClick={() => handleEditItem(type)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="text-red-500"
                              onClick={() => setDeleteItemId(type.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir o tipo de imóvel "{type.name}"?
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
                                {isDeleting && deleteItemId === type.id && (
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

export default CatalogPropertyTypes; 