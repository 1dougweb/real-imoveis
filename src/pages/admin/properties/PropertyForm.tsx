import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from '@/components/ui/sonner';
import api, { getBackendUrl } from '@/lib/api';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// UI Components
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Checkbox } from '../../../components/ui/checkbox';
import { Spinner } from '../../../components/ui/spinner';
import { Select } from '../../../components/ui/select';
import { RadioGroup, RadioGroupItem } from '../../../components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";

// Define types
interface PropertyType {
  id: number;
  name: string;
}

interface City {
  id: number;
  name: string;
}

interface Neighborhood {
  id: number;
  name: string;
  city_id: number;
}

interface Feature {
  id: number;
  name: string;
}

interface Person {
  id: number;
  name: string;
  type: string;
}

// Interface para a resposta da API
interface PropertyApiResponse {
  success: boolean;
  property: Property;
  message?: string;
}

// Interface para resposta genérica da API
interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
}

// Interface para representar uma característica (feature)
interface PropertyFeature {
  id: number;
  name: string;
  [key: string]: any;
}

interface Property {
  id?: number;
  title: string;
  description: string;
  code?: string;
  property_type_id: number;
  purpose: 'sale' | 'rent' | 'both';
  sale_price?: number;
  rent_price?: number;
  condominium_fee?: number;
  iptu?: number;
  status: 'available' | 'sold' | 'rented' | 'reserved' | 'unavailable';
  featured: boolean;
  active: boolean;
  address: string;
  address_number: string;
  address_complement?: string;
  city_id: number;
  neighborhood_id: number;
  state: string;
  zip_code: string;
  latitude?: number;
  longitude?: number;
  total_area?: number;
  built_area?: number;
  land_area?: number;
  bedrooms?: number;
  bathrooms?: number;
  suites?: number;
  parking_spaces?: number;
  year_built?: number;
  floor?: number;
  owner_id?: number;
  agent_id?: number;
  features?: number[];
  additional_info?: string;
  main_photo?: string;
  photos?: any[];
  property_images?: PropertyImage[];
  featured_image?: {
    id: number;
    url: string;
    thumbnail_url: string;
  };
}

// Interface para imagens do imóvel
interface PropertyImage {
  id: number;
  property_id: number;
  title?: string;
  description?: string;
  file_path: string;
  file_name: string;
  order: number;
  is_featured: boolean;
  url?: string;
  thumbnail_url?: string;
}

// Base64 encoded placeholder image for fallback
const placeholderImage = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMThweCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iIzk5OTk5OSI+SW1hZ2VtIGluZGlzcG9uw612ZWw8L3RleHQ+PC9zdmc+";

// Helper function to validate image URLs
const isValidImageUrl = (url?: string): boolean => {
  return !!url && url.length > 10 && (
    url.startsWith('http') || 
    url.startsWith('/storage/') || 
    url.startsWith('data:image/')
  );
};

// Helper function to get the best available image URL
const getBestImageUrl = (image: PropertyImage): string => {
  if (isValidImageUrl(image.url)) {
    return image.url;
  } else if (isValidImageUrl(image.thumbnail_url)) {
    return image.thumbnail_url;
  } else if (image.file_path) {
    // Try to construct URL from file_path using the backend URL
    return `${getBackendUrl()}/storage/${image.file_path}`;
  } else {
    // Fallback to placeholder
    return placeholderImage;
  }
};

// SortableImage component for drag and drop functionality
interface SortableImageProps {
  image: PropertyImage;
  onSetFeatured: (id: number) => void;
  onDelete: (id: number) => void;
}

// FeaturedImage component
interface FeaturedImageProps {
  image: PropertyImage;
}

const FeaturedImage: React.FC<FeaturedImageProps> = ({ image }) => {
  const [isLoading, setIsLoading] = useState(true);
  
  return (
    <div className="relative rounded-lg overflow-hidden border border-orange-500 w-full md:w-1/3">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse">
          <div className="w-full h-48 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" 
               style={{ 
                 backgroundSize: '200% 100%',
                 animation: 'shimmer 1.5s infinite linear'
               }}
          />
        </div>
      )}
      <img
        src={getBestImageUrl(image)}
        alt="Imagem de capa"
        className="w-full h-48 object-cover"
        onLoad={() => setIsLoading(false)}
        onError={(e) => {
          console.error(`Error loading featured image ${image.id}:`, e);
          setIsLoading(false);
          // Use inline data URI as fallback
          e.currentTarget.src = placeholderImage;
        }}
        style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 0.3s ease-in-out' }}
      />
      <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-md">
        Capa
      </div>
    </div>
  );
};

