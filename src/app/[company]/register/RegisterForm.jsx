"use client";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/config";
import { db } from "../../firebase/config";
import { doc, setDoc } from "firebase/firestore";
import { useState } from "react";

export default function RegisterForm({ company, config }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [error, setError] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Salvar dados do usuário com level 0 por padrão
      await setDoc(doc(db, "company", company, "users", user.uid), {
        email: email,
        nome: nome,
        telefone: telefone,
        level: 0, // Usuário comum por padrão
      });

      window.location.href = `/${company}/agendamento`;
    } catch (err) {
      setError("Erro ao registrar. Tente novamente.");
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <input
        type="text"
        placeholder="Nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        className="w-full p-3 rounded-md bg-white/20 text-white placeholder-white/70"
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-3 rounded-md bg-white/20 text-white placeholder-white/70"
      />
      <input
        type="tel"
        placeholder="Telefone"
        value={telefone}
        onChange={(e) => setTelefone(e.target.value)}
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
        Registrar
      </button>
      <p className="text-center">
        Já tem conta?{" "}
        <a href={`/${company}/login`} className="underline">
          Faça login
        </a>
      </p>
    </form>
  );
}