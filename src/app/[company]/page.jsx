import { db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { notFound } from "next/navigation";


// Função auxiliar para buscar os dados da empresa
async function fetchCompanyData(company) {
  const docRef = doc(db, "company", company);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return docSnap.data().dados;
}

// Geração de metadados
export async function generateMetadata({ params }) {
  const resolvedParams = await params; // Aguarda a resolução do params
  const company = resolvedParams.company;
  const dados = await fetchCompanyData(company);

  if (!dados) {
    return { title: "Quadra não encontrada" };
  }

  return {
    title: `${dados.nome}`,
    description: `Aluguel de quadras esportivas na ${dados.nome} - ${dados.config.endereco}`,
  };
}

// Componente principal
export default async function QuadraHome({ params }) {
  const resolvedParams = await params; // Aguarda a resolução do params
  const company = resolvedParams.company;
  const config = await fetchCompanyData(company);

  if (!config) {
    notFound();
  }

  return (
    <div 
      className="min-h-screen flex flex-col justify-between" 
      style={{ backgroundColor: config.config.corPrimaria || "#FFFFFF"}}
    >
      {/* Header */}
      <header className="text-center py-10 px-4 text-white">
        <img 
          src={config.config.logoUrl} 
          alt={`Logo ${config.nome}`} 
          className="max-w-[150px] mx-auto mb-6"
        />
        <h1 className="text-4xl md:text-5xl font-bold mb-2">
          Bem-vindo à {config.nome}
        </h1>
        <p className="text-lg md:text-xl opacity-90">
          A melhor opção para alugar quadras esportivas em {config.config.endereco}
        </p>
      </header>

      {/* Seção de Informações */}
      <section className="py-10 px-4 text-center bg-white/10 text-white">
        <h2 className="text-3xl font-semibold mb-6">
          Por que escolher a {config.nome}?
        </h2>
        <ul className="space-y-4 text-lg">
          <li>Quadras de alta qualidade</li>
          <li>Duração flexível: {config.config.duracaoAluguel}</li>
          <li>Localização: {config.config.endereco}</li>
          <li>Agendamento fácil e rápido</li>
        </ul>
      </section>

      {/* Seção de Atividades */}
      <section className="py-10 px-4 text-center text-white">
        <h2 className="text-3xl font-semibold mb-6">Atividades Disponíveis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {config.config.atividades && config.config.atividades.length > 0 ? (
            config.config.atividades.map((atividade, index) => (
              <div 
                key={index} 
                className="bg-white/20 p-6 rounded-lg shadow-md hover:bg-white/30 transition-colors"
              >
                <h3 className="text-xl font-medium">{atividade.nome}</h3>
                <p className="mt-2">{atividade.descricao}</p>
              </div>
            ))
          ) : (
            <p className="text-lg">Nenhuma atividade cadastrada no momento.</p>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-10 px-4 text-center">
        <h2 className="text-3xl font-semibold text-white mb-6">
          Reserve sua quadra agora!
        </h2>
        <div className="flex justify-center gap-6">
          <a 
            href={`/${company}/agendamento`}
            className="px-8 py-4 text-white text-lg font-medium rounded-md hover:opacity-90 transition-opacity"
            style={{ backgroundColor: config.config.corSecundaria || "#28a745" }}
          >
            Fazer Agendamento
          </a>
          <a 
            href={`/${company}/dashboard`}
            className="px-8 py-4 bg-gray-500 text-white text-lg font-medium rounded-md hover:opacity-90 transition-opacity"
          >
            Ver Dashboard
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 bg-black/20 text-white text-sm">
        <p>© 2025 {config.nome}. Todos os direitos reservados.</p>
        <p>Endereço: {config.config.endereco}</p>
      </footer>
    </div>
  );
}