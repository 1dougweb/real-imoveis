import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import axios from 'axios';

// UI Components
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import { Checkbox } from '../../../../components/ui/checkbox';
import { Spinner } from '../../../../components/ui/spinner';

const RoleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  // Carregar dados do cargo se estiver editando
  useEffect(() => {
    const fetchRole = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const response = await axios.get(`/api/roles/${id}`);
        const role = response.data.data;
        
        // Preencher o formulário com os dados do cargo
        setValue('name', role.name);
        setValue('description', role.description);
        setValue('is_active', role.is_active);
      } catch (error) {
        console.error('Erro ao carregar cargo:', error);
        toast.error('Não foi possível carregar os dados do cargo');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRole();
  }, [id, setValue]);

  // Enviar o formulário
  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      if (id) {
        // Atualizar cargo existente
        await axios.put(`/api/roles/${id}`, data);
        toast.success('Cargo atualizado com sucesso!');
      } else {
        // Criar novo cargo
        await axios.post('/api/roles', data);
        toast.success('Cargo criado com sucesso!');
      }
      navigate('/admin/settings/roles');
    } catch (error) {
      console.error('Erro ao salvar cargo:', error);
      
      if (error.response && error.response.data && error.response.data.errors) {
        // Exibir erros de validação
        const validationErrors = error.response.data.errors;
        Object.keys(validationErrors).forEach(field => {
          toast.error(validationErrors[field][0]);
        });
      } else {
        toast.error('Erro ao salvar o cargo. Por favor, tente novamente.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{id ? 'Editar Cargo' : 'Novo Cargo'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Cargo *</Label>
            <Input
              id="name"
              {...register('name', { 
                required: 'O nome do cargo é obrigatório',
                maxLength: {
                  value: 255,
                  message: 'O nome não pode ter mais de 255 caracteres'
                }
              })}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              {...register('description', {
                maxLength: {
                  value: 1000,
                  message: 'A descrição não pode ter mais de 1000 caracteres'
                }
              })}
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_active"
              {...register('is_active')}
              defaultChecked={true}
            />
            <Label htmlFor="is_active">Ativo</Label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/settings/roles')}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Salvando...
              </>
            ) : id ? (
              'Atualizar Cargo'
            ) : (
              'Criar Cargo'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default RoleForm; 