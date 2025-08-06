"use client";

import { FaFacebook, FaLinkedin, FaGithub } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-black text-white py-6 w-full">
      <div className="container mx-auto max-w-[90rem] px-6 sm:px-8 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6 flex-wrap">
        {/* Informações institucionais */}
        <div className="text-center md:text-left flex-1 min-w-[250px]">
          <p className="font-semibold">Projeto Conecta Mentor</p>
          <p className="text-sm text-gray-300">
            Criando pontes entre gerações para transformar o mundo do trabalho.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            © {new Date().getFullYear()} Desenvolvido por{' '}
            <a
              href="https://portfolioigorsandes.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-200"
            >
              Igor Sandes Brun
            </a>
          </p>
        </div>

        {/* Redes sociais com ícones */}
        <div className="flex gap-8 text-3xl flex-shrink-0">
          <a
            href="https://www.facebook.com/igor.sandes.77"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-400 transition"
            aria-label="Facebook"
          >
            <FaFacebook />
          </a>
          <a
            href="https://linkedin.com/in/igorsandesbr/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-300 transition"
            aria-label="LinkedIn"
          >
            <FaLinkedin />
          </a>
          <a
            href="https://github.com/IgorSandes/conecta-mentor"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-400 transition"
            aria-label="GitHub"
          >
            <FaGithub />
          </a>
        </div>
      </div>
    </footer>
  );
}
