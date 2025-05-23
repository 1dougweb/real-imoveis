
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FilterSidebar = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-6">Filtros</h2>
      
      <div className="space-y-6">
        {/* Type Filter */}
        <div>
          <Label htmlFor="type">Tipo de Imóvel</Label>
          <Select>
            <SelectTrigger id="type">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="apartment">Apartamento</SelectItem>
              <SelectItem value="house">Casa</SelectItem>
              <SelectItem value="commercial">Comercial</SelectItem>
              <SelectItem value="land">Terreno</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Transaction Type */}
        <div>
          <Label htmlFor="transaction">Tipo de Transação</Label>
          <Select>
            <SelectTrigger id="transaction">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="sale">Venda</SelectItem>
              <SelectItem value="rent">Aluguel</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Price Range */}
        <div>
          <Label>Faixa de Preço</Label>
          <div className="mt-4">
            <Slider defaultValue={[0, 1000000]} min={0} max={2000000} step={10000} />
            <div className="flex justify-between mt-2">
              <span className="text-sm text-gray-500">R$0</span>
              <span className="text-sm text-gray-500">R$2M+</span>
            </div>
          </div>
        </div>
        
        {/* Bedrooms */}
        <div>
          <Label htmlFor="bedrooms">Quartos</Label>
          <Select>
            <SelectTrigger id="bedrooms">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Qualquer</SelectItem>
              <SelectItem value="1">1+</SelectItem>
              <SelectItem value="2">2+</SelectItem>
              <SelectItem value="3">3+</SelectItem>
              <SelectItem value="4">4+</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Location */}
        <div>
          <Label htmlFor="location">Localização</Label>
          <Input id="location" placeholder="Cidade, bairro..." />
        </div>
        
        <Button className="w-full bg-orange-500 hover:bg-orange-600">
          Aplicar Filtros
        </Button>
      </div>
    </div>
  );
};

export default FilterSidebar;
