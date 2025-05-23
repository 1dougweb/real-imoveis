
import { Link } from "react-router-dom";
import PropertyCard from "@/components/PropertyCard";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

const PropertyList = () => {
  // Mock property data
  const properties = [
    {
      id: 1,
      title: "Apartamento Luxuoso com Vista para o Mar",
      price: 850000,
      location: "Leblon, Rio de Janeiro",
      bedrooms: 3,
      bathrooms: 2,
      area: 120,
      type: 'Venda' as const,
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 2,
      title: "Casa com Piscina em Condomínio Fechado",
      price: 1200000,
      location: "Alphaville, São Paulo",
      bedrooms: 4,
      bathrooms: 3,
      area: 250,
      type: 'Venda' as const,
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 3,
      title: "Cobertura Duplex com Terraço",
      price: 5500,
      location: "Itaim Bibi, São Paulo",
      bedrooms: 2,
      bathrooms: 2,
      area: 100,
      type: 'Aluguel' as const,
      image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 4,
      title: "Studio Moderno Próximo ao Centro",
      price: 2800,
      location: "Centro, Curitiba",
      bedrooms: 1,
      bathrooms: 1,
      area: 45,
      type: 'Aluguel' as const,
      image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 5,
      title: "Sobrado em Área Nobre",
      price: 750000,
      location: "Jardins, São Paulo",
      bedrooms: 3,
      bathrooms: 3,
      area: 180,
      type: 'Venda' as const,
      image: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 6,
      title: "Apartamento com Varanda Gourmet",
      price: 3900,
      location: "Barra da Tijuca, Rio de Janeiro",
      bedrooms: 2,
      bathrooms: 2,
      area: 85,
      type: 'Aluguel' as const,
      image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 7,
      title: "Casa de Campo com Vista Panorâmica",
      price: 980000,
      location: "Serra da Mantiqueira, Minas Gerais",
      bedrooms: 4,
      bathrooms: 3,
      area: 240,
      type: 'Venda' as const,
      image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 8,
      title: "Loft Industrial Reformado",
      price: 4200,
      location: "Vila Madalena, São Paulo",
      bedrooms: 1,
      bathrooms: 1,
      area: 70,
      type: 'Aluguel' as const,
      image: "https://images.unsplash.com/photo-1560448075-bb485b067938?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
  ];
  
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <p className="text-gray-600 mb-4 md:mb-0">{properties.length} imóveis encontrados</p>
        
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="Buscar..."
              className="pl-10"
            />
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
          </div>
          
          <Select defaultValue="recent">
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Mais recentes</SelectItem>
              <SelectItem value="price-asc">Menor preço</SelectItem>
              <SelectItem value="price-desc">Maior preço</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <Link to={`/imoveis/${property.id}`} key={property.id} className="block transition-transform hover:scale-[1.02]">
            <PropertyCard {...property} />
          </Link>
        ))}
      </div>
    </>
  );
};

export default PropertyList;
