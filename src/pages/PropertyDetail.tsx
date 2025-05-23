
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, 
  BedDouble, 
  Bath, 
  ArrowLeft, 
  Square, 
  CalendarDays, 
  Share, 
  Heart,
  Mail,
  Phone
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Form schema for contact form
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres",
  }),
  email: z.string().email({
    message: "Email inválido",
  }),
  phone: z.string().min(8, {
    message: "Telefone inválido",
  }),
  message: z.string().min(10, {
    message: "Mensagem deve ter pelo menos 10 caracteres",
  }),
});

const PropertyDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);

  // Mock property data - in a real app, this would come from an API
  const property = {
    id: id,
    title: "Apartamento Luxuoso com Vista para o Mar",
    price: 850000,
    location: "Leblon, Rio de Janeiro",
    description: "Este belíssimo apartamento possui uma vista deslumbrante para o mar do Leblon. Com 3 quartos espaçosos, sendo 1 suíte master, sala de estar ampla, cozinha gourmet equipada com eletrodomésticos de alta qualidade, e 2 banheiros luxuosos. O imóvel conta ainda com varanda gourmet, perfeita para entretenimento e relaxamento enquanto aprecia a vista panorâmica. Localizado em uma das áreas mais valorizadas do Rio de Janeiro, próximo a restaurantes, comércio e a apenas 5 minutos a pé da praia.",
    features: [
      "3 quartos (1 suíte master)",
      "2 banheiros completos",
      "Varanda gourmet",
      "Vista para o mar",
      "Cozinha equipada",
      "Ar condicionado em todos os quartos",
      "1 vaga de garagem",
      "Piscina e academia no condomínio"
    ],
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    type: 'Venda',
    createdAt: "2023-01-15",
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1593696140826-c58b021acf8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    realtor: {
      name: "Carlos Oliveira",
      phone: "(21) 98765-4321",
      email: "carlos.oliveira@easyhome.com",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
    }
  };

  // Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: `Olá, estou interessado no imóvel "${property.title}" e gostaria de mais informações.`
    },
  });

  // Form submission handler
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: "Mensagem enviada!",
      description: "Entraremos em contato em breve.",
    });
    form.reset();
  }

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "Removido dos favoritos" : "Adicionado aos favoritos",
      description: isFavorite 
        ? "O imóvel foi removido da sua lista de favoritos" 
        : "O imóvel foi adicionado à sua lista de favoritos",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/imoveis" className="flex items-center text-orange-500 mb-4 font-medium">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Voltar para imóveis
      </Link>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="lg:w-2/3">
          {/* Image Gallery */}
          <div className="mb-6">
            <div className="aspect-video w-full rounded-lg overflow-hidden">
              <img 
                src={property.images[0]} 
                alt={property.title} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {property.images.slice(1).map((image, index) => (
                <div key={index} className="aspect-video rounded-md overflow-hidden">
                  <img 
                    src={image} 
                    alt={`${property.title} - Imagem ${index + 2}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1">{property.title}</h1>
              <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{property.location}</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Ref. #{property.id}</p>
              <p className="text-2xl font-bold text-orange-500">
                {property.type === 'Venda' 
                  ? `R$ ${property.price.toLocaleString('pt-BR')}` 
                  : `R$ ${property.price.toLocaleString('pt-BR')}/mês`
                }
              </p>
            </div>
          </div>

          {/* Property Details Tabs */}
          <Tabs defaultValue="details" className="mb-8">
            <TabsList className="w-full">
              <TabsTrigger value="details" className="w-full">Detalhes</TabsTrigger>
              <TabsTrigger value="features" className="w-full">Características</TabsTrigger>
              <TabsTrigger value="location" className="w-full">Localização</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="pt-4">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                  <BedDouble className="h-6 w-6 text-orange-500 mb-1" />
                  <span className="text-lg font-semibold">{property.bedrooms}</span>
                  <span className="text-sm text-gray-500">Quartos</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                  <Bath className="h-6 w-6 text-orange-500 mb-1" />
                  <span className="text-lg font-semibold">{property.bathrooms}</span>
                  <span className="text-sm text-gray-500">Banheiros</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                  <Square className="h-6 w-6 text-orange-500 mb-1" />
                  <span className="text-lg font-semibold">{property.area}m²</span>
                  <span className="text-sm text-gray-500">Área</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Descrição</h3>
                <p className="text-gray-700">{property.description}</p>
                <div className="flex items-center text-sm text-gray-500 mt-4">
                  <CalendarDays className="h-4 w-4 mr-1" />
                  <span>Publicado em {new Date(property.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="features" className="pt-4">
              <h3 className="text-lg font-semibold mb-2">Características</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {property.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <div className="h-2 w-2 bg-orange-500 rounded-full mr-2"></div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </TabsContent>
            <TabsContent value="location" className="pt-4">
              <div className="aspect-[16/9] bg-gray-100 flex items-center justify-center rounded-lg">
                <p className="text-gray-500">Mapa da localização</p>
                {/* In a real app, you'd embed a map here */}
              </div>
              <p className="mt-4 text-gray-700">
                Localizado em uma das áreas mais valorizadas do Rio de Janeiro, próximo a restaurantes, comércio e a apenas 5 minutos a pé da praia.
              </p>
            </TabsContent>
          </Tabs>

          <div className="flex space-x-3 mt-8">
            <Button 
              className="flex items-center"
              variant="outline"
              onClick={toggleFavorite}
            >
              <Heart 
                className={`h-4 w-4 mr-2 ${isFavorite ? "fill-orange-500 text-orange-500" : ""}`} 
              />
              {isFavorite ? "Salvo" : "Salvar"}
            </Button>
            
            <Button 
              className="flex items-center"
              variant="outline"
            >
              <Share className="h-4 w-4 mr-2" />
              Compartilhar
            </Button>
          </div>
        </div>

        {/* Sidebar with Realtor Info */}
        <div className="lg:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle>Corretor Responsável</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center mb-4">
                <div className="h-16 w-16 rounded-full overflow-hidden mr-4">
                  <img 
                    src={property.realtor.image} 
                    alt={property.realtor.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold">{property.realtor.name}</h3>
                  <p className="text-sm text-gray-500">Corretor de Imóveis</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-orange-500 mr-2" />
                  <span>{property.realtor.phone}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-orange-500 mr-2" />
                  <span>{property.realtor.email}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col items-stretch space-y-3">
              <Button className="w-full bg-orange-500 hover:bg-orange-600">
                <Phone className="h-4 w-4 mr-2" />
                Ligar
              </Button>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Mail className="h-4 w-4 mr-2" />
                    Enviar mensagem
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Enviar mensagem ao corretor</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome</FormLabel>
                            <FormControl>
                              <Input placeholder="Seu nome completo" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="seu@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone</FormLabel>
                            <FormControl>
                              <Input placeholder="(00) 00000-0000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mensagem</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Digite sua mensagem para o corretor"
                                className="min-h-[120px]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancelar</Button>
                        </DialogClose>
                        <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
                          Enviar
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Agendar Visita</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 mb-4">
                Agende uma visita para conhecer este imóvel pessoalmente com nosso corretor.
              </p>
              <Button className="w-full bg-orange-500 hover:bg-orange-600">
                <CalendarDays className="h-4 w-4 mr-2" />
                Agendar Visita
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
