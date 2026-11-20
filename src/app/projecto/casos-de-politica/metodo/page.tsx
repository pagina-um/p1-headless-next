import Link from "next/link";
import { ProjectoShell } from "@/components/projectos/ProjectoShell";
import { projectoMetadata } from "@/projectos/registry";
import { BASE, NAV, PROTOTYPE, SLUG, formatDate } from "../_lib/archive";
import { manifest } from "../_lib/data";
import { Downloads, SourceLink } from "../_components/Common";
export const metadata = {
  ...projectoMetadata(SLUG),
  title: "Método e ficha técnica | Casos de Política | Página UM",
  alternates: { canonical: `${BASE}/metodo` },
};
export default function Page() {
  return (
    <ProjectoShell slug={SLUG} nav={NAV}>
      <div className="max-w-3xl">
        <h2>O mesmo critério, qualquer que seja o partido</h2>
        <p>
          Casos de Política reúne informação documentada sobre titulares e
          antigos titulares de cargos autárquicos ou governamentais e gestores
          públicos com ligação política comprovada. A investigação abrange o
          período da democracia, desde 25 de Abril de 1974, com lacunas
          históricas identificadas nas fichas.
        </p>
        <p>
          Esta edição contém {manifest.cases} casos, incluindo sete decisões
          sobre contas partidárias, e {manifest.documents} documento oficial de
          consulta. Inclui {manifest.people} pessoas, {manifest.currentParties}{" "}
          partidos actuais e {manifest.historicalParties} históricos. As fontes
          foram consultadas até {formatDate(manifest.checkedAt)}. A cobertura é
          parcial e não constitui um inventário exaustivo.
        </p>
        <section className="mt-8">
          <h3>Fontes à vista</h3>
          <p>
            Cada ficha liga às decisões, documentos ou notícias que sustentam o
            seu conteúdo. Quando a sentença integral não foi consultada, a
            notícia é identificada como fonte jornalística. Notícias que
            reproduzem a mesma agência não contam como confirmações
            independentes. Uma acta municipal ou comunicado de uma parte não
            substitui uma decisão judicial.
          </p>
        </section>
        <section className="mt-8">
          <h3>Acusação não é prova de culpa</h3>
          <p>
            A inclusão de uma pessoa não equivale a uma imputação de culpa. Os
            papéis são descritos individualmente, incluindo testemunhas e outros
            intervenientes. O filtro «Arguidos em inquérito» exige confirmação
            individual com fonte e data, num caso em fase de investigação e sem
            acusação localizada. Buscas, suspeitas ou levantamento de imunidade
            não permitem inferir esse estatuto.
          </p>
          <p>
            A constituição como arguido assegura direitos de defesa. Uma
            acusação, um julgamento e uma condenação são momentos distintos. Uma
            condenação em primeira instância não é apresentada como definitiva
            sem fonte que sustente o trânsito em julgado.
          </p>
        </section>
        <section className="mt-8">
          <h3>Condenações com natureza definida</h3>
          <p>
            As condenações criminais, cíveis, financeiras e contra-ordenacionais
            têm classificações próprias. Prisão efectiva, prisão suspensa, multa
            criminal, indemnização e sanção pecuniária não são tratadas como
            equivalentes. As decisões sancionatórias sobre contas partidárias
            integram as condenações contra-ordenacionais quando mantêm uma
            coima.
          </p>
          <p>
            A síntese reúne as condenações cíveis, financeiras e coimas numa
            coluna, separada das condenações criminais. O índice documental de
            contas não é contado como um caso nem como uma infracção.
          </p>
        </section>
        <section className="mt-8">
          <h3>O recurso pode mudar o desfecho</h3>
          <p>
            Uma sentença anulada ou revertida não entra na contagem de
            condenações mantidas nesta selecção. As absolvições, arquivamentos,
            prescrições, extinções e condenações anuladas mantêm classificações
            distintas. A prescrição não equivale a uma absolvição de mérito. Uma
            anulação com novo julgamento também não equivale a absolvição.
          </p>
          <p>
            O histórico conserva os marcos anteriores e os limites da informação
            recuperada. A falta de um desfecho localizado não comprova que o
            processo continue pendente na data de consulta.
          </p>
        </section>
        <section className="mt-8">
          <h3>Perdas de mandato administrativas</h3>
          <p>
            As decisões dos tribunais administrativos têm classificação própria.
            O levantamento histórico identifica também perdas deliberadas pelos
            próprios órgãos autárquicos no regime então aplicável e o respectivo
            controlo judicial. Essas deliberações não são apresentadas como
            sentenças originárias dos tribunais.
          </p>
          <p>
            Distinguimos a perda decretada da sua execução e dos recursos. As
            perdas revogadas ou anuladas e os pedidos rejeitados têm filtros
            próprios. A perda de mandato como pena acessória criminal permanece
            no processo criminal, sem duplicação na contagem administrativa.
          </p>
        </section>
        <section className="mt-8">
          <h3>Decisões internacionais</h3>
          <p>
            Os acórdãos do Tribunal Europeu dos Direitos Humanos têm grupo
            próprio. Uma condenação do Estado português por violação da
            Convenção não é apresentada como anulação automática de uma decisão
            nacional. A revisão interna e a execução internacional são descritas
            quando documentadas.
          </p>
        </section>
        <section className="mt-8">
          <h3>Ligação política com contexto</h3>
          <p>
            O filtro permite encontrar percursos políticos, incluindo antigos
            membros. Cada caso esclarece se a ligação é partidária, histórica,
            eleitoral ou governativa. O exercício de um cargo político não
            prova, por si, filiação num partido. A atribuição partidária exige
            fonte e respeita o período documentado.
          </p>
          <p>
            Para os gestores públicos, a ligação pode resultar de filiação
            comprovada ou do exercício de cargos políticos. Uma nomeação por uma
            entidade governada por um partido, sem outra prova, não permite
            atribuir militância. As funções, os períodos, a natureza da entidade
            e as fontes constam das fichas pessoais e dos processos.
          </p>
          <p>
            Autarcas independentes e percursos sem filiação atribuída têm um
            filtro próprio. Filiação não confirmada não significa candidatura
            independente. Decisões anónimas podem ser catalogadas por órgão e
            local sem criar uma identidade pessoal por inferência.
          </p>
        </section>
        <section className="mt-8">
          <h3>O que contam os números</h3>
          <p>
            Os totais contam casos catalogados, não crimes nem pessoas culpadas.
            Uma ficha pode incluir várias pessoas e vários partidos. Processos
            distintos da mesma pessoa têm fichas próprias e ligações entre si.
          </p>
          <p>
            Quando um processo tem resultados diferentes para intervenientes de
            partidos distintos, a síntese usa o desfecho documentado de cada
            partido. Mantém uma única ficha na respectiva linha. Se pessoas do
            mesmo partido tiverem resultados diferentes, a classificação
            condenatória documentada conserva-se no caso e os resultados
            individuais são explicados na ficha.
          </p>
          <p>
            A soma das linhas por partido pode exceder o total de casos únicos.
            Os registos não constituem uma amostra representativa e não permitem
            ordenar partidos pela incidência de criminalidade. A ausência de
            fichas não prova ausência de casos.
          </p>
        </section>
        <section className="mt-8">
          <h3>Datas e actualização informativa</h3>
          <p>
            A data principal identifica o marco descrito: decisão, notícia ou
            comunicado. Quando a fonte permite identificar apenas um ano ou mês,
            conserva-se essa precisão, sem inventar o dia. O histórico guarda a
            sequência processual.
          </p>
          <p>
            Esta integração reproduz a versão 21 do protótipo, extraída em{" "}
            {formatDate(manifest.extractedAt)}. A data de consulta de uma
            notícia antiga não certifica o estado actual de todos os processos.
            Novos casos, correcções e alterações de desfecho exigem pesquisa e
            revisão editorial. Esta edição não recebe automaticamente novas
            decisões.
          </p>
          <p>
            As ferramentas de inteligência artificial apoiam a pesquisa, a
            organização e a preparação técnica da informação, sob coordenação
            humana. A definição dos critérios, a avaliação das fontes, as
            correcções e a responsabilidade editorial pertencem às publicações
            responsáveis.
          </p>
          <p>
            <a
              href={`${PROTOTYPE}/pesquisa-historica-2026-11-20-r11.html`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Consultar o dossiê da pesquisa histórica mais recente
            </a>
          </p>
        </section>
        <section className="mt-8">
          <h3>Fotografias e participação</h3>
          <p>
            Foram transportadas {manifest.photographs} fotografias publicadas,
            com os créditos, as licenças ou a autorização constantes do arquivo
            de origem. A falta de fotografia é assinalada.
          </p>
          <p>
            A recepção e validação de novas fotografias continua na área de
            administração do protótipo. As ligações «Sugerir fotografia» abrem
            essa área, onde o leitor se identifica e apresenta a proposta. A
            fotografia só se torna pública após validação de Pedro Almeida
            Vieira ou de outro administrador autorizado. Abrir uma ligação não
            aprova nem publica uma imagem.
          </p>
          <p>
            Os dados de conta, as propostas pendentes e os registos privados de
            revisão não integram esta edição. A actualização das fotografias
            nesta página acompanha uma nova revisão do arquivo.
          </p>
          <p>
            <a
              href={`${PROTOTYPE}/#administracao`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Administração de fotografias
            </a>
          </p>
        </section>
        <section className="mt-8" id="ficha-tecnica">
          <h2>Ficha técnica</h2>
          <p>
            Casos de Política é um projecto editorial do{" "}
            <a href="https://paginaum.pt" className="text-primary underline">
              PÁGINA UM
            </a>{" "}
            e do CONTRAPROVA, dedicado à organização e consulta de informação
            documentada sobre a vida política portuguesa, com os mesmos
            critérios de escrutínio para todos os partidos.
          </p>
          <dl className="mt-5 space-y-4">
            <div>
              <dt className="text-[11px] uppercase tracking-wider text-stone-500">
                Responsável pelo site
              </dt>
              <dd>Pedro Almeida Vieira</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wider text-stone-500">
                Publicações responsáveis
              </dt>
              <dd>PÁGINA UM e CONTRAPROVA</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wider text-stone-500">
                Contacto editorial
              </dt>
              <dd>
                <a
                  href="mailto:pavieira@paginaum.pt"
                  className="text-primary underline"
                >
                  pavieira@paginaum.pt
                </a>
              </dd>
            </div>
          </dl>
          <p>
            Para comunicar uma incorrecção, indicar um desenvolvimento
            processual ou esclarecer direitos relativos a uma fotografia,
            identifique a ficha e, sempre que possível, a documentação
            relevante. As alterações estão sujeitas a verificação editorial.
          </p>
        </section>
        <section className="mt-8">
          <h3>Dados abertos</h3>
          <p>
            Descarregue as fichas, fontes, pessoas, partidos, estatutos
            processuais, penas e histórico em JSON ou CSV. Os filtros da
            listagem também se aplicam à descarga. As fontes e os limites
            acompanham os dados.
          </p>
          <Downloads />
          <div className="mt-3">
            <Downloads query="entidade=partidos" />
          </div>
          <p className="text-sm">
            A segunda linha descarrega o directório de partidos. O índice de
            pessoas também está disponível na{" "}
            <Link href={`${BASE}/pessoas`} className="text-primary underline">
              secção Pessoas
            </Link>
            .
          </p>
          <p className="text-sm text-stone-500">
            Origem: <SourceLink source={manifest.source} />. Organização
            documental inicialmente inspirada em{" "}
            <a href="https://jachega.org/" className="text-primary underline">
              Já Chega!
            </a>
            , com identidade própria e âmbito alargado, sem associação ao
            projecto de referência ou aos partidos mencionados.
          </p>
        </section>
      </div>
    </ProjectoShell>
  );
}
