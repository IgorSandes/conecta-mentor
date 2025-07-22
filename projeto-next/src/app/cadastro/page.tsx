'use client';

import { useState, useRef, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { FaUser, FaLock, FaEnvelope, FaEye, FaEyeSlash } from 'react-icons/fa';
import Link from 'next/link';

export default function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleCreateUser = async (event: FormEvent) => {
    event.preventDefault();
    setErro('');
    setSucesso('');

    if (senha !== confirmaSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    try {
      const response = await fetch('/api/criarUsuario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSucesso('Usuário criado com sucesso!');
        setNome('');
        setEmail('');
        setSenha('');
        setConfirmaSenha('');
        // router.push('/') // opcional: redirecionar após sucesso
      } else {
        const mensagemErro = data.message || data.error || 'Erro ao criar usuário.';
        setErro(mensagemErro);
        if (mensagemErro.toLowerCase().includes('email')) {
          emailRef.current?.focus();
        }
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      setErro('Erro ao conectar com o servidor.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <form onSubmit={handleCreateUser} className="space-y-5">
          <h1 className="text-2xl font-bold text-center text-gray-800">Conecta Mentor - Cadastro</h1>

          {erro && <p className="text-red-600 text-sm text-center">{erro}</p>}
          {sucesso && <p className="text-green-600 text-sm text-center">{sucesso}</p>}

          <div className="relative">
            <input
              type="text"
              placeholder="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaUser className="absolute left-3 top-3 text-gray-500" />
          </div>

          <div className="relative">
            <input
              ref={emailRef}
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaEnvelope className="absolute left-3 top-3 text-gray-500" />
          </div>

          <div className="relative">
            <input
              type={mostrarSenha ? 'text' : 'password'}
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaLock className="absolute left-3 top-3 text-gray-500" />
            <span
              onClick={() => setMostrarSenha(!mostrarSenha)}
              className="absolute right-3 top-3 text-gray-500 cursor-pointer"
            >
              {mostrarSenha ? <FaEye /> : <FaEyeSlash />}
            </span>
          </div>

          <div className="relative">
            <input
              type={mostrarConfirmacao ? 'text' : 'password'}
              placeholder="Confirme a senha"
              value={confirmaSenha}
              onChange={(e) => setConfirmaSenha(e.target.value)}
              required
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaLock className="absolute left-3 top-3 text-gray-500" />
            <span
              onClick={() => setMostrarConfirmacao(!mostrarConfirmacao)}
              className="absolute right-3 top-3 text-gray-500 cursor-pointer"
            >
              {mostrarConfirmacao ? <FaEye /> : <FaEyeSlash />}
            </span>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Cadastrar
          </button>

          <div className="text-center text-sm text-gray-700">
            Já tem uma conta?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              Entrar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
