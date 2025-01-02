import { PostBySlugData } from "@/app/[year]/[month]/[day]/[slug]/page";
import { Logo } from "../ui/Logo";
import Link from "next/link";
import { CopyrightIcon, Handshake, Mail } from "lucide-react";

export function PostFooter() {
  return (
    <footer className="mt-12 pt-3  pb-2 px-8 justify-between bg-slate-200">
      <div className="flex gap-x-4 mb-4">
        <p className="flex-1 text-right mt-3">
          Fazemos jornalismo sem medos nem concessões. Não dependemos de grupos
          económicos nem do Estado. Não temos publicidade. Não temos dívidas.
          Não fazemos fretes. Fazemos jornalismo para os leitores,{" "}
          <strong>mas só sobreviveremos com o seu apoio financeiro.</strong>
        </p>
        <div className="flex-1 flex flex-col items-start justify-end">
          <div className="w-50 ">
            <Logo />
          </div>
          <p className="font-serif">
            O jornalismo independente (só) depende dos leitores.
          </p>
        </div>
      </div>
      <div className="flex  gap-4 ">
        <Link
          href={"#"}
          className="py-3 bg-primary rounded-md flex items-center px-8 flex-1 justify-center text-center text-white font-sans font-bold text-xl hover:bg-primary-dark transition-colors duration-200"
        >
          <Handshake className="inline mb-0.5 h-6 mr-2" />
          Contribuir
        </Link>
        <Link
          href={"#"}
          className="py-3 bg-primary rounded-md flex items-center px-8 flex-1 justify-center text-center text-white font-sans  font-bold text-xl hover:bg-primary-dark transition-colors duration-200"
        >
          <Mail className="inline mb-0.5 h-6 mr-2" />
          Subscrever a newsletter
        </Link>
      </div>
      <div className="flex gap-y-2 gap-x-4 mt-4 justify-center">
        <Link href={"#"} className=" uppercase text-xs">
          Apoios e Contactos
        </Link>
        <Link href={"#"} className=" uppercase text-xs">
          Ficha Técnica
        </Link>
        <Link href={"#"} className=" uppercase text-xs">
          Política de Privacidade
        </Link>
        <Link href={"#"} className=" uppercase text-xs">
          Estatuto Editorial
        </Link>
        <Link href={"#"} className=" uppercase text-xs">
          Código de Principios
        </Link>
        <Link href={"#"} className=" uppercase text-xs">
          Política de Correcções
        </Link>
        <Link href={"#"} className=" uppercase text-xs">
          Declaração de transparência
        </Link>
      </div>
      <div>
        <p className="text-center text-sm text-gray-600 mt-4">
          <CopyrightIcon className="inline mb-0.5 h-4" />
          {new Date().getFullYear()} Página UM, Ldª. Todos os direitos
          reservados.
        </p>
      </div>
    </footer>
  );
}
