"use client";

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../../../firebase/config";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import React from "react";
import Link from "next/link";

const localizer = momentLocalizer(moment);

// Estilos personalizados para o calendário
const calendarStyles = `
  .rbc-calendar {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 20px;
  }
  .rbc-toolbar {
    margin-bottom: 20px;
    font-size: 16px;
  }
  .rbc-toolbar button {
    border-radius: 4px;
    padding: 8px 16px;
    background-color: #2563eb;
    color: white;
    border: none;
  }
  .rbc-toolbar button:hover {
    background-color: #1d4ed8;
  }
  .rbc-event {
    background-color: #2563eb;
    border-radius: 4px;
    padding: 4px;
    color: white;
    border: none;
  }
  .rbc-event.rbc-selected {
    background-color: #1d4ed8;
  }
  .rbc-time-view {
    border: 1px solid #e5e7eb;
  }
  .rbc-header {
    background-color: #f9fafb;
    padding: 10px;
    font-weight: 600;
  }
`;

export default function BookingsPage({ params, config }) {
  const resolvedParams = React.use(params);
  const company = resolvedParams.company;
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

  const getBookingEvents = () => {
    return bookings
      .filter((booking) => booking.horario && typeof booking.horario === "string")
      .map((booking) => {
        const court = courts.find((c) => c.id === booking.courtId);
        const horarioParts = booking.horario.split(": ");
        if (horarioParts.length < 2) {
          console.warn(`Horário inválido para booking ${booking.id}: ${booking.horario}`);
          return null;
        }

        const [start, end] = horarioParts[1].split("-");
        const dayIndex = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"].indexOf(horarioParts[0]);
        if (dayIndex === -1) {
          console.warn(`Dia inválido para booking ${booking.id}: ${horarioParts[0]}`);
          return null;
        }

        const startDate = moment(booking.data)
          .startOf("week")
          .add(dayIndex, "days")
          .set({ hour: parseInt(start.split(":")[0]), minute: 0 });
        const endDate = moment(startDate).set({ hour: parseInt(end.split(":")[0]), minute: 0 });

        return {
          title: `${court?.nome || "Quadra"} - ${booking.userEmail || "Usuário desconhecido"}`,
          start: startDate.toDate(),
          end: endDate.toDate(),
          resource: booking,
        };
      })
      .filter((event) => event !== null);
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
        <h1 className="text-3xl font-semibold mb-6">Agendamentos - {config?.nome || "Nome não disponível"}</h1>
        <div className="card">
          <style>{calendarStyles}</style>
          <Calendar
            localizer={localizer}
            events={getBookingEvents()}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            defaultView="week"
            views={["week", "month"]}
            messages={{
              today: "Hoje",
              previous: "Anterior",
              next: "Próximo",
              month: "Mês",
              week: "Semana",
            }}
          />
        </div>
      </main>
    </div>
  );
}