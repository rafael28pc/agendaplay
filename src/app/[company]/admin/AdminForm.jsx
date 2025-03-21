"use client";

import { db } from "../../firebase/config";
import { collection, addDoc } from "firebase/firestore";
import { useState } from "react";

export default function AdminForm({ company, config }) {
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("");
  const [capacidade, setCapacidade] = useState("");
  const [precoPorHora, setPrecoPorHora] = useState("");
  const [horarios, setHorarios] = useState({
    segunda: "",
    terca: "",
    quarta: "",
    quinta: "",
    sexta: "",
    sabado: "",
    domingo: "",
  });

  const handleAddCourt = async (e) => {
    e.preventDefault();

    const horariosFormatados = {};
    Object.keys(horarios).forEach((dia) => {
      if (horarios[dia]) {
        horariosFormatados[dia] = horarios[dia]
          .split(",")
          .map((h) => h.trim())
          .filter((h) => h);
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
      await addDoc(collection(db, "company", company, "courts"), courtData);
      setNome("");
      setTipo("");
      setCapacidade("");
      setPrecoPorHora("");
      setHorarios({
        segunda: "",
        terca: "",
        quarta: "",
        quinta: "",
        sexta: "",
        sabado: "",
        domingo: "",
      });
      alert("Quadra adicionada com sucesso!");
    } catch (error) {
      console.error("Erro ao adicionar quadra:", error);
      alert("Erro ao adicionar quadra. Tente novamente.");
    }
  };

  if (!config || !Array.isArray(config.atividades)) {
    return <p className="text-white text-center">Erro: Atividades não carregadas. Verifique a configuração da empresa.</p>;
  }

  const handleHorarioChange = (dia, value) => {
    setHorarios((prev) => ({
      ...prev,
      [dia]: value,
    }));
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-2xl font-bold text-white mb-4">Adicionar Nova Quadra</h3>
      <form onSubmit={handleAddCourt} className="space-y-6 text-white">
        <div>
          <label className="block mb-1 font-medium">Nome da Quadra</label>
          <input
            type="text"
            placeholder="Ex.: Quadra 1"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full p-3 rounded-md bg-white/20 text-white placeholder-white/70 border border-gray-600"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Tipo de Quadra</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="w-full p-3 rounded-md bg-white/20 text-white border border-gray-600"
            required
          >
            <option value="">Selecione um tipo</option>
            {config.atividades.map((atv, index) => (
              <option key={index} value={atv.nome}>
                {atv.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Capacidade (nº de pessoas)</label>
          <input
            type="number"
            placeholder="Ex.: 10"
            value={capacidade}
            onChange={(e) => setCapacidade(e.target.value)}
            className="w-full p-3 rounded-md bg-white/20 text-white placeholder-white/70 border border-gray-600"
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
            className="w-full p-3 rounded-md bg-white/20 text-white placeholder-white/70 border border-gray-600"
            min="0"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Horários de Funcionamento</label>
          <p className="text-sm mb-2">Digite os horários separados por vírgula (ex.: 08:00-12:00, 14:00-18:00)</p>
          {["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"].map((dia) => (
            <div key={dia} className="mb-2">
              <label className="block capitalize font-medium">{dia}</label>
              <input
                type="text"
                placeholder={`Horários para ${dia}`}
                value={horarios[dia]}
                onChange={(e) => handleHorarioChange(dia, e.target.value)}
                className="w-full p-2 rounded-md bg-white/20 text-white placeholder-white/70 border border-gray-600"
              />
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
  );
}