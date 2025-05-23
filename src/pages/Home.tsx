
import { useState } from "react";
import { Link } from "react-router-dom";
import Hero from "@/components/Hero";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { 
  ChevronRight, 
  Building, 
  Home as HomeIcon, 
  Map, 
  ThumbsUp, 
  Clock, 
  Users,
  Phone,
  CheckCircle2,
  CalendarCheck
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Home = () => {
  // Mock property data
  const featuredProperties = [
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
  ];

  const services = [
    {
      icon: HomeIcon,
      title: "Compre com Confiança",
      description: "Encontre o imóvel perfeito para você e sua família com a ajuda dos nossos especialistas."
    },
    {
      icon: Building,
      title: "Alugue sem Complicações",
      description: "Oferecemos opções de aluguel em diversas regiões, com contratos claros e seguros."
    },
    {
      icon: Map,
      title: "Venda com Facilidade",
      description: "Anuncie seu imóvel com fotos profissionais e encontre compradores qualificados."
    }
  ];

  const testimonials = [
    {
      name: "Ana Silva",
      role: "Compradora",
      content: "Encontrei meu apartamento dos sonhos com a EasyHome. O processo foi simples e transparente do início ao fim.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80"
    },
    {
      name: "Carlos Mendes",
      role: "Proprietário",
      content: "Consegui alugar meu imóvel em menos de 2 semanas com a EasyHome. Super recomendo!",
      image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80"
    },
    {
      name: "Julia Costa",
      role: "Investidora",
      content: "Como investidora imobiliária, valorizo muito a eficiência e profissionalismo que a EasyHome oferece.",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80"
    }
  ];

  const stats = [
    { value: "1000+", label: "Imóveis disponíveis" },
    { value: "500+", label: "Clientes satisfeitos" },
    { value: "95%", label: "Taxa de satisfação" },
    { value: "10+", label: "Anos de experiência" }
  ];

  return (
    <div>
      <Hero />
      
      {/* Featured Properties */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Imóveis em Destaque</h2>
              <p className="text-gray-600">Confira nossos imóveis mais populares</p>
            </div>
            <Button 
              asChild
              variant="outline" 
              className="text-orange-500 border-orange-500 hover:bg-orange-50"
            >
              <Link to="/imoveis">
                Ver todos
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProperties.map((property) => (
              <Link to={`/imoveis/${property.id}`} key={property.id} className="block transition-transform hover:scale-[1.02]">
                <PropertyCard key={property.id} {...property} />
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      {/* Why Choose Us */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">Por que escolher a EasyHome?</h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
            Somos especialistas em tornar o processo de compra, venda e aluguel de imóveis simples e transparente
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 text-orange-500 mb-4">
                <ThumbsUp className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Atendimento de Qualidade</h3>
              <p className="text-gray-600">Profissionais qualificados à disposição para atender suas necessidades</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 text-orange-500 mb-4">
                <Clock className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Agilidade</h3>
              <p className="text-gray-600">Processos rápidos e eficientes para economizar seu tempo</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 text-orange-500 mb-4">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Confiança</h3>
              <p className="text-gray-600">Segurança jurídica em todas as transações imobiliárias</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 text-orange-500 mb-4">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Garantia</h3>
              <p className="text-gray-600">Todas as transações são feitas com transparência e segurança</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Statistics */}
      <section className="py-16 px-4 bg-orange-500 text-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Services */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">Nossos Serviços</h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
            Prestamos serviços completos para atender todas as suas necessidades imobiliárias
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div 
                key={index} 
                className="bg-white p-6 rounded-lg shadow-md text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 text-orange-500 mb-4">
                  <service.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">O que nossos clientes dizem</h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
            Veja depoimentos de pessoas que já realizaram suas conquistas imobiliárias com a gente
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src={testimonial.image} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-gray-500 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Schedule a Visit */}
      <section className="py-16 px-4 bg-gray-900 text-white">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h2 className="text-3xl font-bold mb-4">Agende uma visita com nossos corretores</h2>
              <p className="opacity-80 mb-6">
                Nossos especialistas estão prontos para encontrar o imóvel ideal para você e sua família. Agende uma consulta gratuita.
              </p>
              <Button className="bg-orange-500 hover:bg-orange-600">
                <CalendarCheck className="h-4 w-4 mr-2" />
                Agendar Visita
              </Button>
            </div>
            <div className="md:w-1/3 bg-white text-gray-800 rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-4 text-center">Fale Conosco</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-orange-500 mr-3" />
                  <span>(11) 9999-9999</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-orange-500 mr-3" />
                  <span>contato@easyhome.com.br</span>
                </div>
                <Button className="w-full bg-orange-500 hover:bg-orange-600">
                  Enviar Mensagem
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-16 px-4 bg-orange-500 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Pronto para encontrar seu novo lar?</h2>
          <p className="max-w-2xl mx-auto mb-8 opacity-90">
            Fale com nossos especialistas e encontre o imóvel ideal para você e sua família
          </p>
          <Button 
            asChild
            variant="outline" 
            className="bg-white text-orange-500 hover:bg-gray-100"
          >
            <Link to="/contato">Entre em contato</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;
