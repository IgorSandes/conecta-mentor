"use client";

import { useState, Fragment } from "react";
import { useRouter } from "next/navigation";
import { FaChalkboardTeacher, FaUserGraduate } from "react-icons/fa";
import { Listbox, Transition } from "@headlessui/react";
import { FaChevronDown } from "react-icons/fa";

const areas = [
  "Tecnologia", "Educação", "Saúde", "Engenharia", "Administração",
  "Marketing", "Finanças", "Direito", "Design", "Recursos Humanos",
  "Comunicação", "Meio Ambiente", "Serviços Sociais", "Logística",
  "Artes", "Turismo e Hotelaria", "Construção Civil", "Agronegócio"
];

export default function ProfileForm() {
  const [tipo, setTipo] = useState("");
  const [area, setArea] = useState("");
  const [texto, setTexto] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const router = useRouter();

  const handleSelecionarPerfil = (perfil: string) => {
    setTipo(perfil);
    setMostrarFormulario(true);
    setArea("");
    setTexto("");
  };

  const handleRegistrar = async () => {
    if (!tipo || !area || !texto) {
      alert("Preencha todos os campos.");
      return;
    }

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          type: tipo.toUpperCase(),
          profession: area.toUpperCase(),
          description: texto,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Erro ao criar perfil.");
        return;
      }
      router.push("/home");
    } catch (err) {
      console.error("Erro ao criar perfil:", err);
      alert("Erro ao criar perfil.");
    }
  };

  return (
    <div className="w-full max-w-2xl bg-white p-10 rounded-3xl shadow-2xl border border-gray-200">
      <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-8">
        Criar Perfil
      </h1>

      <div className="flex justify-center gap-6 mb-8">
        <button
          type="button"
          onClick={() => handleSelecionarPerfil("mentor")}
          className={`flex items-center justify-center gap-2 w-40 py-3 rounded-xl font-semibold transition-all shadow-sm text-white bg-blue-600 hover:bg-blue-700 ${tipo === "mentor" ? "ring-4 ring-blue-400" : "opacity-80"
            }`}
        >
          <FaChalkboardTeacher />
          MENTOR
        </button>
        <button
          type="button"
          onClick={() => handleSelecionarPerfil("mentorado")}
          className={`flex items-center justify-center gap-2 w-40 py-3 rounded-xl font-semibold transition-all shadow-sm text-white bg-blue-600 hover:bg-blue-700 ${tipo === "mentorado" ? "ring-4 ring-blue-400" : "opacity-80"
            }`}
        >
          <FaUserGraduate />
          MENTORADO
        </button>
      </div>

      {mostrarFormulario && tipo && (
        <>
          <div className="flex items-center gap-2 justify-center mb-6 text-xl font-semibold text-gray-700">
            {tipo === "mentor" ? (
              <>
                <span>Mentor</span>
                <FaChalkboardTeacher className="text-blue-600" />
              </>
            ) : (
              <>
                <span>Mentorado</span>
                <FaUserGraduate className="text-blue-600" />
              </>
            )}
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {tipo === "mentor" ? "Área de Atuação:" : "Área de Interesse:"}
              </label>
              <Listbox value={area} onChange={setArea}>
                <div className="relative">
                  <Listbox.Button className="relative w-full cursor-pointer rounded-lg border border-gray-300 bg-white py-3 pl-4 pr-10 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <span className="block truncate">{area || "Selecione"}</span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <FaChevronDown className="h-4 w-4 text-gray-400" />
                    </span>
                  </Listbox.Button>

                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                      {areas.map((areaOp) => (
                        <Listbox.Option
                          key={areaOp}
                          value={areaOp}
                          className={({ active }) =>
                            `cursor-pointer select-none px-4 py-2 ${active ? "bg-blue-100 text-blue-900" : "text-gray-900"
                            }`
                          }
                        >
                          {areaOp}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {tipo === "mentor" ? "Competências:" : "Objetivos:"}
              </label>
              <textarea
                maxLength={500}
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder={
                  tipo === "mentor"
                    ? "Descreva suas competências"
                    : "Quais seus objetivos com a mentoria?"
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 h-32 resize-none text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>

            <button
              type="button"
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-all shadow-md"
              onClick={handleRegistrar}
            >
              Registrar
            </button>
          </form>
        </>
      )}
    </div>
  );
}
