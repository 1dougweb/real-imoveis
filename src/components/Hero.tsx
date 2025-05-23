
import { useState } from "react";
import { Search, Home as HomeIcon, Building, MapPin, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { 
  Form,
  FormControl, 
  FormField,
  FormItem,
  FormLabel
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

const Hero = () => {
  const [searchType, setSearchType] = useState<'comprar' | 'alugar'>('comprar');
  
  const form = useForm({
    defaultValues: {
      priceRange: [500000],
      bedrooms: "",
      bathrooms: "",
      area: "",
      features: []
    }
  });
  
  return (
    <div className="relative bg-gray-900 text-white">
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/60 z-10" />
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80')",
          zIndex: -1
        }}
      />
      
      <div className="container mx-auto px-4 py-24 md:py-36 relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Encontre o lugar perfeito para chamar de seu
          </h1>
          <p className="text-lg md:text-xl opacity-90 mb-8">
            Descubra centenas de imóveis à venda e para aluguel em todo o Brasil 
            com a EasyHome, sua imobiliária de confiança
          </p>
          
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg">
            <div className="flex space-x-4 mb-4">
              <Button
                type="button"
                onClick={() => setSearchType('comprar')}
                variant={searchType === 'comprar' ? 'default' : 'outline'}
                className={searchType === 'comprar' ? 'bg-orange-500 hover:bg-orange-600' : ''}
              >
                Comprar
              </Button>
              <Button
                type="button"
                onClick={() => setSearchType('alugar')}
                variant={searchType === 'alugar' ? 'default' : 'outline'}
                className={searchType === 'alugar' ? 'bg-orange-500 hover:bg-orange-600' : ''}
              >
                Alugar
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center border rounded-md pl-3 bg-white">
                <MapPin className="h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por cidade, bairro ou endereço..."
                  className="w-full px-3 py-2 border-0 focus:outline-none focus:ring-0"
                />
              </div>
              
              <Select defaultValue="all">
                <SelectTrigger className="pl-3">
                  <div className="flex items-center">
                    <Building className="h-5 w-5 text-gray-400 mr-2" />
                    <SelectValue placeholder="Tipo de Imóvel" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="apartment">Apartamento</SelectItem>
                  <SelectItem value="house">Casa</SelectItem>
                  <SelectItem value="commercial">Comercial</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="text-orange-500 border-orange-500 mr-2 flex-grow">
                      <Filter className="h-4 w-4 mr-2" />
                      Filtros
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Filtros Avançados</SheetTitle>
                    </SheetHeader>
                    <Form {...form}>
                      <div className="space-y-6 py-4">
                        <FormField
                          control={form.control}
                          name="priceRange"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Faixa de Preço</FormLabel>
                              <FormControl>
                                <div className="space-y-2">
                                  <Slider
                                    defaultValue={[500000]}
                                    max={5000000}
                                    step={50000}
                                    className="py-4"
                                    onValueChange={field.onChange}
                                  />
                                  <div className="text-right font-medium text-gray-700">
                                    Até R$ {field.value[0].toLocaleString('pt-BR')}
                                  </div>
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="bedrooms"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Quartos</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="1">1+</SelectItem>
                                    <SelectItem value="2">2+</SelectItem>
                                    <SelectItem value="3">3+</SelectItem>
                                    <SelectItem value="4">4+</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="bathrooms"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Banheiros</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="1">1+</SelectItem>
                                    <SelectItem value="2">2+</SelectItem>
                                    <SelectItem value="3">3+</SelectItem>
                                    <SelectItem value="4">4+</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="area"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Área (m²)</FormLabel>
                              <FormControl>
                                <Input placeholder="Área mínima" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <div>
                          <h3 className="text-sm font-medium mb-3">Comodidades</h3>
                          <div className="grid grid-cols-2 gap-2">
                            {['Piscina', 'Academia', 'Churrasqueira', 'Segurança 24h', 'Garagem', 'Área de lazer'].map((feature) => (
                              <div className="flex items-center space-x-2" key={feature}>
                                <Checkbox id={feature} />
                                <label htmlFor={feature} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                  {feature}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="mt-6">
                        <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600">
                          Aplicar Filtros
                        </Button>
                      </div>
                    </Form>
                  </SheetContent>
                </Sheet>
                
                <Button className="bg-orange-500 hover:bg-orange-600 flex-grow">
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
