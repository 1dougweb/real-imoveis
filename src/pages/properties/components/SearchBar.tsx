
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
} from "@/components/ui/sheet";
import FilterSheet from "./FilterSheet";

const SearchBar = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Buscar por localização..."
            className="pl-10"
          />
          <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
        </div>
        
        <Select defaultValue="all">
          <SelectTrigger>
            <SelectValue placeholder="Tipo de Transação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="sale">Venda</SelectItem>
            <SelectItem value="rent">Aluguel</SelectItem>
          </SelectContent>
        </Select>
        
        <Select defaultValue="all">
          <SelectTrigger>
            <SelectValue placeholder="Tipo de Imóvel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="apartment">Apartamento</SelectItem>
            <SelectItem value="house">Casa</SelectItem>
            <SelectItem value="commercial">Comercial</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="flex gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 w-full">
                <SlidersHorizontal className="h-4 w-4" />
                Filtros avançados
              </Button>
            </SheetTrigger>
            <FilterSheet />
          </Sheet>
        </div>
      </div>
      
      <Button className="w-full md:w-auto bg-orange-500 hover:bg-orange-600">
        Buscar
      </Button>
    </div>
  );
};

export default SearchBar;
