"use client";

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../../../firebase/config";
import { doc, getDoc, collection, getDocs, addDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import Link from "next/link";
import React from "react";

export default function CourtsPage({ params, config }) {
  const resolvedParams = React.use(params);
  const company = resolvedParams.company;
  const [userLevel, setUserLevel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courts, setCourts] = useState([]);
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("");
  const [capacidade, setCapacidade] = useState("");
  const [precoPorHora, setPrecoPorHora] = useState("");
  const [horarios, setHorarios] = useState({
    segunda: { inicio: "", fim: "" },
    terca: { inicio: "", fim: "" },
    quarta: { inicio: "", fim: "" },
    quinta: { inicio: "", fim: "" },
    sexta: { inicio: "", fim: "" },
    sabado: { inicio: "", fim: "" },
    domingo: { inicio: "", fim: "" },
  });
  const auth = getAuth();

  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, "0");
    return `${hour}:00`;
  });

  const generateTimeSlots = (inicio, fim) => {
    if (!inicio || !fim) return [];
    const startHour = parseInt(inicio.split(":")[0]);
    const endHour = parseInt(fim.split(":")[0]);
    if (startHour >= endHour) return [];

    const slots = [];
    for (let i = startHour; i < endHour; i++) {
      const start = `${i.toString().padStart(2, "0")}:00`;
      const end = `${(i + 1).toString().padStart(2, "0")}:00`;
      slots.push(`${start}-${end}`);
    }
    return slots;
  };

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
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        setUserLevel(0);
        setCourts([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [company]);

  const handleAddCourt = async (e) => {
    e.preventDefault();

    const horariosFormatados = {};
    Object.keys(horarios).forEach((dia) => {
      const { inicio, fim } = horarios[dia];
      if (inicio && fim) {
        horariosFormatados[dia] = generateTimeSlots(inicio, fim);
      }
    });

    const courtData = {
      nome,
      tipo,
      capacidade: parseInt(capacidade) || 0,
      precoPorHora: parseFloat(precoPorHora) || 0,
      horarios: horariosFormatados,
    };

    try {
      const courtsRef = collection(db, "company", company, "courts");
      await addDoc(courtsRef, courtData);
      setCourts([...courts, { id: courts.length + 1, ...courtData }]);
      setNome("");
      setTipo("");
      setCapacidade("");
      setPrecoPorHora("");
      setHorarios({
        segunda: { inicio: "", fim: "" },
        terca: { inicio: "", fim: "" },
        quarta: { inicio: "", fim: "" },
        quinta: { inicio: "", fim: "" },
        sexta: { inicio: "", fim: "" },
        sabado: { inicio: "", fim: "" },
        domingo: { inicio: "", fim: "" },
      });
      alert("Quadra adicionada com sucesso!");
    } catch (error) {
      console.error("Erro ao adicionar quadra:", error);
      alert("Erro ao adicionar quadra. Tente novamente.");
    }
  };

  const handleHorarioChange = (dia, field, value) => {
    setHorarios((prev) => ({
      ...prev,
      [dia]: { ...prev[dia], [field]: value },
    }));
  };

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
        <h1 className="text-3xl font-semibold mb-6">Gerenciar Quadras - {config?.nome || "Nome não disponível"}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulário */}
          <div className="card">
            <h2 className="text-xl font-medium mb-4">Adicionar Nova Quadra</h2>
            <form onSubmit={handleAddCourt} className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium">Nome da Quadra</label>
                <input
                  type="text"
                  placeholder="Ex.: Quadra 1"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Tipo de Quadra</label>
                <input
                  type="text"
                  placeholder="Ex.: Futebol, Vôlei"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Capacidade (nº de pessoas)</label>
                <input
                  type="number"
                  placeholder="Ex.: 10"
                  value={capacidade}
                  onChange={(e) => setCapacidade(e.target.value)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Preço por Hora (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ex.: 100.00"
                  value={precoPorHora}
                  onChange={(e) => setPrecoPorHora(e.target.value)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Horários de Funcionamento</label>
                {["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"].map((dia) => (
                  <div key={dia} className="mb-2">
                    <label className="block capitalize text-sm font-medium">{dia}</label>
                    <div className="flex space-x-2">
                      <select
                        value={horarios[dia].inicio}
                        onChange={(e) => handleHorarioChange(dia, "inicio", e.target.value)}
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Início</option>
                        {timeOptions.map((time) => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                      <select
                        value={horarios[dia].fim}
                        onChange={(e) => handleHorarioChange(dia, "fim", e.target.value)}
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Fim</option>
                        {timeOptions.map((time) => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Adicionar Quadra
              </button>
            </form>
          </div>

          {/* Lista de Quadras */}
          <div className="card">
            <h2 className="text-xl font-medium mb-4">Quadras Cadastradas</h2>
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {courts.length > 0 ? (
                courts.map((court) => (
                  <div key={court.id} className="p-4 border rounded-md">
                    <p><strong>Nome:</strong> {court.nome || "Sem nome"}</p>
                    <p><strong>Tipo:</strong> {court.tipo || "Não especificado"}</p>
                    <p><strong>Capacidade:</strong> {court.capacidade || 0} pessoas</p>
                    <p><strong>Preço por Hora:</strong> R$ {(court.precoPorHora || 0).toFixed(2)}</p>
                    <p><strong>Horários:</strong></p>
                    {court.horarios && typeof court.horarios === "object" ? (
                      Object.keys(court.horarios).length > 0 ? (
                        <ul className="ml-4 list-disc">
                          {Object.entries(court.horarios).map(([dia, horarios]) => (
                            <li key={dia}>
                              {dia.charAt(0).toUpperCase() + dia.slice(1)}: {Array.isArray(horarios) ? horarios.join(", ") : "Horários inválidos"}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="ml-4 text-gray-500">Nenhum horário cadastrado</p>
                      )
                    ) : (
                      <p className="ml-4 text-gray-500">Nenhum horário disponível</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Nenhuma quadra cadastrada ainda.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}