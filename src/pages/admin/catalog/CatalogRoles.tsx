import { useState, useEffect } from "react";
import { catalogService, ComplementaryFilter } from "@/lib/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { FloatingLabelTextarea } from "@/components/ui/floating-label-textarea";
import { Switch } from "@/components/ui/switch";
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

// Internal interface, separate from the imported one
interface Role {
  id: number;
  name: string;
  description?: string;
  is_active?: boolean;
  guard_name?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

const CatalogRoles = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para o formulário de criação/edição
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Role>>({
    name: '',
    description: '',
    is_active: true
  });
  
  // Estado para o item sendo excluído
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Estado para o filtro
  const [filter, setFilter] = useState<ComplementaryFilter>({
    search: '',
    page: 1,
    per_page: 50,
    sort_by: 'name',
    sort_direction: 'asc'
  });
  
  // Estado para mostrar itens excluídos
  const [showDeleted, setShowDeleted] = useState(false);

  // Buscar dados
  useEffect(() => {
    fetchRoles();
  }, [filter, showDeleted]);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await catalogService.getRoles(filter, showDeleted);
      // Simplify by directly setting the roles from the response data
      if (response.data && Array.isArray(response.data)) {
        setRoles(response.data);
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        setRoles(response.data.data);
      } else {
        setRoles([]);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao carregar cargos");
      console.error("Erro ao carregar cargos:", err);
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
      description: '',
      is_active: true
    });
    setIsEditing(false);
  };

  const handleEditItem = (item: Role) => {
    setFormData({
      id: item.id,
      name: item.name,
      description: item.description,
      is_active: item.is_active
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast({
        title: "Erro de Validação",
        description: "O nome do cargo é obrigatório",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (isEditing && formData.id) {
        await catalogService.updateRole(formData.id, formData);
        toast({
          title: "Cargo atualizado",
          description: "Cargo atualizado com sucesso"
        });
      } else {
        console.log("Sending role data to server:", JSON.stringify(formData, null, 2));
        await catalogService.createRole(formData);
        toast({
          title: "Cargo criado",
          description: "Cargo criado com sucesso"
        });
      }
      
      setIsDialogOpen(false);
      resetForm();
      fetchRoles();
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
      await catalogService.deleteRole(deleteItemId);
      
      toast({
        title: "Cargo excluído",
        description: "Cargo excluído com sucesso"
      });
      
      fetchRoles();
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Ocorreu um erro ao excluir o cargo",
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
        <h1 className="text-2xl font-bold">Cargos</h1>
        <div className="flex gap-2">
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
                Adicionar Cargo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{isEditing ? "Editar Cargo" : "Adicionar Cargo"}</DialogTitle>
                <DialogDescription>
                  {isEditing 
                    ? "Atualize as informações do cargo abaixo" 
                    : "Preencha os campos para criar um novo cargo"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
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
                  <div className="space-y-2">
                    <FloatingLabelTextarea
                      id="description"
                      name="description"
                      label="Descrição"
                      value={formData.description || ''}
                      onChange={handleInputChange}
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
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="show-deleted"
                checked={showDeleted}
                onCheckedChange={setShowDeleted}
              />
              <Label htmlFor="show-deleted">Mostrar cargos excluídos</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Cargos */}
      <Card>
        <CardHeader>
          <CardTitle>Cargos</CardTitle>
          <CardDescription>
            Gerenciar os cargos disponíveis no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : error ? (
            <div className="text-center p-4 text-red-500">{error}</div>
          ) : roles.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              {filter.search 
                ? "Nenhum cargo encontrado com os filtros atuais" 
                : "Nenhum cargo cadastrado"}
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
                  {roles.map((role) => (
                    <TableRow key={role.id} className={role.deleted_at ? 'bg-gray-100' : ''}>
                      <TableCell>{role.id}</TableCell>
                      <TableCell className="font-medium">
                        {role.name} 
                        {role.deleted_at && <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Excluído</span>}
                      </TableCell>
                      <TableCell>{role.description || '-'}</TableCell>
                      <TableCell>{new Date(role.created_at).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className="text-right space-x-2">
                        {!role.deleted_at && (
                          <>
                            <Button variant="outline" size="icon" onClick={() => handleEditItem(role)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  className="text-red-500"
                                  onClick={() => setDeleteItemId(role.id)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir o cargo "{role.name}"?
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
                                    {isDeleting && deleteItemId === role.id && (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    )}
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                        {role.deleted_at && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              // Add functionality to restore later
                              toast({
                                title: "Não implementado",
                                description: "A restauração de cargos excluídos será implementada em breve.",
                                variant: "default"
                              });
                            }}
                          >
                            Restaurar
                          </Button>
                        )}
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

export default CatalogRoles;
