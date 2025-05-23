import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">EasyHome</h3>
            <p className="text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base">
              Encontre o imóvel dos seus sonhos com a nossa ajuda. Estamos no mercado há mais de 15 anos.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                <Facebook size={18} className="sm:w-5 sm:h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                <Instagram size={18} className="sm:w-5 sm:h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                <Twitter size={18} className="sm:w-5 sm:h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Links Rápidos</h3>
            <ul className="space-y-1 sm:space-y-2 text-sm sm:text-base">
              <li>
                <Link to="/" className="text-gray-400 hover:text-orange-500 transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/imoveis" className="text-gray-400 hover:text-orange-500 transition-colors">Imóveis</Link>
              </li>
              <li>
                <Link to="/sobre" className="text-gray-400 hover:text-orange-500 transition-colors">Sobre</Link>
              </li>
              <li>
                <Link to="/contato" className="text-gray-400 hover:text-orange-500 transition-colors">Contato</Link>
              </li>
            </ul>
          </div>
          
          <div className="xs:col-span-2 md:col-span-1">
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Serviços</h3>
            <ul className="space-y-1 sm:space-y-2 text-sm sm:text-base">
              <li>
                <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Comprar</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Alugar</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Vender</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Avaliação</a>
              </li>
            </ul>
          </div>
          
          <div className="xs:col-span-2 md:col-span-1">
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Contato</h3>
            <ul className="space-y-2 sm:space-y-4 text-sm sm:text-base">
              <li className="flex items-start">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500 mr-2 mt-0.5" />
                <span className="text-gray-400">Av. Paulista, 1578, São Paulo - SP</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500 mr-2" />
                <span className="text-gray-400">(11) 3456-7890</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500 mr-2" />
                <span className="text-gray-400">contato@easyhome.com.br</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 md:mt-12 pt-6 md:pt-8 text-center text-gray-400 text-xs sm:text-sm">
          <p>&copy; {new Date().getFullYear()} EasyHome Imobiliária. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
