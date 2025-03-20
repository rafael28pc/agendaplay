// components/SignIn.jsx (Client Component)
'use client';
import { useState } from 'react';
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth } from '@/app/firebase/config';
import { useRouter } from 'next/navigation';
import Home2 from '../../(private)/home/page';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Estado de carregamento
  const [signInWithEmailAndPassword] = useSignInWithEmailAndPassword(auth);
  const router = useRouter();

  const handleSignIn = async () => {
    setLoading(true); // Inicia o estado de carregamento
    try {
      const res = await signInWithEmailAndPassword(email, password);
      console.log({ res });
      if (res?.user) {
        sessionStorage.setItem('user', true);
        setEmail('');
        setPassword('');
        router.push('/home'); 
      }
    } catch (e) {
      console.error('Erro:', e.message);
      alert(`Erro: ${e.message}`); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-800">
      <div className="p-10 rounded-lg shadow-xl w-96">
        <h1 className="text-white text-2xl mb-5 text-center">Entrar</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
          disabled={loading} // Desabilita enquanto carrega
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
          disabled={loading} // Desabilita enquanto carrega
          required
        />
        <button
          onClick={handleSignIn}
          className={`w-full p-3 bg-indigo-600 rounded text-white hover:bg-indigo-500 transition-colors ${
            loading ? 'animate-pulse opacity-75 cursor-not-allowed' : ''
          }`}
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
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
            </span>
          ) : (
            'Entrar'
          )}
        </button>
      </div>
    </div>
  );
};

export default SignIn;