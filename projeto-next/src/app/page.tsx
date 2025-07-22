'use client';

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function Welcome() {
  const [loading, setLoading] = useState(false);

  const handleSignIn = () => {
    setLoading(true);
    signIn("github", { callbackUrl: "/home" });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-200 to-white overflow-hidden">
      {/* SVG animado de fundo */}
      <svg
        className="absolute w-full h-full opacity-30 z-0"
        viewBox="0 0 1024 768"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="200" cy="300" r="60" fill="#3b82f6">
          <animate attributeName="r" values="60;80;60" dur="6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0.6;1" dur="6s" repeatCount="indefinite" />
        </circle>
        <circle cx="800" cy="400" r="40" fill="#2563eb">
          <animate attributeName="r" values="40;60;40" dur="8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.8;0.3;0.8" dur="8s" repeatCount="indefinite" />
        </circle>
        <circle cx="500" cy="100" r="50" fill="#60a5fa">
          <animate attributeName="r" values="50;70;50" dur="7s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.9;0.4;0.9" dur="7s" repeatCount="indefinite" />
        </circle>
      </svg>

      {/* Conteúdo principal */}
      <div className="relative z-10 text-center text-gray-800 px-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Bem-vindo ao <span className="text-blue-600">Conecta Mentor</span>
        </h1>
        <p className="mb-10 text-lg md:text-xl">
          Conectando pessoas e experiências para um futuro melhor.
        </p>

        <div className="flex flex-col md:flex-row justify-center gap-4">
          <button
            onClick={handleSignIn}
            className="bg-gray-900 hover:bg-gray-800 text-white py-3 px-6 rounded-xl transition duration-300"
          >
            Entrar com GitHub
          </button>
          <Link href="./login">
            <button className="bg-white text-gray-900 hover:bg-gray-200 py-3 px-6 rounded-xl transition duration-300">
              Login com Email
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
