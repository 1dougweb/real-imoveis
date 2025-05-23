
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const FilterSheet = () => {
  // Features for advanced filtering
  const amenities = [
    { id: "pool", label: "Piscina" },
    { id: "gym", label: "Academia" },
    { id: "garage", label: "Garagem" },
    { id: "elevator", label: "Elevador" },
    { id: "security", label: "Segurança 24h" },
    { id: "playground", label: "Playground" },
    { id: "furnished", label: "Mobiliado" },
    { id: "petfriendly", label: "Pet Friendly" },
  ];
  
  return (
    <SheetContent className="overflow-y-auto">
      <SheetHeader>
        <SheetTitle>Filtros avançados</SheetTitle>
        <SheetDescription>
          Refine sua busca usando os filtros abaixo
        </SheetDescription>
      </SheetHeader>
      
      <div className="py-4">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>Faixa de Preço</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div>
                  <Label>Venda</Label>
                  <div className="pt-6 pb-2">
                    <Slider defaultValue={[0, 2000000]} min={0} max={5000000} step={50000} />
                    <div className="flex justify-between mt-2">
                      <span className="text-sm text-gray-500">R$0</span>
                      <span className="text-sm text-gray-500">R$5M+</span>
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Aluguel</Label>
                  <div className="pt-6 pb-2">
                    <Slider defaultValue={[0, 10000]} min={0} max={20000} step={500} />
                    <div className="flex justify-between mt-2">
                      <span className="text-sm text-gray-500">R$0</span>
                      <span className="text-sm text-gray-500">R$20K+</span>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-2">
            <AccordionTrigger>Quartos & Banheiros</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bedrooms">Quartos</Label>
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {[1, 2, 3, 4, "5+"].map((num) => (
                      <Button 
                        key={num} 
                        variant="outline" 
                        className="h-9 px-0"
                      >
                        {num}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="bathrooms">Banheiros</Label>
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {[1, 2, 3, 4, "5+"].map((num) => (
                      <Button 
                        key={num} 
                        variant="outline" 
                        className="h-9 px-0"
                      >
                        {num}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-3">
            <AccordionTrigger>Área</AccordionTrigger>
            <AccordionContent>
              <div className="pt-2 pb-4">
                <div className="pt-4 pb-2">
                  <Slider defaultValue={[0, 300]} min={0} max={500} step={10} />
                  <div className="flex justify-between mt-2">
                    <span className="text-sm text-gray-500">0m²</span>
                    <span className="text-sm text-gray-500">500m²+</span>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-4">
            <AccordionTrigger>Comodidades</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 gap-2 pt-2">
                {amenities.map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox id={item.id} />
                    <Label htmlFor={item.id}>{item.label}</Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      
      <div className="flex flex-col gap-2 mt-4">
        <Button className="w-full bg-orange-500 hover:bg-orange-600">
          Aplicar filtros
        </Button>
        <Button variant="outline" className="w-full">
          Limpar filtros
        </Button>
      </div>
    </SheetContent>
  );
};

export default FilterSheet;
