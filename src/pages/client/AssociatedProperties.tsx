
import { MapPin, Bed, Bath, ArrowUpRight, Calendar } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const AssociatedProperties = () => {
  // Mock properties data
  const ownedProperties = [
    {
      id: 1,
      title: "Apartamento 301 - Edifício Aurora",
      address: "Rua das Flores, 150, Apto 301 - Jardins, São Paulo",
      type: "Apartamento",
      status: "Alugado",
      bedrooms: 2,
      bathrooms: 2,
      area: 78,
      image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      tenant: "Maria Silva",
      contractEnd: "31/12/2023",
      monthlyRent: 2500,
    },
    {
      id: 2,
      title: "Casa em Condomínio Fechado",
      address: "Rua dos Ipês, 78 - Alphaville, São Paulo",
      type: "Casa",
      status: "Disponível",
      bedrooms: 3,
      bathrooms: 2,
      area: 150,
      image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      tenant: null,
      contractEnd: null,
      monthlyRent: null,
    },
  ];

  const rentedProperties = [
    {
      id: 3,
      title: "Apartamento 502 - Residencial Mirante",
      address: "Av. Paulista, 1000, Apto 502 - Bela Vista, São Paulo",
      type: "Apartamento",
      status: "Ativo",
      bedrooms: 3,
      bathrooms: 2,
      area: 110,
      image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      owner: "Imobiliária EasyHome",
      contractEnd: "15/10/2024",
      monthlyRent: 3800,
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Alugado":
        return "bg-blue-500";
      case "Disponível":
        return "bg-green-500";
      case "Ativo":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const PropertyCard = ({ property, isRented = false }: { property: any, isRented?: boolean }) => {
    return (
      <Card className="overflow-hidden">
        <div className="relative h-48">
          <img 
            src={property.image} 
            alt={property.title} 
            className="w-full h-full object-cover"
          />
          <Badge 
            className={`absolute top-3 right-3 ${getStatusColor(property.status)}`}
          >
            {property.status}
          </Badge>
        </div>
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-2">{property.title}</h3>
          
          <div className="flex items-start mb-4 text-gray-600">
            <MapPin className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{property.address}</p>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-6 text-center border-y border-gray-200 py-4">
            <div>
              <div className="flex items-center justify-center">
                <Bed className="h-4 w-4 text-gray-400 mr-1" />
                <span className="font-medium">{property.bedrooms}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Quartos</p>
            </div>
            <div>
              <div className="flex items-center justify-center">
                <Bath className="h-4 w-4 text-gray-400 mr-1" />
                <span className="font-medium">{property.bathrooms}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Banheiros</p>
            </div>
            <div>
              <div className="flex items-center justify-center">
                <span className="font-medium">{property.area}m²</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Área</p>
            </div>
          </div>
          
          {isRented ? (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Proprietário:</span>
                <span className="font-medium">{property.owner}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Aluguel Mensal:</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(property.monthlyRent)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Fim do Contrato:</span>
                <span className="font-medium flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                  {property.contractEnd}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {property.tenant && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Inquilino:</span>
                    <span className="font-medium">{property.tenant}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Aluguel Mensal:</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(property.monthlyRent)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Fim do Contrato:</span>
                    <span className="font-medium flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      {property.contractEnd}
                    </span>
                  </div>
                </>
              )}
              {!property.tenant && (
                <div className="text-center text-gray-600">
                  Este imóvel está disponível para locação.
                </div>
              )}
            </div>
          )}
          
          <Button 
            variant="outline" 
            className="w-full mt-6 text-orange-500 border-orange-500 hover:bg-orange-50"
          >
            Ver Detalhes
            <ArrowUpRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Meus Imóveis</h1>
      
      <Tabs defaultValue="owned">
        <TabsList className="mb-8">
          <TabsTrigger value="owned">Meus Imóveis ({ownedProperties.length})</TabsTrigger>
          <TabsTrigger value="rented">Imóveis Alugados ({rentedProperties.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="owned">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ownedProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="rented">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rentedProperties.map((property) => (
              <PropertyCard key={property.id} property={property} isRented />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssociatedProperties;
