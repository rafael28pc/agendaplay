"use client";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/config";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm({ company, config }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push(`/${company}/agendamento`); // Redireciona após login
    } catch (err) {
      setError("Erro ao fazer login. Verifique suas credenciais.");
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-3 rounded-md bg-white/20 text-white placeholder-white/70"
      />
      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-3 rounded-md bg-white/20 text-white placeholder-white/70"
      />
      {error && <p className="text-red-500">{error}</p>}
      <button
        type="submit"
        className="w-full py-3 rounded-md text-white font-medium"
        style={{ backgroundColor: config.config.corSecundaria || "#28a745" }}
      >
        Entrar
      </button>
      <p className="text-center">
        Não tem conta?{" "}
        <a href={`/${company}/register`} className="underline">
          Registre-se
        </a>
      </p>
    </form>
  );
}