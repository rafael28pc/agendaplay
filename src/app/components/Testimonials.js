export default function Testimonials() {
  const testimonials = [
    { 
      name: "Carlos Silva", 
      quote: "A AgendaPlay revolucionou a gestão do meu clube. Recomendo!", 
      image: "/images/carlos-silva.jpg", 
      rating: 5 
    },
    { 
      name: "Ana Paula", 
      quote: "Fácil de usar e com ótimo suporte. Meus clientes adoraram!", 
      image: "/images/ana-paula.jpg", 
      rating: 5 
    },
    { 
      name: "Roberto Almeida", 
      quote: "Os relatórios me ajudaram a aumentar minhas receitas.", 
      image: "/images/roberto-almeida.jpg", 
      rating: 4 
    },
  ];

  return (
    <section id="testimonials" className="bg-blue-50 py-12 md:py-20" aria-label="Depoimentos de clientes">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">
          O que nossos clientes estão dizendo
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-lg shadow-lg text-center"
            >
              <p className="italic text-base md:text-lg">"{testimonial.quote}"</p>
              <div className="flex justify-center mt-2">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
                ))}
              </div>
              <p className="mt-4 font-bold text-sm md:text-base">- {testimonial.name}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
        </div>
      </div>
    </section>
  );
}