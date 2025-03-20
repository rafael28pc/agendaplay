'use client'
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function Hero() {
  const [currentImage, setCurrentImage] = useState(0);

  const images = [
    {
      src: 'https://images.unsplash.com/photo-1552667466-07770ae110d0?q=80&w=2070&auto=format&fit=crop',
      alt: 'Quadra de tênis moderna com iluminação profissional',
    },
    {
      src: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=2070&auto=format&fit=crop',
      alt: 'Campo de futebol com gramado verde e arquibancadas lotadas',
    },
    {
      src: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop',
      alt: 'Painel de gestão moderno com gráficos e indicadores de desempenho',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [images.length]);

  const goToNextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const goToPrevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-30 md:py-30 relative overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 text-center relative z-10 space-y-8">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
          Transforme a Gestão do Seu Centro Esportivo
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">
        Não perca a hora do seu jogo! Gerencie suas quadras, agendamentos e finanças de forma simples e eficiente. <strong className='text-black'>AGENDA</strong> o <strong className='text-black'>PLAY</strong>!
        </p>
        <div className="flex justify-center gap-6 flex-wrap">
          <a
            href="#pricing"
            className="bg-blue-500 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-blue-600 transition-colors duration-300 flex items-center gap-2"
          >
            <span>Comece já</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
            </svg>
          </a>
          <a
            href="#features"
            className="border border-blue-500 text-blue-500 px-8 py-3 rounded-md text-lg font-medium hover:bg-blue-500 hover:text-white transition-colors duration-300 flex items-center gap-2"
          >
            <span>Conheça agora</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </div>

      <div className="mt-16 max-w-5xl mx-auto px-6 md:px-12">
        <div className="relative group">
          <div className="absolute inset-0 bg-black/30 rounded-lg"></div>
          <Image
            src={images[currentImage].src}
            width={1200}
            height={600}
            alt={images[currentImage].alt}
            className="rounded-lg shadow-2xl object-cover w-full h-[300px] md:h-[450px] transition-opacity duration-500"
            priority
          />
          <button
            onClick={goToPrevImage}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/50 p-2 rounded-full hover:bg-white/80 transition-colors duration-300 opacity-0 group-hover:opacity-100"
            aria-label="Imagem anterior"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToNextImage}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/50 p-2 rounded-full hover:bg-white/80 transition-colors duration-300 opacity-0 group-hover:opacity-100"
            aria-label="Próxima imagem"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  currentImage === index ? 'bg-blue-500 scale-125' : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Ir para a imagem ${index + 1}`}
              ></button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}