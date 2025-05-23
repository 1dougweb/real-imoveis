
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

interface MobileFilterToggleProps {
  showFilters: boolean;
  setShowFilters: React.Dispatch<React.SetStateAction<boolean>>;
}

const MobileFilterToggle = ({ showFilters, setShowFilters }: MobileFilterToggleProps) => {
  return (
    <div className="lg:hidden mb-4">
      <Button 
        onClick={() => setShowFilters(!showFilters)} 
        variant="outline"
        className="w-full flex items-center justify-center"
      >
        <Filter className="h-4 w-4 mr-2" />
        {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
      </Button>
    </div>
  );
};

export default MobileFilterToggle;
