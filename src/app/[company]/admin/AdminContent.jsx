"use client";

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../../firebase/config";
import { doc, getDoc, collection, getDocs, addDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

export default function AdminContent({ company, config, users: initialUsers }) {
  const [userLevel, setUserLevel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courts, setCourts] = useState([]);
  const [bookings, setBookings] = useState([]);
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

  const getBookingEvents = () => {
    return bookings.map((booking) => {
      const court = courts.find((c) => c.id === booking.courtId);
      const [start, end] = booking.horario.split(": ")[1].split("-");
      const dayIndex = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"].indexOf(
        booking.horario.split(": ")[0]
      );
      const startDate = moment(booking.data)
        .startOf("week")
        .add(dayIndex, "days")
        .set({ hour: parseInt(start.split(":")[0]), minute: 0 });
      const endDate = moment(startDate).set({ hour: parseInt(end.split(":")[0]), minute: 0 });
      return {
        title: `${court?.nome || "Quadra"} - ${booking.userEmail}`,
        start: startDate.toDate(),
        end: endDate.toDate(),
        resource: booking,
      };
    });
  };

  const totalRevenue = bookings.reduce((sum, booking) => {
    const court = courts.find((c) => c.id === booking.courtId);
    return sum + (court?.precoPorHora || 0);
  }, 0);

  if (loading) return <p className="text-center text-white py-10">Carregando...</p>;
  if (userLevel === -1) return <p className="text-center text-white py-10">Acesso negado. Faça login para continuar.</p>;
  if (userLevel !== 1) return <p className="text-center text-white py-10">Acesso negado. Apenas administradores podem acessar esta página.</p>;

  return (
    <div className="min-h-screen p-6 text-white">
      <h1 className="text-4xl font-bold text-center mb-8">Dashboard Admin - {config?.nome || "Nome não disponível"}</h1>

      <section className="mb-12">
        <h2 className="text-3xl font-semibold mb-6 text-center">Adicionar Nova Quadra</h2>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
          <form onSubmit={handleAddCourt} className="space-y-6">
            <div>
              <label className="block mb-1 font-medium">Nome da Quadra</label>
              <input
                type="text"
                placeholder="Ex.: Quadra 1"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full p-3 rounded-md bg-white/20 text-white border border-gray-600"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Tipo de Quadra</label>
              <input
                type="text"
                placeholder="Ex.: Futebol, Vôlei"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full p-3 rounded-md bg-white/20 text-white border border-gray-600"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Capacidade (nº de pessoas)</label>
              <input
                type="number"
                placeholder="Ex.: 10"
                value={capacidade}
                onChange={(e) => setCapacidade(e.target.value)}
                className="w-full p-3 rounded-md bg-white/20 text-white border border-gray-600"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Preço por Hora (R$)</label>
              <input
                type="number"
                step="0.01"
                placeholder="Ex.: 100.00"
                value={precoPorHora}
                onChange={(e) => setPrecoPorHora(e.target.value)}
                className="w-full p-3 rounded-md bg-white/20 text-white border border-gray-600"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Horários de Funcionamento</label>
              {["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"].map((dia) => (
                <div key={dia} className="mb-4">
                  <label className="block capitalize font-medium mb-1">{dia}</label>
                  <div className="flex space-x-4">
                    <select
                      value={horarios[dia].inicio}
                      onChange={(e) => handleHorarioChange(dia, "inicio", e.target.value)}
                      className="w-full p-2 rounded-md bg-white/20 text-white border border-gray-600"
                    >
                      <option value="">Início</option>
                      {timeOptions.map((time) => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                    <select
                      value={horarios[dia].fim}
                      onChange={(e) => handleHorarioChange(dia, "fim", e.target.value)}
                      className="w-full p-2 rounded-md bg-white/20 text-white border border-gray-600"
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
              className="w-full py-3 rounded-md text-white font-medium bg-green-600 hover:bg-green-700 transition-colors"
            >
              Adicionar Quadra
            </button>
          </form>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-3xl font-semibold mb-6 text-center">Quadras Cadastradas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {courts.length > 0 ? (
            courts.map((court) => (
              <div key={court.id} className="bg-white/20 p-4 rounded-lg">
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
                    <p className="ml-4">Nenhum horário cadastrado</p>
                  )
                ) : (
                  <p className="ml-4">Nenhum horário disponível</p>
                )}
              </div>
            ))
          ) : (
            <p className="text-center">Nenhuma quadra cadastrada ainda.</p>
          )}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-3xl font-semibold mb-6 text-center">Agendamentos</h2>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-5xl mx-auto">
          <Calendar
            localizer={localizer}
            events={getBookingEvents()}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
            defaultView="week"
            views={["week", "month"]}
            eventPropGetter={() => ({ style: { backgroundColor: config?.config?.corSecundaria || "#28a745" } })}
          />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-3xl font-semibold mb-6 text-center">Resumo Financeiro</h2>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-2xl mx-auto text-center">
          <p className="text-xl">Total a Receber: R$ {totalRevenue.toFixed(2)}</p>
          <p className="text-sm mt-2">Baseado em {bookings.length} agendamentos realizados.</p>
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-semibold mb-6 text-center">Usuários Registrados</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {initialUsers && initialUsers.length > 0 ? (
            initialUsers.map((user) => (
              <div key={user.id} className="bg-white/20 p-4 rounded-lg">
                <p><strong>Nome:</strong> {user.nome || "Sem nome"}</p>
                <p><strong>Email:</strong> {user.email || "Sem email"}</p>
                <p><strong>Telefone:</strong> {user.telefone || "Sem telefone"}</p>
                <p><strong>Nível:</strong> {user.level === 1 ? "Administrador" : "Usuário"}</p>
              </div>
            ))
          ) : (
            <p className="text-center">Nenhum usuário registrado ainda.</p>
          )}
        </div>
      </section>
    </div>
  );
}