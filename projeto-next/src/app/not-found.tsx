import Link from "next/link";

export default function NotFound(){
    return(
        <div>
            <h2>404 - Página não encontrada</h2>
            <Link href='/'>
                Voltar para a home
            </Link>
        </div>
    )
}