interface MethodologyProps {
  onInteract: () => void;
}

export function Methodology({ onInteract }: MethodologyProps) {
  return (
    <details
      className="rounded-md border border-gray-200 bg-white p-5"
      onToggle={onInteract}
    >
      <summary className="cursor-pointer font-serif text-lg font-bold text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
        Como ler esta infografia
      </summary>
      <div className="mt-5 max-w-3xl space-y-6 text-base leading-relaxed text-stone-700">
        <section>
          <h3 className="font-serif !text-lg !font-bold text-stone-900">
            O que está a ser contado
          </h3>
          <p className="!mt-2">
            O levantamento principal reúne 123 registos sobre igrejas, capelas,
            património católico e sacerdotes. O levantamento autónomo dos
            cemitérios reúne 83 registos em 75 locais. Um registo pode descrever
            um episódio ou uma série individualizada. Estes totais não equivalem
            a edifícios distintos, a condenações ou a crimes de ódio.
          </p>
        </section>
        <section>
          <h3 className="font-serif !text-lg !font-bold text-stone-900">
            Dois modos de acompanhar o tempo
          </h3>
          <p className="!mt-2">
            No modo “Registos do ano”, a contagem principal inclui os registos
            atribuídos ao ano escolhido. Quando a fonte só permite um intervalo
            entre anos, o caso aparece à parte nas etapas compatíveis, mantendo
            o mesmo identificador. Não é contado como um acontecimento certo em
            cada ano.
          </p>
          <p className="!mt-3">
            No modo “Acumulado desde 2022”, cada registo entra uma única vez na
            contagem principal quando o final do seu intervalo temporal fica
            abrangido. Enquanto esse intervalo cruza o ano seleccionado, o caso
            mantém-se separado como possível. O crescimento do acumulado resulta
            da soma ao longo do tempo e não demonstra um aumento da frequência
            dos acontecimentos.
          </p>
        </section>
        <section>
          <h3 className="font-serif !text-lg !font-bold text-stone-900">
            A precisão que as fontes permitem
          </h3>
          <p className="!mt-2">
            As fichas conservam o dia, o mês, o ano aproximado ou o intervalo
            que constam da documentação. A data da notícia, da descoberta, do
            alerta ou de uma decisão posterior é identificada como tal. As
            etapas anuais não transformam essas referências numa data exacta do
            acontecimento.
          </p>
        </section>
        <section>
          <h3 className="font-serif !text-lg !font-bold text-stone-900">
            Tipologias e cobertura
          </h3>
          <p className="!mt-2">
            As categorias principais constituem uma classificação editorial das
            descrições, incluindo suspeitas e desaparecimentos. Um furto ou uma
            tentativa pode também envolver danos. Os cemitérios incluem recintos
            municipais e de outras tradições religiosas. As fontes individuais
            podem usar qualificações diferentes, que se conservam nas fichas.
          </p>
          <p className="!mt-3">
            A distribuição anual depende da cobertura e da documentação
            localizada. A pesquisa termina em 19 de Novembro de 2026 e não
            constitui uma série estatística nacional da criminalidade.
          </p>
        </section>
        <section>
          <h3 className="font-serif !text-lg !font-bold text-stone-900">
            Localização e fontes
          </h3>
          <p className="!mt-2">
            A cartografia usa áreas administrativas oficiais DGT / LNEG. Os
            pontos são âncoras cartográficas interiores de cada concelho,
            calculadas a partir dessas áreas, e não coordenadas verificadas dos
            edifícios. Continente, Açores e Madeira têm escalas próprias. Nas
            ilhas, as freguesias foram agrupadas por concelho. A edição da CAOP
            não é atribuída porque o serviço consultado não a explicita.
          </p>
          <p className="!mt-3">
            As ligações de cada ficha remetem para as fontes do levantamento. A
            identificação de um suspeito ou a referência a uma investigação não
            constitui prova de culpa.
          </p>
        </section>
      </div>
    </details>
  );
}
