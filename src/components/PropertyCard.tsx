
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PropertyCardProps {
  id: number;
  title: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  type: 'Venda' | 'Aluguel';
  image: string;
  className?: string;
}

const PropertyCard = ({
  id,
  title,
  price,
  location,
  bedrooms,
  bathrooms,
  area,
  type,
  image,
  className
}: PropertyCardProps) => {
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(price);

  return (
    <div className={cn("property-card", className)}>
      <div className="relative">
        <img src={image} alt={title} className="property-card-image" />
        <Badge 
          className="absolute top-3 left-3" 
          variant={type === 'Venda' ? 'default' : 'secondary'}
          style={{ backgroundColor: type === 'Venda' ? '#ea5d00' : '#4a5568' }}
        >
          {type}
        </Badge>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-1">{title}</h3>
        <p className="text-sm text-gray-500 mb-2 line-clamp-1">{location}</p>
        <p className="text-xl font-bold text-orange-500 mb-3">{formattedPrice}{type === 'Aluguel' ? '/mês' : ''}</p>
        <div className="grid grid-cols-3 gap-2 border-t pt-3">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900">{bedrooms}</p>
            <p className="text-xs text-gray-500">Quartos</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900">{bathrooms}</p>
            <p className="text-xs text-gray-500">Banheiros</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900">{area}m²</p>
            <p className="text-xs text-gray-500">Área</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
