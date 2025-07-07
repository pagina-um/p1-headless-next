import { Logo } from "../ui/Logo";
import Link from "next/link";
import { CopyrightIcon, Handshake, Mail } from "lucide-react";

export function PostFooter() {
  return (
    <footer className="bg-slate-800 py-8 px-4 md:px-8">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 ">
          <div className="space-y-4">
            <div className="w-48">
              <Logo white />
            </div>
            <p className="font-serif text-lg text-white">
              O jornalismo independente (só) depende dos leitores.
            </p>
          </div>
          <div className="space-y-4">
            <p className="text-lg text-white">
              Não dependemos de grupos económicos nem do Estado. Não fazemos
              fretes. Fazemos jornalismo para os leitores,{" "}
              <strong className="">
                mas só sobreviveremos com o seu apoio financeiro.
              </strong>
            </p>
          </div>
        </div>

        {/* Call to Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-8">
          <Link
            href="/donativos"
            className="group bg-primary hover:bg-primary-dark transition-all duration-300 rounded-lg p-4 text-center flex items-center justify-center space-x-3"
          >
            <Handshake className="w-6 h-6 group-hover:scale-110 transition-transform duration-300 stroke-white" />
            <span className="text-xl font-bold text-white">Contribuir</span>
          </Link>
          <Link
            href="https://pagina-um.kit.com/53291313d7"
            className="group bg-primary hover:bg-primary-dark transition-all duration-300 rounded-lg p-4 text-center flex items-center justify-center space-x-3"
          >
            <Mail className="w-6 h-6 group-hover:scale-110 transition-transform duration-300 stroke-white" />
            <span className="text-xl font-bold text-white">
              Subscrever a newsletter
            </span>
          </Link>
        </div>

        {/* Footer Links */}
        <div className="pt-8 border-t border-slate-700">
          <nav className="grid grid-cols-2 md:grid-cols-4 lg:flex lg:flex-wrap lg:justify-center gap-4 lg:gap-3 mb-8">
            <Link
              href="/contactos"
              className="hover:text-primary transition-colors duration-200 text-sm uppercase tracking-wider text-slate-400"
            >
              Termos e Contactos
            </Link>
            <Link
              href="/ficha-tecnica"
              className="hover:text-primary transition-colors duration-200 text-sm uppercase tracking-wider text-slate-400"
            >
              Ficha Técnica
            </Link>
            <Link
              href="/politica-de-privacidade"
              className="hover:text-primary transition-colors duration-200 text-sm uppercase tracking-wider text-slate-400"
            >
              Política de Privacidade
            </Link>
            <Link
              href="/estatuto-editorial"
              className="hover:text-primary transition-colors duration-200 text-sm uppercase tracking-wider text-slate-400"
            >
              Estatuto Editorial
            </Link>
            <Link
              href="/codigo-de-principios"
              className="hover:text-primary transition-colors duration-200 text-sm uppercase tracking-wider text-slate-400"
            >
              Código de Principios
            </Link>
            <Link
              href="/politica-de-correccoes"
              className="hover:text-primary transition-colors duration-200 text-sm uppercase tracking-wider text-slate-400"
            >
              Política de Correcções
            </Link>
            <Link
              href="/codigo-de-transparencia"
              className="hover:text-primary transition-colors duration-200 text-sm uppercase tracking-wider text-slate-400"
            >
              Declaração de transparência
            </Link>
          </nav>

          {/* Copyright */}
          <div className="text-center text-sm text-slate-400 flex items-center justify-center gap-2">
            <CopyrightIcon className="w-4 h-4" />
            <span>
              {new Date().getFullYear()} Página UM, Ldª. Todos os direitos
              reservados.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