const SortableImage: React.FC<SortableImageProps> = ({ image, onSetFeatured, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: image.id });
  const [isLoading, setIsLoading] = useState(true);
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  // Debug image URLs
  console.log(`Image ${image.id} URLs:`, { 
    url: image.url, 
    thumbnail_url: image.thumbnail_url,
    file_path: image.file_path,
    selected_url: getBestImageUrl(image)
  });
  
  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`relative rounded-lg overflow-hidden border ${
        image.is_featured ? 'border-orange-500 ring-2 ring-orange-500' : 'border-gray-200'
      }`}
    >
      <div 
        className="cursor-move w-full h-40 bg-gray-100"
        {...attributes}
        {...listeners}
      >
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse">
            <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" 
                 style={{ 
                   backgroundSize: '200% 100%',
                   animation: 'shimmer 1.5s infinite linear'
                 }}
            />
          </div>
        )}
        <img
          src={getBestImageUrl(image)}
          alt={image.title || 'Imagem do imóvel'}
          className="w-full h-40 object-cover"
          onLoad={() => setIsLoading(false)}
          onError={(e) => {
            console.error(`Error loading image ${image.id}:`, e);
            setIsLoading(false);
            // Use inline data URI as fallback
            e.currentTarget.src = placeholderImage;
          }}
          style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 0.3s ease-in-out' }}
        />
      </div>
      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-opacity flex items-center justify-center opacity-0 hover:opacity-100">
        <div className="flex space-x-2">
          {!image.is_featured && (
            <button
              type="button"
              onClick={() => onSetFeatured(image.id)}
              className="bg-orange-500 text-white p-2 rounded-full"
              title="Definir como capa"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </button>
          )}
          <button
            type="button"
            onClick={() => onDelete(image.id)}
            className="bg-red-500 text-white p-2 rounded-full"
            title="Excluir imagem"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
      {image.is_featured && (
        <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-md">
          Capa
        </div>
      )}
    </div>
  );
};

