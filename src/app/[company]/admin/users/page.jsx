"use client";

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../../../firebase/config";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import Link from "next/link";
import React from "react";

export default function UsersPage({ params, config, users: initialUsers }) {
  const resolvedParams = React.use(params);
  const company = resolvedParams.company;
  const [userLevel, setUserLevel] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUserLevel(-1);
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "company", company, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserLevel(userSnap.data().level || 0);
        } else {
          setUserLevel(0);
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        setUserLevel(0);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [company]);

  if (loading) return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  if (userLevel === -1) return <div className="flex items-center justify-center min-h-screen">Acesso negado. Faça login para continuar.</div>;
  if (userLevel !== 1) return <div className="flex items-center justify-center min-h-screen">Acesso negado. Apenas administradores podem acessar esta página.</div>;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-6 fixed h-full">
        <h2 className="text-2xl font-bold mb-8">Dashboard</h2>
        <nav>
          <ul className="space-y-4">
            <li><Link href={`/${company}/admin`} className="block p-2 rounded hover:bg-gray-700">Visão Geral</Link></li>
            <li><Link href={`/${company}/admin/courts`} className="block p-2 rounded hover:bg-gray-700">Quadras</Link></li>
            <li><Link href={`/${company}/admin/bookings`} className="block p-2 rounded hover:bg-gray-700">Agendamentos</Link></li>
            <li><Link href={`/${company}/admin/users`} className="block p-2 rounded hover:bg-gray-700">Usuários</Link></li>
          </ul>
        </nav>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 ml-64 p-8">
        <h1 className="text-3xl font-semibold mb-6">Usuários - {config?.nome || "Nome não disponível"}</h1>
        <div className="card">
          <h2 className="text-xl font-medium mb-4">Usuários Registrados</h2>
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {initialUsers && initialUsers.length > 0 ? (
              initialUsers.map((user) => (
                <div key={user.id} className="p-4 border rounded-md">
                  <p><strong>Nome:</strong> {user.nome || "Sem nome"}</p>
                  <p><strong>Email:</strong> {user.email || "Sem email"}</p>
                  <p><strong>Telefone:</strong> {user.telefone || "Sem telefone"}</p>
                  <p><strong>Nível:</strong> {user.level === 1 ? "Administrador" : "Usuário"}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Nenhum usuário registrado ainda.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}