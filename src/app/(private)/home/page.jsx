// src/app/page.jsx
'use client';
import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/app/firebase/config';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import Image from 'next/image';

export default function Home() {
  const [user, loadingAuth] = useAuthState(auth); // Estado de autenticação
  const [userData, setUserData] = useState(null); // Dados do Firestore
  const [loadingData, setLoadingData] = useState(true); // Carregamento dos dados
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  // Marca o componente como montado
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Busca os dados do usuário no Firestore
  useEffect(() => {
    if (isMounted && user) {
      const fetchUserData = async () => {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          } else {
            console.log('Nenhum dado encontrado para este usuário.');
          }
        } catch (e) {
          console.error('Erro ao buscar dados do usuário:', e.message);
        } finally {
          setLoadingData(false);
        }
      };
      fetchUserData();
    }
  }, [user, isMounted]);

  // Redireciona se não autenticado
  useEffect(() => {
    if (isMounted && !loadingAuth && !user) {
      router.push('/login'); // Ajuste para '/login' ou '/signin' conforme sua rota
    }
  }, [user, loadingAuth, isMounted, router]);

  // Mostra carregamento enquanto verifica autenticação ou dados
  if (loadingAuth || !isMounted || (user && loadingData)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-800">
        <div className="flex items-center gap-2 text-white">
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Carregando...
        </div>
      </div>
    );
  }

  // Renderiza a página apenas se autenticado
  if (user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-800 text-white">
        <div className="p-10 rounded-lg shadow-xl w-96 bg-gray-700">
          <h1 className="text-2xl font-bold text-center mb-6">Bem-vindo(a)!</h1>
          {userData ? (
            <div className="text-center mb-4 space-y-2">
              <p>
                Nome: <span className="font-semibold">{userData.name}</span>
              </p>
            </div>
          ) : (
            <p className="text-center mb-4">Nenhum dado adicional encontrado.</p>
          )}
          <div className="flex justify-center mb-6">
            <Image
              src="/next.svg" // Substitua por uma imagem sua, se quiser
              alt="Logo"
              width={180}
              height={38}
              className="dark:invert"
            />
          </div>
          <button
            onClick={() => {
              auth.signOut(); // Logout
              sessionStorage.removeItem('user');
              router.push('/login'); // Ajuste para '/login' ou '/signin'
            }}
            className="w-full p-3 bg-indigo-600 rounded text-white hover:bg-indigo-500 transition-colors"
          >
            Sair
          </button>
        </div>
      </div>
    );
  }

  return null;
}