const PropertyForm: React.FC = () => {
  // Add shimmer animation style
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes shimmer {
        0% {
          background-position: -200% 0;
        }
        100% {
          background-position: 200% 0;
        }
      }
      .animate-shimmer {
        animation: shimmer 1.5s infinite linear;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [propertyImages, setPropertyImages] = useState<PropertyImage[]>([]);
  
  // Estados para listas de opções
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Property>({
    defaultValues: {
      active: true,
      featured: false,
      status: 'available',
      purpose: 'sale',
      features: [],
      bedrooms: 0,
      bathrooms: 0,
      suites: 0,
      parking_spaces: 0
    }
  });

  // Observar campos que afetam outros campos
  const cityId = watch('city_id');
  const purpose = watch('purpose');
  const selectedFeatures = watch('features') || [];
  
  // Add drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Carregar dados iniciais
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        // Carregar tipos de imóveis
        const typesResponse = await api.get('/property-types');
        console.log('Property types response:', typesResponse);
        
        // Garantir que propertyTypes seja sempre um array e filtrar itens sem ID
        const typesData = typesResponse.data || typesResponse;
        const typesArray = Array.isArray(typesData) ? typesData : Object.values(typesData || {});
        setPropertyTypes(typesArray.filter(type => type && type.id));
        
        // Carregar cidades - Ajustar endpoint para garantir que é o correto
        const citiesResponse = await api.get('/cities');
        console.log('Cities response:', citiesResponse);
        const citiesData = citiesResponse.data || citiesResponse;
        const citiesArray = Array.isArray(citiesData) ? citiesData : Object.values(citiesData || {});
        setCities(citiesArray.filter(city => city && city.id));
        
        // Carregar características
        const featuresResponse = await api.get('/features');
        const featuresData = featuresResponse.data || featuresResponse;
        const featuresArray = Array.isArray(featuresData) ? featuresData : Object.values(featuresData || {});
        setFeatures(featuresArray.filter(feature => feature && feature.id));
        
        // Carregar pessoas (proprietários e corretores)
        const peopleResponse = await api.get('/people');
        const peopleData = peopleResponse.data || peopleResponse;
        const peopleArray = Array.isArray(peopleData) ? peopleData : Object.values(peopleData || {});
        setPeople(peopleArray.filter(person => person && person.id));
        
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
        toast.error('Não foi possível carregar os dados necessários para o formulário');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Carregar bairros quando a cidade for selecionada
  useEffect(() => {
    if (!cityId) return;
    
    const fetchNeighborhoods = async () => {
      try {
        console.log('Buscando bairros para a cidade ID:', cityId);
        
        // Tentar o endpoint padrão primeiro
        try {
          const response = await api.get(`/cities/${cityId}/neighborhoods`);
          console.log('Neighborhoods response (padrão):', response);
          const neighborhoodsData = response.data || response;
          const neighborhoodsArray = Array.isArray(neighborhoodsData) ? neighborhoodsData : Object.values(neighborhoodsData || {});
          setNeighborhoods(neighborhoodsArray.filter(neighborhood => neighborhood && neighborhood.id));
          return; // Se funcionou, não prossiga para as outras tentativas
        } catch (err) {
          console.warn('Endpoint padrão falhou, tentando alternativa 1');
        }
        
        // Tentar endpoint alternativo 1
        try {
          const response = await api.get(`/neighborhoods`, { params: { city_id: cityId } });
          console.log('Neighborhoods response (alt 1):', response);
          const neighborhoodsData = response.data || response;
          const neighborhoodsArray = Array.isArray(neighborhoodsData) ? neighborhoodsData : Object.values(neighborhoodsData || {});
          setNeighborhoods(neighborhoodsArray.filter(neighborhood => neighborhood && neighborhood.id));
          return;
        } catch (err) {
          console.warn('Endpoint alternativo 1 falhou');
          throw err;
        }
        
      } catch (error) {
        console.error('Erro ao carregar bairros:', error);
        console.error('Detalhes:', error.response?.data);
        toast.error('Não foi possível carregar os bairros da cidade selecionada');
      }
    };

    fetchNeighborhoods();
  }, [cityId]);

  // Carregar dados do imóvel se estiver editando
  useEffect(() => {
    if (!id) return;

    const fetchProperty = async () => {
      setIsLoading(true);
      try {
        // Carregar dados reais da API - o interceptor já retorna o corpo da resposta
        const response = await api.get(`/properties/${id}`) as PropertyApiResponse;
        console.log('Property response:', response);
        
        // Verificar se a resposta contém os dados esperados
        if (!response || !response.success || !response.property) {
          console.error('Dados do imóvel não encontrados na resposta:', response);
          toast.error('Estrutura de dados do imóvel inválida');
          return;
        }
        
        const property = response.property;
        console.log('Dados do imóvel carregados:', property);
        
        // Preencher o formulário com os dados do imóvel
        Object.keys(property).forEach(key => {
          if (key !== 'features') {
            setValue(key as any, property[key as keyof typeof property]);
          }
        });
        
        // Preencher características selecionadas
        if (property.features && property.features.length > 0) {
          let selectedFeatureIds: number[] = [];
          
          // Verificar o formato dos dados de features retornados pela API
          if (typeof property.features[0] === 'object' && property.features[0] !== null) {
            // Se for um array de objetos com id (PropertyFeature[])
            const featureObjects = property.features as unknown as PropertyFeature[];
            selectedFeatureIds = featureObjects.map(feature => feature.id);
          } else {
            // Se já for um array de IDs (number[])
            selectedFeatureIds = property.features as unknown as number[];
          }
          
          setValue('features', selectedFeatureIds);
        }
        
        // Carregar imagens do imóvel se disponíveis
        if (property.property_images && property.property_images.length > 0) {
          setPropertyImages(property.property_images);
          console.log('Imagens carregadas:', property.property_images);
        } else if (property.photos && property.photos.length > 0) {
          setPropertyImages(property.photos);
          console.log('Fotos legadas carregadas:', property.photos);
        }
        
      } catch (error) {
        console.error('Erro ao carregar imóvel:', error);
        toast.error('Não foi possível carregar os dados do imóvel');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperty();
  }, [id, setValue]);

  // Enviar o formulário
  const onSubmit = async (data: Property) => {
    setIsSaving(true);
    try {
      // Processar características selecionadas
      if (data.features) {
        // Converter valores de string para número se necessário
        data.features = Array.isArray(data.features) 
          ? data.features.map(id => typeof id === 'string' ? parseInt(id, 10) : id)
          : [];
      }
      
      // Garantir que os IDs sejam convertidos para números
      if (data.city_id && typeof data.city_id === 'string') {
        data.city_id = parseInt(data.city_id, 10);
      }
      
      if (data.neighborhood_id && typeof data.neighborhood_id === 'string') {
        data.neighborhood_id = parseInt(data.neighborhood_id, 10);
      }
      
      if (data.property_type_id && typeof data.property_type_id === 'string') {
        data.property_type_id = parseInt(data.property_type_id, 10);
      }
      
      if (data.owner_id && typeof data.owner_id === 'string') {
        data.owner_id = parseInt(data.owner_id, 10);
      }
      
      if (data.agent_id && typeof data.agent_id === 'string') {
        data.agent_id = parseInt(data.agent_id, 10);
      }

      console.log('Form data to be submitted:', data);
      
      if (id) {
        // Atualizar imóvel existente
        await api.put(`/properties/${id}`, data);
        toast.success('Imóvel atualizado com sucesso!');
      } else {
        // Criar novo imóvel
        await api.post('/properties', data);
        toast.success('Imóvel criado com sucesso!');
      }
      navigate('/admin/imoveis');
    } catch (error: any) {
      console.error('Erro ao salvar imóvel:', error);
      console.error('Detalhes da resposta:', error.response?.data);
      
      // Tratar erros de validação da API
      if (error.response && error.response.data && error.response.data.errors) {
        // Exibir erros de validação
        const validationErrors = error.response.data.errors;
        Object.keys(validationErrors).forEach(field => {
          toast.error(validationErrors[field][0]);
        });
      } else {
        toast.error(error.response?.data?.message || 'Erro ao salvar o imóvel. Por favor, tente novamente.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Função para reordenar as imagens
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      return;
    }
    
    setPropertyImages((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      
      return arrayMove(items, oldIndex, newIndex);
    });
    
    try {
      // Enviar a nova ordem para o backend
      const imageIds = propertyImages.map((image) => image.id);
      await api.post(`/properties/${id}/images/reorder`, { image_ids: imageIds });
      toast.success('Ordem das imagens atualizada com sucesso');
    } catch (error) {
      console.error('Erro ao reordenar imagens:', error);
      toast.error('Erro ao atualizar a ordem das imagens');
      // Recarregar as imagens para garantir que a ordem esteja correta
      await refreshPropertyImages();
    }
  };

  // Função para fazer upload de imagens
  const handleImageUpload = async (files: FileList | null) => {
    if (!id || !files || files.length === 0) return;
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      
      // Adicionar cada arquivo ao FormData
      for (let i = 0; i < files.length; i++) {
        formData.append('images[]', files[i]);
      }
      
      // Adicionar flag para conversão para AVIF
      formData.append('convert_to_avif', 'true');
      
      // Enviar para a API
      await api.post(`/properties/${id}/images/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Imagens enviadas com sucesso');
      
      // Recarregar os dados do imóvel para atualizar as imagens
      await refreshPropertyImages();
    } catch (error) {
      console.error('Erro ao fazer upload de imagens:', error);
      toast.error('Falha ao enviar imagens. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };
  
  // Função para definir imagem como destaque
  const handleSetFeatured = async (imageId: number) => {
    try {
      await api.put(`/properties/images/${imageId}/featured`);
      
      toast.success('Imagem definida como destaque');
      
      // Recarregar os dados do imóvel para atualizar as imagens
      await refreshPropertyImages();
    } catch (error) {
      console.error('Erro ao definir imagem como destaque:', error);
      toast.error('Falha ao definir imagem como destaque');
    }
  };
  
  // Função para excluir uma imagem
  const handleDeleteImage = async (imageId: number) => {
    if (!confirm('Tem certeza que deseja excluir esta imagem?')) return;
    
    try {
      await api.delete(`/properties/images/${imageId}`);
      
      toast.success('Imagem excluída com sucesso');
      
      // Recarregar os dados do imóvel para atualizar as imagens
      await refreshPropertyImages();
    } catch (error) {
      console.error('Erro ao excluir imagem:', error);
      toast.error('Falha ao excluir imagem');
    }
  };
  
  // Função para recarregar as imagens do imóvel
  const refreshPropertyImages = async () => {
    if (!id) return;
    
    try {
      const response = await api.get(`/properties/${id}`) as unknown as PropertyApiResponse;
      console.log('Property response in refreshPropertyImages:', response);
      
      if (response && response.property) {
        if (response.property.property_images && response.property.property_images.length > 0) {
          console.log('Property images from API:', response.property.property_images);
          
          // Always ensure URLs are properly formatted
          const imagesWithUrls = response.property.property_images.map(img => {
            // Make sure URL is absolute
            let imageUrl = img.url || '';
            let thumbnailUrl = img.thumbnail_url || '';
            
            if (!isValidImageUrl(imageUrl) && img.file_path) {
              // Ensure we use the correct domain for the backend
              imageUrl = `${getBackendUrl()}/storage/${img.file_path}`;
            }
            
            if (!isValidImageUrl(thumbnailUrl) && img.file_path) {
              const pathInfo = img.file_path.split('.');
              const ext = pathInfo.pop() || '';
              const basePath = pathInfo.join('.');
              // Ensure we use the correct domain for the backend
              thumbnailUrl = `${getBackendUrl()}/storage/${basePath}_thumb.${ext}`;
            }
            
            // Log the final URLs for debugging
            console.log(`Image ${img.id} final URLs:`, { 
              original_url: img.url,
              original_thumbnail: img.thumbnail_url,
              fixed_url: imageUrl,
              fixed_thumbnail: thumbnailUrl
            });
            
            return {
              ...img,
              url: imageUrl,
              thumbnail_url: thumbnailUrl
            };
          });
          
          setPropertyImages(imagesWithUrls);
        } else if (response.property.photos && response.property.photos.length > 0) {
          console.log('Legacy photos from API:', response.property.photos);
          setPropertyImages(response.property.photos);
        } else {
          console.log('No images found for property');
          setPropertyImages([]);
        }
      } else {
        console.warn('Invalid property response structure:', response);
        setPropertyImages([]);
      }
    } catch (error) {
      console.error('Erro ao recarregar imagens:', error);
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
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle>{id ? 'Editar Imóvel' : 'Novo Imóvel'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
              <TabsTrigger value="address">Endereço</TabsTrigger>
              <TabsTrigger value="details">Detalhes e Características</TabsTrigger>
              <TabsTrigger value="photos">Fotos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4 pt-4">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Informações Básicas</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Código do Imóvel</Label>
                    <Input
                      id="code"
                      {...register('code', {
                        maxLength: {
                          value: 50,
                          message: 'O código não pode ter mais de 50 caracteres'
                        }
                      })}
                    />
                    {errors.code && (
                      <p className="text-sm text-red-500">{errors.code.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="property_type_id">Tipo de Imóvel *</Label>
                    <select
                      id="property_type_id"
                      className="w-full p-2 border rounded-md"
                      {...register('property_type_id', {
                        required: 'O tipo de imóvel é obrigatório'
                      })}
                    >
                      <option value="0">Selecione um tipo</option>
                      {Array.isArray(propertyTypes) && propertyTypes.map((type, index) => (
                        <option key={type.id ? `type-${type.id}` : `type-index-${index}`} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                    {errors.property_type_id && (
                      <p className="text-sm text-red-500">{errors.property_type_id.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    {...register('title', {
                      required: 'O título do imóvel é obrigatório',
                      maxLength: {
                        value: 255,
                        message: 'O título não pode ter mais de 255 caracteres'
                      }
                    })}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição *</Label>
                  <Textarea
                    id="description"
                    rows={5}
                    {...register('description', {
                      required: 'A descrição do imóvel é obrigatória'
                    })}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">{errors.description.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Finalidade *</Label>
                  <div className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        id="purpose-sale" 
                        value="sale" 
                        {...register('purpose', {
                          required: 'A finalidade do imóvel é obrigatória'
                        })} 
                      />
                      <Label htmlFor="purpose-sale">Venda</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        id="purpose-rent" 
                        value="rent" 
                        {...register('purpose', {
                          required: 'A finalidade do imóvel é obrigatória'
                        })} 
                      />
                      <Label htmlFor="purpose-rent">Aluguel</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        id="purpose-both" 
                        value="both" 
                        {...register('purpose', {
                          required: 'A finalidade do imóvel é obrigatória'
                        })} 
                      />
                      <Label htmlFor="purpose-both">Ambos</Label>
                    </div>
                  </div>
                  {errors.purpose && (
                    <p className="text-sm text-red-500">{errors.purpose.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sale_price">
                      Preço de Venda {(purpose === 'sale' || purpose === 'both') && '*'}
                    </Label>
                    <Input
                      id="sale_price"
                      type="number"
                      step="0.01"
                      min="0"
                      disabled={purpose === 'rent'}
                      {...register('sale_price', {
                        required: purpose === 'sale' || purpose === 'both' ? 'O preço de venda é obrigatório' : false,
                        min: {
                          value: 0,
                          message: 'O preço deve ser maior ou igual a zero'
                        },
                        valueAsNumber: true
                      })}
                    />
                    {errors.sale_price && (
                      <p className="text-sm text-red-500">{errors.sale_price.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rent_price">
                      Preço de Aluguel {(purpose === 'rent' || purpose === 'both') && '*'}
                    </Label>
                    <Input
                      id="rent_price"
                      type="number"
                      step="0.01"
                      min="0"
                      disabled={purpose === 'sale'}
                      {...register('rent_price', {
                        required: purpose === 'rent' || purpose === 'both' ? 'O preço de aluguel é obrigatório' : false,
                        min: {
                          value: 0,
                          message: 'O preço deve ser maior ou igual a zero'
                        },
                        valueAsNumber: true
                      })}
                    />
                    {errors.rent_price && (
                      <p className="text-sm text-red-500">{errors.rent_price.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="condominium_fee">Taxa de Condomínio</Label>
                    <Input
                      id="condominium_fee"
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('condominium_fee', {
                        min: {
                          value: 0,
                          message: 'A taxa deve ser maior ou igual a zero'
                        }
                      })}
                    />
                    {errors.condominium_fee && (
                      <p className="text-sm text-red-500">{errors.condominium_fee.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="iptu">IPTU</Label>
                    <Input
                      id="iptu"
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('iptu', {
                        min: {
                          value: 0,
                          message: 'O IPTU deve ser maior ou igual a zero'
                        }
                      })}
                    />
                    {errors.iptu && (
                      <p className="text-sm text-red-500">{errors.iptu.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <select
                    id="status"
                    className="w-full p-2 border rounded-md"
                    {...register('status', {
                      required: 'O status do imóvel é obrigatório'
                    })}
                  >
                    <option value="available">Disponível</option>
                    <option value="sold">Vendido</option>
                    <option value="rented">Alugado</option>
                    <option value="reserved">Reservado</option>
                    <option value="unavailable">Indisponível</option>
                  </select>
                  {errors.status && (
                    <p className="text-sm text-red-500">{errors.status.message}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    {...register('featured')}
                  />
                  <Label htmlFor="featured">Destaque</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="active"
                    {...register('active')}
                    defaultChecked={true}
                  />
                  <Label htmlFor="active">Ativo</Label>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="address" className="space-y-4 pt-4">
              {/* Endereço */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Endereço</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço *</Label>
                  <Input
                    id="address"
                    {...register('address', {
                      required: 'O endereço é obrigatório',
                      maxLength: {
                        value: 255,
                        message: 'O endereço não pode ter mais de 255 caracteres'
                      }
                    })}
                  />
                  {errors.address && (
                    <p className="text-sm text-red-500">{errors.address.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address_number">Número *</Label>
                    <Input
                      id="address_number"
                      {...register('address_number', {
                        required: 'O número é obrigatório',
                        maxLength: {
                          value: 20,
                          message: 'O número não pode ter mais de 20 caracteres'
                        }
                      })}
                    />
                    {errors.address_number && (
                      <p className="text-sm text-red-500">{errors.address_number.message}</p>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address_complement">Complemento</Label>
                    <Input
                      id="address_complement"
                      {...register('address_complement', {
                        maxLength: {
                          value: 100,
                          message: 'O complemento não pode ter mais de 100 caracteres'
                        }
                      })}
                    />
                    {errors.address_complement && (
                      <p className="text-sm text-red-500">{errors.address_complement.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city_id">Cidade *</Label>
                    <select
                      id="city_id"
                      className="w-full p-2 border rounded-md"
                      {...register('city_id', {
                        required: 'A cidade é obrigatória'
                      })}
                    >
                      <option value="">Selecione uma cidade</option>
                      {Array.isArray(cities) && cities.map((city, index) => (
                        <option key={city.id ? `city-${city.id}` : `city-index-${index}`} value={city.id}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                    {errors.city_id && (
                      <p className="text-sm text-red-500">{errors.city_id.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="neighborhood_id">Bairro *</Label>
                    <select
                      id="neighborhood_id"
                      className="w-full p-2 border rounded-md"
                      disabled={!cityId}
                      {...register('neighborhood_id', {
                        required: 'O bairro é obrigatório'
                      })}
                    >
                      <option value="">Selecione um bairro</option>
                      {Array.isArray(neighborhoods) && neighborhoods.map((neighborhood, index) => (
                        <option key={neighborhood.id ? `neighborhood-${neighborhood.id}` : `neighborhood-index-${index}`} value={neighborhood.id}>
                          {neighborhood.name}
                        </option>
                      ))}
                    </select>
                    {errors.neighborhood_id && (
                      <p className="text-sm text-red-500">{errors.neighborhood_id.message}</p>
                    )}
                    {!cityId && (
                      <p className="text-sm text-amber-500">Selecione uma cidade primeiro</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="state">Estado *</Label>
                    <Input
                      id="state"
                      maxLength={2}
                      {...register('state', {
                        required: 'O estado é obrigatório',
                        minLength: {
                          value: 2,
                          message: 'O estado deve ter 2 caracteres'
                        },
                        maxLength: {
                          value: 2,
                          message: 'O estado deve ter 2 caracteres'
                        }
                      })}
                    />
                    {errors.state && (
                      <p className="text-sm text-red-500">{errors.state.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zip_code">CEP *</Label>
                    <Input
                      id="zip_code"
                      {...register('zip_code', {
                        required: 'O CEP é obrigatório',
                        maxLength: {
                          value: 10,
                          message: 'O CEP não pode ter mais de 10 caracteres'
                        }
                      })}
                    />
                    {errors.zip_code && (
                      <p className="text-sm text-red-500">{errors.zip_code.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="0.00000001"
                      {...register('latitude')}
                    />
                    {errors.latitude && (
                      <p className="text-sm text-red-500">{errors.latitude.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="0.00000001"
                      {...register('longitude')}
                    />
                    {errors.longitude && (
                      <p className="text-sm text-red-500">{errors.longitude.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="details" className="space-y-4 pt-4">
              {/* Detalhes e Características */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Detalhes do Imóvel</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="total_area">Área Total (m²)</Label>
                    <Input
                      id="total_area"
                      type="number"
                      min="0"
                      step="0.01"
                      {...register('total_area', {
                        min: {
                          value: 0,
                          message: 'A área deve ser maior ou igual a zero'
                        }
                      })}
                    />
                    {errors.total_area && (
                      <p className="text-sm text-red-500">{errors.total_area.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="built_area">Área Construída (m²)</Label>
                    <Input
                      id="built_area"
                      type="number"
                      min="0"
                      step="0.01"
                      {...register('built_area', {
                        min: {
                          value: 0,
                          message: 'A área deve ser maior ou igual a zero'
                        }
                      })}
                    />
                    {errors.built_area && (
                      <p className="text-sm text-red-500">{errors.built_area.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="land_area">Área do Terreno (m²)</Label>
                    <Input
                      id="land_area"
                      type="number"
                      min="0"
                      step="0.01"
                      {...register('land_area', {
                        min: {
                          value: 0,
                          message: 'A área deve ser maior ou igual a zero'
                        }
                      })}
                    />
                    {errors.land_area && (
                      <p className="text-sm text-red-500">{errors.land_area.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Quartos</Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      min="0"
                      {...register('bedrooms', {
                        min: {
                          value: 0,
                          message: 'O número de quartos deve ser maior ou igual a zero'
                        }
                      })}
                    />
                    {errors.bedrooms && (
                      <p className="text-sm text-red-500">{errors.bedrooms.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Banheiros</Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      min="0"
                      {...register('bathrooms', {
                        min: {
                          value: 0,
                          message: 'O número de banheiros deve ser maior ou igual a zero'
                        }
                      })}
                    />
                    {errors.bathrooms && (
                      <p className="text-sm text-red-500">{errors.bathrooms.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="suites">Suítes</Label>
                    <Input
                      id="suites"
                      type="number"
                      min="0"
                      {...register('suites', {
                        min: {
                          value: 0,
                          message: 'O número de suítes deve ser maior ou igual a zero'
                        }
                      })}
                    />
                    {errors.suites && (
                      <p className="text-sm text-red-500">{errors.suites.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parking_spaces">Vagas de Garagem</Label>
                    <Input
                      id="parking_spaces"
                      type="number"
                      min="0"
                      {...register('parking_spaces', {
                        min: {
                          value: 0,
                          message: 'O número de vagas deve ser maior ou igual a zero'
                        }
                      })}
                    />
                    {errors.parking_spaces && (
                      <p className="text-sm text-red-500">{errors.parking_spaces.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="year_built">Ano de Construção</Label>
                    <Input
                      id="year_built"
                      type="number"
                      min="1800"
                      max={new Date().getFullYear()}
                      {...register('year_built', {
                        min: {
                          value: 1800,
                          message: 'O ano deve ser maior ou igual a 1800'
                        },
                        max: {
                          value: new Date().getFullYear(),
                          message: `O ano não pode ser maior que ${new Date().getFullYear()}`
                        }
                      })}
                    />
                    {errors.year_built && (
                      <p className="text-sm text-red-500">{errors.year_built.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="floor">Andar</Label>
                    <Input
                      id="floor"
                      type="number"
                      min="0"
                      {...register('floor', {
                        min: {
                          value: 0,
                          message: 'O andar deve ser maior ou igual a zero'
                        }
                      })}
                    />
                    {errors.floor && (
                      <p className="text-sm text-red-500">{errors.floor.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="owner_id">Proprietário</Label>
                  <select
                    id="owner_id"
                    className="w-full p-2 border rounded-md"
                    {...register('owner_id')}
                  >
                    <option value="">Selecione um proprietário</option>
                    {Array.isArray(people) && people.filter(person => person.type === 'owner').map((person, index) => (
                      <option key={person.id ? `owner-${person.id}` : `owner-index-${index}`} value={person.id}>
                        {person.name}
                      </option>
                    ))}
                  </select>
                  {errors.owner_id && (
                    <p className="text-sm text-red-500">{errors.owner_id.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agent_id">Corretor Responsável</Label>
                  <select
                    id="agent_id"
                    className="w-full p-2 border rounded-md"
                    {...register('agent_id')}
                  >
                    <option value="">Selecione um corretor</option>
                    {Array.isArray(people) && people.filter(person => person.type === 'agent').map((person, index) => (
                      <option key={person.id ? `agent-${person.id}` : `agent-index-${index}`} value={person.id}>
                        {person.name}
                      </option>
                    ))}
                  </select>
                  {errors.agent_id && (
                    <p className="text-sm text-red-500">{errors.agent_id.message}</p>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Características</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Array.isArray(features) && features.map((feature, index) => {
                      // Usar um ID único para cada feature
                      const featureId = feature.id;
                      const isSelected = Array.isArray(selectedFeatures) && 
                        selectedFeatures.some(id => Number(id) === Number(featureId));
                      
                      return (
                        <div key={`feature-${featureId || index}`} className="flex items-center space-x-2">
                          <Checkbox
                            id={`feature-${featureId || index}`}
                            value={String(featureId)}
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              const currentFeatures = [...(Array.isArray(selectedFeatures) ? selectedFeatures : [])];
                              
                              if (checked) {
                                // Adicionar a característica se estiver marcada
                                if (!currentFeatures.includes(featureId)) {
                                  setValue('features', [...currentFeatures, featureId]);
                                }
                              } else {
                                // Remover a característica se estiver desmarcada
                                setValue('features', currentFeatures.filter(id => Number(id) !== Number(featureId)));
                              }
                            }}
                          />
                          <Label htmlFor={`feature-${featureId || index}`}>{feature.name}</Label>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additional_info">Informações Adicionais</Label>
                  <Textarea
                    id="additional_info"
                    rows={4}
                    {...register('additional_info')}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="photos" className="space-y-4 pt-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Fotos do Imóvel</h3>
                
                {!id && (
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-md">
                    <p className="text-amber-700">
                      Para adicionar fotos, primeiro salve o imóvel.
                    </p>
                  </div>
                )}
                
                {id && (
                  <>
                    {/* Seção de imagem de capa */}
                    <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-6">
                      <h4 className="text-base font-medium mb-3">Imagem de Capa</h4>
                      
                      {propertyImages && propertyImages.some((img: any) => img.is_featured) ? (
                        <div className="flex flex-col md:flex-row gap-4 items-start">
                          {propertyImages
                            .filter((img: any) => img.is_featured)
                            .map((image: any) => (
                              <FeaturedImage key={`featured-${image.id}`} image={image} />
                            ))}
                          
                          <div className="flex-1 space-y-2">
                            <p className="text-sm text-gray-700">
                              Esta é a imagem principal que será exibida nos resultados de busca e no topo da página do imóvel.
                            </p>
                            <p className="text-sm text-gray-500">
                              Para alterar a imagem de capa, selecione outra imagem da galeria abaixo e clique no ícone de estrela.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-amber-50 border border-amber-200 p-4 rounded-md">
                          <p className="text-amber-700">
                            Nenhuma imagem de capa definida. Faça upload de imagens e defina uma como capa.
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <input
                        type="file"
                        id="property-images"
                        multiple
                        accept="image/jpeg,image/png,image/jpg,image/webp,image/avif"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e.target.files)}
                        disabled={isUploading}
                      />
                      <label
                        htmlFor="property-images"
                        className="cursor-pointer flex flex-col items-center justify-center"
                      >
                        {isUploading ? (
                          <div className="flex flex-col items-center w-full">
                            <div className="w-full h-32 bg-gray-200 animate-pulse mb-4">
                              <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" 
                                   style={{ 
                                     backgroundSize: '200% 100%',
                                     animation: 'shimmer 1.5s infinite linear'
                                   }}
                              />
                            </div>
                            <Spinner size="lg" />
                            <p className="mt-2 text-sm text-gray-500">Enviando imagens...</p>
                          </div>
                        ) : (
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-10 w-10 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <p className="mt-2 text-sm text-gray-500">
                              Clique para selecionar imagens ou arraste e solte aqui
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                              JPG, PNG, WEBP, AVIF (máx. 5MB por imagem)
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                              As imagens serão automaticamente convertidas para AVIF
                            </p>
                          </>
                        )}
                      </label>
                    </div>
                    
                    {/* Galeria de imagens */}
                    <h4 className="text-base font-medium mt-6 mb-3">Galeria de Imagens</h4>
                    <p className="text-sm text-gray-500 mb-4">
                      Arraste e solte as imagens para reordenar a galeria. A ordem das imagens será salva automaticamente.
                    </p>
                    {isLoading ? (
                      // Loading skeleton for gallery
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        {[...Array(8)].map((_, index) => (
                          <div key={`skeleton-${index}`} className="rounded-lg overflow-hidden border border-gray-200">
                            <div className="w-full h-40 bg-gray-200 animate-pulse">
                              <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" 
                                   style={{ 
                                     backgroundSize: '200% 100%',
                                     animation: 'shimmer 1.5s infinite linear'
                                   }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : propertyImages && propertyImages.length > 0 ? (
                      <DndContext 
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={propertyImages.map(img => img.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            {propertyImages.map((image: PropertyImage) => (
                              <SortableImage
                                key={image.id}
                                image={image}
                                onSetFeatured={handleSetFeatured}
                                onDelete={handleDeleteImage}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">Nenhuma imagem adicionada</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/imoveis')}
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
              'Atualizar Imóvel'
            ) : (
              'Criar Imóvel'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default PropertyForm; 