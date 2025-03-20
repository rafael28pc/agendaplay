'use client'
import { useState } from 'react';
import Image from 'next/image';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white text-black p-4 shadow-sm fixed w-full top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Image
          src="/agendaplaynobg.png"
          width={50}
          height={50}
          alt="Logo"
          className="object-contain"
        />

        {/* Ícone do Menu Hambúrguer (Mobile) */}
        <button
          onClick={toggleMenu}
          className="text-gray-800 md:hidden focus:outline-none z-20 relative w-8 h-8"
          aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
        >
          <div className="w-full h-full flex flex-col justify-between p-1.5">
            <span
              className={`bg-gray-800 h-0.5 w-full rounded-full transition-all duration-300 ease-in-out ${
                isMenuOpen ? 'rotate-45 translate-y-2 bg-blue-600' : ''
              }`}
            ></span>
            <span
              className={`bg-gray-800 h-0.5 w-full rounded-full transition-all duration-300 ease-in-out ${
                isMenuOpen ? 'opacity-0 scale-0' : ''
              }`}
            ></span>
            <span
              className={`bg-gray-800 h-0.5 w-full rounded-full transition-all duration-300 ease-in-out ${
                isMenuOpen ? '-rotate-45 -translate-y-2 bg-blue-600' : ''
              }`}
            ></span>
          </div>
        </button>

        {/* Menu de Navegação */}
        <nav
          className={`${
            isMenuOpen
              ? 'max-h-64 opacity-100'
              : 'max-h-0 opacity-0 md:max-h-none md:opacity-100'
          } md:max-h-none md:opacity-100 absolute md:static top-full left-0 w-full md:w-auto bg-white md:bg-transparent shadow-lg md:shadow-none transition-all duration-500 ease-in-out overflow-hidden`}
        >
          <ul className="flex flex-col md:flex-row md:space-x-6 space-y-3 md:space-y-0 p-6 md:p-0">
            <li>
              <a
                onClick={closeMenu} // Corrigido: Passando uma função
                href="#features"
                className="text-gray-800 hover:text-blue-600 text-base font-medium block py-1 md:py-0 transition-colors duration-300"
              >
                Funcionalidades
              </a>
            </li>
            <li>
              <a
                onClick={closeMenu} // Corrigido: Passando uma função
                href="#testimonials"
                className="text-gray-800 hover:text-blue-600 text-base font-medium block py-1 md:py-0 transition-colors duration-300"
              >
                Depoimentos
              </a>
            </li>
            <li>
              <a
                onClick={closeMenu} // Corrigido: Passando uma função
                href="#pricing"
                className="text-gray-800 hover:text-blue-600 text-base font-medium block py-1 md:py-0 transition-colors duration-300"
              >
                Preços
              </a>
            </li>
            <li>
              <a
                onClick={closeMenu} // Corrigido: Passando uma função
                href="#contact"
                className="text-gray-800 hover:text-blue-600 text-base font-medium block py-1 md:py-0 transition-colors duration-300"
              >
                Contato
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}