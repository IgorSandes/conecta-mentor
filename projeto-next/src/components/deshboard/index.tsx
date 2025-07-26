"use client";

import { useEffect, useState } from "react";

type Profile = {
  id: string;
  type: string;
  profession: string;
  description: string;
};

type User = {
  id: string;
  name: string;
  email: string;
  profiles: Profile[];
};

export default function Deshboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const listUsers = async () => {
    try {
      const response = await fetch("/api/users", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Erro ao buscar usuários.");
        return;
      }

      setUsers(data);
    } catch (err) {
      console.error("Erro ao buscar usuários:", err);
      alert("Erro ao buscar usuários.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    listUsers();
  }, []);

  const normalizedSearch = search.toLowerCase();

  const filteredCards = users.flatMap((user) =>
    user.profiles
      .filter((profile) => {
        return (
          user.name.toLowerCase().includes(normalizedSearch) ||
          profile.type.toLowerCase().includes(normalizedSearch) ||
          profile.profession.toLowerCase().includes(normalizedSearch) ||
          profile.description.toLowerCase().includes(normalizedSearch)
        );
      })
      .map((profile) => ({
        ...profile,
        userName: user.name,
      }))
  );

  return (
    <section className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Lista de Usuários</h2>
        <input
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>

      {loading && <p className="text-gray-600">Carregando...</p>}

      {!loading && filteredCards.length === 0 && (
        <p className="text-gray-600">Nenhum resultado encontrado.</p>
      )}

      {!loading &&
        filteredCards.map((profile) => (
          <div
            key={profile.id}
            className="border border-gray-200 rounded-lg p-4 flex justify-between items-center mb-4 hover:bg-gray-50 transition"
          >
            <div>
              <strong className="text-gray-900">
                {profile.userName} - {profile.type}
              </strong>
              <p className="text-gray-600 text-sm">{profile.profession}</p>
              <div className="text-gray-500 text-sm">{profile.description}</div>
            </div>    
          </div>
        ))}

      {!loading && users.length > 0 && (
        <div className="text-green-600 hover:underline cursor-pointer text-sm text-right">
          Ver mais &gt;
        </div>
      )}
    </section>
  );
}
