'use client'
export default function Features() {
  const features = [
    {
      title: 'Agendamento Online',
      description: 'Permita que seus clientes agendem horários online, 24/7.',
      icon: '📅', // ou um ícone SVG personalizado
    },
    {
      title: 'Gestão de Quadras',
      description: 'Controle de disponibilidade e status das quadras em tempo real.',
      icon: '🏟️',
    },
    {
      title: 'Pagamentos Integrados',
      description: 'Receba pagamentos de forma segura e rápida.',
      icon: '💳',
    },
    {
      title: 'Relatórios Detalhados',
      description: 'Acesse relatórios para tomar decisões estratégicas.',
      icon: '📊',
    },
  ];

  return (
    <section id="features" className="bg-gray-50 py-16 md:py-24">
      <div className="container mx-auto px-6 md:px-12 space-y-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
          Funcionalidades
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md text-center space-y-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <span className="text-4xl">{feature.icon}</span>
              <h3 className="text-xl font-semibold text-gray-900">
                {feature.title}
              </h3>
              <p className="text-base text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}