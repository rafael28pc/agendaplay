"use client";

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../../firebase/config";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import Link from "next/link";
import React from "react";
import {
  ChartBarIcon,
  CalendarIcon,
  UserGroupIcon,
  BanknotesIcon, // Ícone atualizado
} from "@heroicons/react/24/outline"; // Caminho correto para os ícones

export default function AdminDashboard({ params, config, users }) {
  const company = params.company;
  const [userLevel, setUserLevel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courts, setCourts] = useState([]);
  const [bookings, setBookings] = useState([]);
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

        const courtsRef = collection(db, "company", company, "courts");
        const courtsSnap = await getDocs(courtsRef);
        const courtsData = courtsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setCourts(courtsData.length ? courtsData : []);

        const bookingsRef = collection(db, "company", company, "bookings");
        const bookingsSnap = await getDocs(bookingsRef);
        const bookingsData = bookingsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setBookings(bookingsData.length ? bookingsData : []);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        setUserLevel(0);
        setCourts([]);
        setBookings([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [company]);

  const totalRevenue = bookings.reduce((sum, booking) => {
    const court = courts.find((c) => c.id === booking.courtId);
    return sum + (court?.precoPorHora || 0);
  }, 0);

  if (loading) return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  if (userLevel === -1) return <div className="flex items-center justify-center min-h-screen">Acesso negado. Faça login para continuar.</div>;
  if (userLevel !== 1) return <div className="flex items-center justify-center min-h-screen">Acesso negado. Apenas administradores podem acessar esta página.</div>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6 fixed h-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h2>
        <nav>
          <ul className="space-y-3">
            <li>
              <Link
                href={`/${company}/admin`}
                className="flex items-center p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-200"
              >
                <ChartBarIcon className="w-5 h-5 mr-3" />
                Visão Geral
              </Link>
            </li>
            <li>
              <Link
                href={`/${company}/admin/courts`}
                className="flex items-center p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-200"
              >
                <CalendarIcon className="w-5 h-5 mr-3" />
                Quadras
              </Link>
            </li>
            <li>
              <Link
                href={`/${company}/admin/bookings`}
                className="flex items-center p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-200"
              >
                <UserGroupIcon className="w-5 h-5 mr-3" />
                Agendamentos
              </Link>
            </li>
            <li>
              <Link
                href={`/${company}/admin/users`}
                className="flex items-center p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-200"
              >
                <BanknotesIcon className="w-5 h-5 mr-3" /> {/* Ícone atualizado */}
                Usuários
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 ml-64 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Visão Geral - {config?.nome || "Nome não disponível"}</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card: Total a Receber */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Total a Receber</h3>
                <p className="text-2xl font-bold mt-2">R$ {totalRevenue.toFixed(2)}</p>
              </div>
              <BanknotesIcon className="w-10 h-10 opacity-80" /> {/* Ícone atualizado */}
            </div>
            <p className="text-sm mt-2 opacity-90">Baseado em {bookings.length} agendamentos</p>
          </div>

          {/* Card: Quadras Cadastradas */}
          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Quadras Cadastradas</h3>
                <p className="text-2xl font-bold text-gray-800 mt-2">{courts.length}</p>
              </div>
              <CalendarIcon className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          {/* Card: Usuários Registrados */}
          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Usuários Registrados</h3>
                <p className="text-2xl font-bold text-gray-800 mt-2">{users.length}</p>
              </div>
              <UserGroupIcon className="w-10 h-10 text-blue-500" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}