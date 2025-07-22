'use client';

import { signOut } from "next-auth/react";
import { FaSignOutAlt } from "react-icons/fa";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded transition flex items-center justify-center"
      aria-label="Sair"
      title="Sair"
    >
      <FaSignOutAlt size={18} />
    </button>
  );
}
