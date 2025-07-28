import LogoutButton from "@/components/LogoutButton";
import { Session } from "next-auth";
import Link from "next/link";
import { FaHome } from "react-icons/fa";

type HeaderProps = {
  session: Session;
};

export default function Header({ session }: HeaderProps) {
  return (
    <header
      className="relative flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0 px-6 py-4 border-b border-transparent
      after:absolute after:bottom-0 after:h-0.5 after:w-[98%] after:left-1/2 after:-translate-x-1/2
      after:bg-gradient-to-r after:from-blue-500 after:via-purple-900 after:to-blue-900"
    >
      <div className="text-center md:text-left">
        {session?.user ? (
          <>
            <h1 className="text-3xl font-bold text-gray-800">
              Olá, {session.user.name || session.user.email}
            </h1>
            <p className="text-gray-600 text-sm mt-1">Usuário: {session.user.email}</p>
          </>
        ) : (
          <p className="text-gray-600">Usuário não autenticado.</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/home"
          className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded transition flex items-center justify-center"
          aria-label="Voltar para Home"
          title="Home"
        >
          <FaHome size={18} />
        </Link>

        <LogoutButton />

        {session?.user?.image && (
          <img
            src={session.user.image}
            alt="Imagem do usuário"
            className="w-14 h-14 rounded-full object-cover border border-gray-300"
            loading="lazy"
          />
        )}
      </div>
    </header>
  );
}
