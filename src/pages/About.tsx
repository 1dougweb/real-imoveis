
import { Building, Award, Users, Heart } from "lucide-react";

const About = () => {
  const stats = [
    { label: "Anos no mercado", value: "15+" },
    { label: "Imóveis vendidos", value: "10,000+" },
    { label: "Clientes satisfeitos", value: "8,500+" },
    { label: "Agentes imobiliários", value: "50+" },
  ];

  const values = [
    {
      icon: Building,
      title: "Excelência",
      description: "Buscamos a excelência em tudo o que fazemos, desde a seleção dos imóveis até o atendimento ao cliente."
    },
    {
      icon: Award,
      title: "Integridade",
      description: "Agimos com honestidade e transparência em todas as nossas negociações e relacionamentos."
    },
    {
      icon: Users,
      title: "Compromisso",
      description: "Estamos comprometidos em oferecer o melhor serviço e encontrar a solução ideal para cada cliente."
    },
    {
      icon: Heart,
      title: "Respeito",
      description: "Valorizamos e respeitamos cada cliente, parceiro e colaborador em nossa jornada."
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gray-100 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Sobre a EasyHome
            </h1>
            <p className="text-lg md:text-xl text-gray-600">
              Somos uma imobiliária com 15 anos de experiência, dedicada a ajudar
              nossos clientes a encontrar o imóvel perfeito e realizar grandes negócios.
            </p>
          </div>
        </div>
      </div>

      {/* Story Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <img
                src="https://images.unsplash.com/photo-1577415124269-fc1140a69e91?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Equipe EasyHome"
                className="rounded-lg shadow-xl"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Nossa História</h2>
              <p className="text-gray-600 mb-4">
                A EasyHome nasceu em 2010 com a missão de transformar a experiência de comprar, vender e alugar imóveis no Brasil. 
                Fundada pelos irmãos Carlos e Ana Silva, a empresa começou como uma pequena operação em São Paulo e rapidamente 
                se expandiu para outras cidades.
              </p>
              <p className="text-gray-600 mb-4">
                Nossa abordagem inovadora e foco no cliente nos permitiu crescer e nos estabelecer como uma das 
                líderes do setor imobiliário. Investimos constantemente em tecnologia e treinamento para oferecer um 
                serviço excepcional.
              </p>
              <p className="text-gray-600">
                Hoje, contamos com mais de 50 agentes imobiliários especializados e temos orgulho de ter ajudado 
                milhares de brasileiros a encontrar o lugar perfeito para chamar de lar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-orange-500 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="p-6">
                <p className="text-4xl md:text-5xl font-bold mb-2">{stat.value}</p>
                <p className="text-lg opacity-90">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Nossos Valores</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Nossos valores fundamentais guiam tudo o que fazemos e como interagimos com nossos clientes e parceiros.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 text-orange-500 mb-4">
                  <value.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Nossa Equipe</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Conheça alguns dos profissionais que fazem a EasyHome ser referência no mercado imobiliário.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Carlos Silva",
                role: "CEO & Fundador",
                image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
              },
              {
                name: "Ana Silva",
                role: "Diretora de Operações",
                image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
              },
              {
                name: "Roberto Santos",
                role: "Gerente de Vendas",
                image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
              }
            ].map((member, index) => (
              <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md">
                <img src={member.image} alt={member.name} className="w-full h-64 object-cover" />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-gray-600">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
