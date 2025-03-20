export default function Pricing() {
  const plans = [
    { name: "Básico", price: "R$ 99/mês", features: ["Agendamento Online", "Gestão de 1 Quadra"] },
    { name: "Profissional", price: "R$ 199/mês", features: ["Agendamento Online", "Gestão de até 5 Quadras", "Pagamentos Integrados"] },
    { name: "Premium", price: "R$ 299/mês", features: ["Agendamento Online", "Gestão Ilimitada", "Pagamentos Integrados", "Relatórios Detalhados"] },
  ];

  return (
    <section id="pricing" className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">Planos e Preços</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <div key={index} className={`bg-white p-6 rounded-lg shadow-lg text-center hover:shadow-xl transition-shadow duration-300 flex flex-col ${plan.name === "Profissional" ? "border-2 border-blue-600" : ""}`}>
              {plan.name === "Profissional" && (
                <h1 className="bg-yellow-400 text-white font-bold px-3 py-1 rounded-full mb-4 inline-block">
                  Recomendado
                </h1>
              )}
              <h3 className="text-xl md:text-2xl font-bold mb-4">{plan.name}</h3>
              <p className="text-gray-600 mb-4">Ideal para {plan.name === "Básico" ? "pequenos negócios" : plan.name === "Profissional" ? "negócios em crescimento" : "grandes empresas"}</p>
              <p className="text-lg md:text-xl font-bold mb-4">{plan.price}</p>
              <ul className="mb-6 flex-grow">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="mb-2 text-sm md:text-base flex items-center">
                    <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <a href="#contact" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 text-sm md:text-base mt-auto">
                Assinar
              </a>
            </div>
          ))}
        </div>
        {/* <div className="text-center mt-8">
          <a href="#comparison" className="text-blue-600 hover:underline">Comparar Planos</a>
        </div> */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <p>Sem taxas ocultas. Cancelamento a qualquer momento.</p>
        </div>
      </div>
    </section>
  );
}