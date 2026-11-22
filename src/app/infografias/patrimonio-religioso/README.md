# Infografia: património religioso

Infografia nativa de Next.js/React para explorar o levantamento documental do
PÁGINA UM entre 2022 e 19 de Novembro de 2026. Inclui pesquisa, filtros,
cartografia por concelho, etapas anuais, reprodução, fichas e exportação CSV.

## Origem e arquitectura

Os dados e o método provêm da versão editorial do [PR #89](https://github.com/pagina-um/p1-headless-next/pull/89),
commit `3a510931578ea3200e5b8655ff508953f6a24eda`, cujo documento de origem era
`public/projectos/patrimonio-religioso/infografia.html`. A implementação actual
usa componentes React e JSON locais, preservando os dados e o método aprovados.
Esta peça não acrescenta ficheiros a `public/` e não pertence ao registo de
projectos.

A página autónoma, `/infografias/patrimonio-religioso`, usa o cabeçalho e o
rodapé do jornal. A notícia é editada e publicada no WordPress e recebe a mesma
peça através do marcador descrito abaixo.

`_components/Infografia.tsx` é a entrada de servidor partilhada pela página e
pelo registo em `src/infografias/registry.ts`. Carrega `getInfographicData()` de
`_lib/data.ts`, limitado ao servidor. O loader associa cada registo ao concelho e
ao identificador regional, preservando os campos editoriais. O único ponto de
entrada interactivo, `_components/Infographic.client.tsx`, recebe os dados por
propriedades e gere pesquisa, filtros, cronologia e reprodução.

O mapa SVG, o gráfico anual, as fichas e a metodologia têm componentes próprios.
`_lib/timeline.ts` concentra os filtros e as regras temporais.
`_lib/presentation.ts` trata a apresentação, o estado no fragmento da ligação e
o CSV. A página e o artigo partilham estes componentes e os mesmos dados.

## Dados e método

| Ficheiro em `data/` | Conteúdo                                                                      |
| ------------------- | ----------------------------------------------------------------------------- |
| `igrejas.json`      | 123 registos sobre igrejas, património católico e sacerdotes.                 |
| `cemiterios.json`   | 83 registos relativos a 75 locais, num universo autónomo.                     |
| `tipologias.json`   | Rótulos, definições editoriais e contagens por categoria.                     |
| `metadados.json`    | Origem, data de corte e totais do levantamento.                               |
| `concelhos.json`    | 308 concelhos, geometrias e pontos cartográficos interiores.                  |
| `geografia.json`    | Regiões, associação entre registos e concelhos, fontes e método cartográfico. |

Contam-se identificadores de registos, que podem representar episódios ou séries.
Uma categoria principal por registo evita duplicações, mas um furto pode também
envolver danos. Os cemitérios incluem recintos municipais e de outras tradições
religiosas. As fontes documentais não constituem um censo nacional nem uma
estatística de crimes de ódio.

No modo anual, `C024` conserva o intervalo 2024–2025 e `CEM-083` o intervalo
2025–2026, apresentados à parte dos registos atribuídos a um ano. No acumulado,
cada um entra uma vez quando o final do intervalo fica abrangido. `CEM-033`
mantém a atribuição aproximada a 2024. Datas de publicação, descoberta ou alerta
conservam o seu papel e não passam a datas exactas do crime. O período de 2026 é
incompleto.

Os pontos do mapa representam concelhos, não os edifícios. A cartografia DGT/LNEG
usa escalas próprias para Continente, Açores e Madeira. A proveniência e os
limites de precisão encontram-se em `geografia.json`. Não se atribui uma edição
da CAOP que o serviço de origem não explicita.

## Inserir numa notícia

Depois de a infografia estar disponível no site, editar a notícia no WordPress:

1. No ponto do texto onde deve aparecer a peça, acrescentar um bloco **HTML
   personalizado**.
2. Colocar nesse bloco apenas o marcador seguinte.
3. Guardar ou actualizar a notícia e confirmar a apresentação no site.

```html
<div data-infografia="patrimonio-religioso"></div>
```

O parser comum em `src/utils/wpParsing.ts` reconhece o marcador e
`InfografiaInline` carrega o componente registado. A peça adapta-se à largura da
coluna do artigo e conserva os fragmentos de navegação da notícia. O título,
o texto, a imagem de abertura e a publicação da notícia continuam a ser geridos
no WordPress. O PR disponibiliza a infografia; a redacção escolhe a notícia e o
ponto de inserção do marcador.

## Manutenção e verificação

Preservar IDs, fontes, textos de verificação, intervalos e valores desconhecidos.
Uma actualização editorial deve rever os registos afectados, as categorias e os
metadados em conjunto. Novos locais exigem uma associação ao concelho correcto,
sem converter o ponto municipal numa localização exacta. O JSON deve continuar
formatado para revisão.

Se o período documental for alargado, actualizar também `YEARS` e os textos
que identificam o intervalo e o corte da recolha nos componentes de apresentação.

Os testes em `_lib/` verificam a preservação integral dos dados e da geografia da
origem aprovada através de hashes canónicos. Uma alteração editorial futura
exige uma nova referência aprovada e a actualização explícita desses testes.
A verificação cobre também contagens anuais e acumuladas, intervalos incertos,
Bicas, datas de referência, filtros e a inserção pelo marcador no artigo.
Existe um limite de 1 MB para o JSON efectivamente serializado para o cliente,
independente da indentação dos ficheiros em disco.

Executar na raiz do repositório:

```bash
npm test -- --runInBand src/app/infografias/patrimonio-religioso/_lib
npx tsc --noEmit
npm run lint
npm run build
```

O build depende do backend WordPress; sem esse acesso, seguir a verificação
local e o preview Vercel previstos em `AGENTS.md`.

Verificar a página autónoma e a inserção por marcador numa notícia, em ecrã
largo e a 390 px: filtros, pausa e reprodução, intervalos entre anos, fichas,
fontes e CSV. Uma página temporária de teste com `PostContent` deve ser retirada
antes do PR, conforme `docs/infografias/README.md`. Registar os resultados de
cada revisão no respectivo PR; esta lista não substitui a execução das
verificações.
