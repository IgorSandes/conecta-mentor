// app/profile/page.tsx
import { auth } from "@/lib/auth";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    return <div>Você precisa estar logado para acessar essa página.</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="flex-grow overflow-auto flex flex-col">
        <Header session={session} />

        <main className="flex-grow flex items-center justify-center px-4 py-10">
          <ProfileForm />
        </main>
      </div>

      <footer className="w-full bg-white shadow-md">
        <Footer />
      </footer>
    </div>
  );
}
