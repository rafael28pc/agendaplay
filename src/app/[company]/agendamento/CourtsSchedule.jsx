"use client";

import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { db } from "../../firebase/config";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import moment from "moment";
import "moment/locale/pt-br";

moment.locale("pt-br");

export default function CourtsSchedule({ courts, company, config }) {
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(moment().toDate());
  const [bookedSlots, setBookedSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPeriod, setCurrentPeriod] = useState("manhã");
  const auth = getAuth();
  const user = auth.currentUser;

  if (!courts || !Array.isArray(courts) || courts.length === 0) {
    console.log("Nenhum court recebido:", courts);
    return <div className="text-center py-10">Nenhuma quadra disponível para agendamento.</div>;
  }

  const duracaoAluguel = config?.dados?.duracaoAluguel || "1h";
  const intervaloMinutos = duracaoAluguel === "30min" ? 30 : 60;

  const normalizeString = (str) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const generateTimeSlotsByPeriod = () => {
    const slots = {
      manhã: new Set(),
      tarde: new Set(),
      noite: new Set(),
      madrugada: new Set(),
    };
    const dayName = normalizeString(moment(currentDate).format("dddd"));
    const dayKey = dayName === "terca-feira" ? "terca" : dayName.replace("-feira", "");

    courts.forEach((court) => {
      const horarios = court.horarios[dayKey] || [];
      horarios.forEach((horario) => {
        const [start, end] = horario.split("-");
        const startMoment = moment(currentDate).set({
          hour: parseInt(start.split(":")[0]),
          minute: parseInt(start.split(":")[1] || 0),
        });
        const endMoment = moment(currentDate).set({
          hour: parseInt(end.split(":")[0]),
          minute: parseInt(end.split(":")[1] || 0),
        });

        let currentTime = startMoment.clone();
        while (currentTime.isBefore(endMoment)) {
          const time = currentTime.toDate();
          const hour = currentTime.hour();
          if (hour >= 6 && hour < 12) slots.manhã.add(time.getTime());
          else if (hour >= 12 && hour < 18) slots.tarde.add(time.getTime());
          else if (hour >= 18 && hour < 24) slots.noite.add(time.getTime());
          else if (hour >= 0 && hour < 6) slots.madrugada.add(time.getTime());
          currentTime.add(intervaloMinutos, "minutes");
        }
      });
    });

    const result = {};
    Object.entries(slots).forEach(([period, timeSet]) => {
      if (timeSet.size > 0) {
        result[period] = Array.from(timeSet)
          .map((time) => new Date(time))
          .sort((a, b) => a - b);
      }
    });

    return result;
  };

  const isTimeSlotAvailable = (court, time) => {
    if (isLoading) return false;

    const dayName = normalizeString(moment(currentDate).format("dddd"));
    const dayKey = dayName === "terca-feira" ? "terca" : dayName.replace("-feira", "");
    const horarios = court.horarios[dayKey] || [];

    const isWithinAvailableHours = horarios.some((horario) => {
      const [start, end] = horario.split("-");
      const startMoment = moment(currentDate).set({
        hour: parseInt(start.split(":")[0]),
        minute: parseInt(start.split(":")[1] || 0),
      });
      const endMoment = moment(currentDate).set({
        hour: parseInt(end.split(":")[0]),
        minute: parseInt(end.split(":")[1] || 0),
      });
      return time >= startMoment.toDate() && time < endMoment.toDate();
    });
    if (!isWithinAvailableHours) return false;

    const isBooked = bookedSlots.some((slot) => {
      const slotStart = moment(slot.start);
      const slotEnd = slotStart.clone().add(intervaloMinutos, "minutes");
      return (
        slot.courtId === court.id &&
        moment(time).isSame(slotStart, "day") &&
        (time >= slotStart.toDate() && time < slotEnd.toDate())
      );
    });
    return !isBooked;
  };

  const loadBookedSlots = async () => {
    setIsLoading(true);
    try {
      const q = query(
        collection(db, "company", company, "bookings"),
        where("data", "==", moment(currentDate).format("YYYY-MM-DD"))
      );
      const querySnapshot = await getDocs(q);
      const slots = querySnapshot.docs.map((doc) => ({
        courtId: doc.data().courtId,
        start: moment(doc.data().data + " " + doc.data().horario).toDate(),
      }));
      setBookedSlots(slots);
      console.log("Horários agendados carregados:", slots);
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error);
      setBookedSlots([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeSlotClick = (court, time) => {
    const isAvailable = isTimeSlotAvailable(court, time);
    if (!isAvailable || isLoading) return;
    const eventData = {
      courtId: court.id,
      courtName: court.nome,
      start: time,
      end: moment(time).add(intervaloMinutos, "minutes").toDate(),
      price: court.precoPorHora || 0,
    };
    setSelectedEvents((prev) => {
      const isSelected = prev.some(
        (e) => e.courtId === eventData.courtId && e.start.getTime() === eventData.start.getTime()
      );
      return isSelected
        ? prev.filter(
            (e) => e.courtId !== eventData.courtId || e.start.getTime() !== eventData.start.getTime()
          )
        : [...prev, eventData];
    });
  };

  const totalPrice = selectedEvents.reduce((sum, event) => sum + (event.price || 0), 0);

  const handleBooking = async () => {
    if (!user) {
      alert("Faça login para agendar.");
      window.location.href = `/${company}/login`;
      return;
    }
    if (selectedEvents.length === 0) {
      alert("Selecione pelo menos um horário no calendário.");
      return;
    }
    try {
      for (const event of selectedEvents) {
        const bookingData = {
          courtId: event.courtId,
          userId: user.uid,
          userEmail: user.email,
          horario: moment(event.start).format("HH:mm"),
          data: moment(event.start).format("YYYY-MM-DD"),
        };
        await addDoc(collection(db, "company", company, "bookings"), bookingData);
      }
      alert(`Agendamento${selectedEvents.length > 1 ? "s" : ""} realizado${selectedEvents.length > 1 ? "s" : ""} com sucesso!`);
      setSelectedEvents([]);
      await loadBookedSlots();
    } catch (error) {
      console.error("Erro ao realizar agendamento:", error);
      alert("Erro ao agendar. Tente novamente.");
    }
  };

  const handleNavigate = async (days) => {
    const newDate = moment(currentDate).add(days, "days").toDate();
    setCurrentDate(newDate);
    setSelectedEvents([]);
    await loadBookedSlots();
  };

  useEffect(() => {
    loadBookedSlots();
  }, [currentDate]);

  const timeSlotsByPeriod = generateTimeSlotsByPeriod();
  const availablePeriods = Object.keys(timeSlotsByPeriod);

  useEffect(() => {
    if (!availablePeriods.includes(currentPeriod) && availablePeriods.length > 0) {
      setCurrentPeriod(availablePeriods[0]);
    }
  }, [currentDate]);

  const renderTimeSlots = (period, slots) => (
    <div className="flex flex-col">
      <div className="flex">
        <div className="w-20 sm:w-32 flex-shrink-0">
          <div className="h-12"></div>
          {courts.map((court) => (
            <div
              key={court.id}
              className="h-14 flex items-center justify-center border-b border-r border-gray-200 bg-gray-50"
            >
              <span className="text-[10px] sm:text-sm font-medium text-gray-700">{court.nome}</span>
            </div>
          ))}
        </div>
        <div className="flex-1 flex">
          {slots.map((time, index) => {
            const startTime = moment(time);
            const endTime = moment(time).add(intervaloMinutos, "minutes");
            const isBookedSlot = courts.some((court) =>
              bookedSlots.some((slot) => {
                const slotStart = moment(slot.start);
                const slotEnd = slotStart.clone().add(intervaloMinutos, "minutes");
                return (
                  slot.courtId === court.id &&
                  moment(time).isSame(slotStart, "day") &&
                  (time >= slotStart.toDate() && time < slotEnd.toDate())
                );
              })
            );
            return (
              <div key={index} className="flex-1 min-w-[60px] sm:min-w-[100px] relative">
                <div className="h-12 flex items-center justify-center border-b border-gray-200 bg-gray-50 relative">
                  <span className="text-[10px] sm:text-xs font-medium text-gray-700 whitespace-nowrap z-10">
                    {startTime.format("HH:mm")}
                  </span>
                  <div className="absolute bottom-2 left-0 right-0 h-px border-b border-dashed border-gray-400" />
                </div>
                {courts.map((court) => {
                  const isAvailable = isTimeSlotAvailable(court, time);
                  const isSelected = selectedEvents.some(
                    (e) => e.courtId === court.id && e.start.getTime() === time.getTime()
                  );
                  return (
                    <div
                      key={court.id}
                      className={`h-14 flex items-center justify-center border-b border-r border-gray-200 ${
                        isAvailable
                          ? "bg-blue-100 hover:bg-blue-200 cursor-pointer"
                          : "bg-gray-100"
                      } ${isSelected ? "bg-blue-500 text-white" : ""} ${
                        isBookedSlot && !isAvailable ? "bg-red-200" : ""
                      }`}
                      onClick={() => handleTimeSlotClick(court, time)}
                    >
                      <span className="text-[10px] sm:text-xs">
                        {isLoading ? "Carregando..." : isAvailable ? "Disp." : "Indisp."}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
      <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
        Agendamento de Quadras - {moment(currentDate).format("DD/MM/YYYY")}
      </h3>

      <div className="flex gap-2 mb-4 overflow-x-auto">
        {availablePeriods.map((period) => (
          <button
            key={period}
            onClick={() => setCurrentPeriod(period)}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              currentPeriod === period
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-6">
        {availablePeriods.length > 0 && timeSlotsByPeriod[currentPeriod]
          ? renderTimeSlots(currentPeriod, timeSlotsByPeriod[currentPeriod])
          : <p className="text-gray-500">Nenhum horário disponível para este dia.</p>}

        <div className="w-full bg-gray-50 p-4 rounded-lg shadow-inner">
          <h4 className="text-base sm:text-lg font-medium text-gray-800 mb-3">Horários Selecionados</h4>
          {selectedEvents.length > 0 ? (
            <>
              <ul className="space-y-2 mb-4 text-xs sm:text-sm">
                {selectedEvents.map((event, index) => (
                  <li key={index} className="text-gray-700">
                    <p><strong>Quadra:</strong> {event.courtName}</p>
                    <p><strong>Horário:</strong> {moment(event.start).format("HH:mm")} - {moment(event.end).format("HH:mm")}</p>
                    <p><strong>Preço:</strong> R$ {event.price.toFixed(2)}</p>
                  </li>
                ))}
              </ul>
              <p className="text-gray-800 font-semibold">
                Total: R$ {totalPrice.toFixed(2)}
              </p>
            </>
          ) : (
            <p className="text-gray-500">Nenhum horário selecionado.</p>
          )}
          <button
            onClick={handleBooking}
            className="mt-4 w-full py-2 rounded-md text-white font-medium disabled:bg-gray-400"
            style={{
              backgroundColor:
                selectedEvents.length > 0 ? config?.config?.corSecundaria || "#28a745" : "#d1d5db",
            }}
            disabled={selectedEvents.length === 0 || isLoading}
          >
            Agendar {selectedEvents.length > 0 ? `${selectedEvents.length} horário${selectedEvents.length > 1 ? "s" : ""}` : ""}
          </button>
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <button
          onClick={() => handleNavigate(-1)}
          className="px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300 text-xs sm:text-sm"
          disabled={isLoading}
        >
          Dia Anterior
        </button>
        <button
          onClick={() => handleNavigate(1)}
          className="px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300 text-xs sm:text-sm"
          disabled={isLoading}
        >
          Próximo Dia
        </button>
      </div>
    </div>
  );
}