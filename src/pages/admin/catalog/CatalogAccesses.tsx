import { useState, useEffect, useRef } from "react";
import { catalogService } from "@/lib/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { FloatingLabelSelect } from "@/components/ui/floating-label-select";
import { FloatingLabelTextarea } from "@/components/ui/floating-label-textarea";
import { Label } from "@/components/ui/label";
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
import { Edit, Trash, Plus, Loader2, Check, X, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Internal interfaces
interface Permission {
  id: number;
  name: string;
  guard_name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface Role {
  id: number;
  name: string;
  description?: string;
  is_active?: boolean;
  guard_name?: string;
  created_at: string;
  updated_at: string;
  permissions?: Permission[];
}

const CatalogAccesses = () => {
  const { toast } = useToast();
  
  // State for roles and permissions
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("roles");

  // State for role-permission assignment
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [isAssigningPermissions, setIsAssigningPermissions] = useState(false);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  
  // References
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch roles
      const rolesResponse = await catalogService.getRoles({
        sort_by: 'name',
        sort_direction: 'asc',
        per_page: 100
      });
      
      let rolesList: Role[] = [];
      if (rolesResponse.data && Array.isArray(rolesResponse.data)) {
        rolesList = rolesResponse.data;
      } else if (rolesResponse.data && rolesResponse.data.data && Array.isArray(rolesResponse.data.data)) {
        rolesList = rolesResponse.data.data;
      }
      setRoles(rolesList);
      
      // Fetch permissions
      const permissionsResponse = await catalogService.getPermissions();
      
      let permissionsList: Permission[] = [];
      if (permissionsResponse.data && Array.isArray(permissionsResponse.data)) {
        permissionsList = permissionsResponse.data;
      } else if (permissionsResponse.data && permissionsResponse.data.data && Array.isArray(permissionsResponse.data.data)) {
        permissionsList = permissionsResponse.data.data;
      }
      setPermissions(permissionsList);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar dados");
      console.error("Erro ao carregar dados:", err);
      
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados de acessos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle role selection for permission assignment
  const handleRoleSelect = async (role: Role) => {
    setSelectedRole(role);
    setLoading(true);
    
    try {
      // Fetch role with its permissions
      const response = await catalogService.getRolePermissions(role.id);
      const rolePermissions = response.data || [];
      
      // Set selected permissions based on what the role already has
      setSelectedPermissions(rolePermissions.map((p: Permission) => p.id));
    } catch (err: any) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as permissões deste cargo",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Toggle permission selection
  const togglePermission = (permissionId: number) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  // Save permissions assignment
  const savePermissions = async () => {
    if (!selectedRole) return;
    
    setIsAssigningPermissions(true);
    try {
      await catalogService.assignRolePermissions(selectedRole.id, selectedPermissions);
      
      toast({
        title: "Sucesso",
        description: "Permissões atualizadas com sucesso",
      });
      
      fetchData();
      setSelectedRole(null);
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Ocorreu um erro ao atribuir permissões",
        variant: "destructive"
      });
    } finally {
      setIsAssigningPermissions(false);
    }
  };

  // Group permissions by module
  const groupedPermissions = permissions.reduce((acc: Record<string, Permission[]>, permission) => {
    // Extract module name from permission name (e.g., "properties.view" -> "properties")
    const moduleName = permission.name.split('.')[0] || 'other';
    
    if (!acc[moduleName]) {
      acc[moduleName] = [];
    }
    acc[moduleName].push(permission);
    return acc;
  }, {});

  // Get all available modules
  const modules = Object.keys(groupedPermissions).sort();
  
  // Filter permissions by search term and selected module
  const getFilteredPermissions = () => {
    let filtered = permissions;
    
    if (searchTerm.trim()) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (selectedModule) {
      filtered = filtered.filter(p => p.name.split('.')[0] === selectedModule);
    }
    
    return filtered;
  };

  const filteredPermissions = getFilteredPermissions();

  // Handle permission selection in the dropdown
  const handleSelectPermission = (permission: Permission) => {
    if (!selectedPermissions.includes(permission.id)) {
      setSelectedPermissions(prev => [...prev, permission.id]);
    }
    
    // Clear search after selection
    setSearchTerm("");
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };
  
  // Remove a permission from selected list
  const handleRemovePermission = (permissionId: number) => {
    setSelectedPermissions(prev => prev.filter(id => id !== permissionId));
  };
  
  // Get permission object by id
  const getPermissionById = (id: number) => {
    return permissions.find(p => p.id === id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Controle de Acessos</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="roles">Cargos e Funções</TabsTrigger>
          <TabsTrigger value="permissions">Permissões</TabsTrigger>
        </TabsList>
        
        <TabsContent value="roles" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cargos e suas permissões</CardTitle>
              <CardDescription>
                Selecione um cargo para gerenciar suas permissões
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="col-span-1 border-r pr-4">
                    <h3 className="font-medium mb-2">Cargos Disponíveis</h3>
                    <div className="space-y-1">
                      {roles.map(role => (
                        <div 
                          key={role.id} 
                          className={`p-2 rounded-md cursor-pointer ${selectedRole?.id === role.id ? 'bg-orange-100' : 'hover:bg-gray-100'}`}
                          onClick={() => handleRoleSelect(role)}
                        >
                          {role.name}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="col-span-3">
                    {selectedRole ? (
                      <>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-medium">Permissões para: {selectedRole.name}</h3>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setSelectedRole(null)}
                            >
                              Cancelar
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={savePermissions}
                              disabled={isAssigningPermissions}
                            >
                              {isAssigningPermissions && (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              )}
                              Salvar Permissões
                            </Button>
                          </div>
                        </div>
                        
                        <div className="mb-6 relative">
                          <div className="mb-4">
                            <div className="relative">
                              <div className="flex">
                                <div className="relative flex-1">
                                  <Input
                                    ref={searchInputRef}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Buscar permissão pelo nome..."
                                    className="pr-10 h-14 pt-6 rounded-md border border-input bg-background"
                                  />
                                  <label 
                                    className="absolute text-sm text-muted-foreground duration-150 transform -translate-y-3 scale-75 top-1 z-10 origin-[0] px-3 left-1"
                                  >
                                    Adicionar Permissão
                                  </label>
                                  <Plus className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                </div>
                                <select
                                  value={selectedModule || ''}
                                  onChange={(e) => setSelectedModule(e.target.value || null)}
                                  className="ml-2 border rounded-md p-2 text-sm"
                                >
                                  <option value="">Todos os módulos</option>
                                  {modules.map(module => (
                                    <option key={module} value={module}>
                                      {module.charAt(0).toUpperCase() + module.slice(1)}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            
                              {searchTerm.trim() && (
                                <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                                  {filteredPermissions.length > 0 ? (
                                    filteredPermissions.map(permission => (
                                      <div
                                        key={permission.id}
                                        className={cn(
                                          "p-2 cursor-pointer hover:bg-gray-100 text-sm",
                                          selectedPermissions.includes(permission.id) ? "opacity-50" : ""
                                        )}
                                        onClick={() => handleSelectPermission(permission)}
                                      >
                                        <div className="font-medium">{permission.name}</div>
                                        {permission.description && (
                                          <div className="text-xs text-gray-500">{permission.description}</div>
                                        )}
                                      </div>
                                    ))
                                  ) : (
                                    <div className="p-2 text-sm text-gray-500">Nenhuma permissão encontrada</div>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            {/* Selected permissions */}
                            <div className="mt-2 flex flex-wrap gap-2">
                              {selectedPermissions.map(permId => {
                                const perm = getPermissionById(permId);
                                if (!perm) return null;
                                
                                return (
                                  <div 
                                    key={permId}
                                    className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-md flex items-center"
                                  >
                                    <span>{perm.name}</span>
                                    <button 
                                      onClick={() => handleRemovePermission(permId)}
                                      className="ml-1 text-orange-800 hover:text-orange-900"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                        
                        {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                          <div key={module} className="mb-6">
                            <Separator className="mb-2" />
                            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0.5rem' }}>
                              <tbody>
                                {(() => {
                                  // Chunk permissions into rows of 2
                                  const rows = [];
                                  for (let i = 0; i < modulePermissions.length; i += 2) {
                                    const row = (
                                      <tr key={i}>
                                        <td style={{ width: '50%', padding: '0.25rem' }}>
                                          <div className={`flex items-center justify-between p-2 rounded-md border h-14 ${
                                            selectedPermissions.includes(modulePermissions[i].id) ? 'border-green-500 bg-green-50' : 'border-gray-200'
                                          }`}>
                                            <span className="capitalize pl-2">{module}:</span> {modulePermissions[i].name.split('.').slice(1).join('.')}
                                            <div className="flex-grow"></div>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className={selectedPermissions.includes(modulePermissions[i].id) ? 'text-green-600' : 'text-gray-400'}
                                              onClick={() => togglePermission(modulePermissions[i].id)}
                                            >
                                              {selectedPermissions.includes(modulePermissions[i].id) ? (
                                                <Check className="h-4 w-4" />
                                              ) : (
                                                <Plus className="h-4 w-4" />
                                              )}
                                            </Button>
                                          </div>
                                        </td>
                                        {i + 1 < modulePermissions.length && (
                                          <td style={{ width: '50%', padding: '0.25rem' }}>
                                            <div className={`flex items-center justify-between p-2 rounded-md border h-14 ${
                                              selectedPermissions.includes(modulePermissions[i + 1].id) ? 'border-green-500 bg-green-50' : 'border-gray-200'
                                            }`}>
                                              <span className="capitalize pl-2">{module}:</span> {modulePermissions[i + 1].name.split('.').slice(1).join('.')}
                                              <div className="flex-grow"></div>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className={selectedPermissions.includes(modulePermissions[i + 1].id) ? 'text-green-600' : 'text-gray-400'}
                                                onClick={() => togglePermission(modulePermissions[i + 1].id)}
                                              >
                                                {selectedPermissions.includes(modulePermissions[i + 1].id) ? (
                                                  <Check className="h-4 w-4" />
                                                ) : (
                                                  <Plus className="h-4 w-4" />
                                                )}
                                              </Button>
                                            </div>
                                          </td>
                                        )}
                                      </tr>
                                    );
                                    rows.push(row);
                                  }
                                  return rows;
                                })()}
                              </tbody>
                            </table>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="flex justify-center items-center h-60 text-gray-500">
                        Selecione um cargo para gerenciar suas permissões
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="permissions" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Permissões do Sistema</CardTitle>
              <CardDescription>
                Lista de todas as permissões disponíveis no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Guarda</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {permissions.map(permission => (
                      <TableRow key={permission.id}>
                        <TableCell className="font-medium">{permission.name}</TableCell>
                        <TableCell>{permission.description || '-'}</TableCell>
                        <TableCell>{permission.guard_name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CatalogAccesses; 