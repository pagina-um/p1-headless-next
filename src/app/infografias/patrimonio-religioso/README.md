# Infografia: património religioso

Infografia nativa de Next.js/React para explorar o levantamento documental do
PÁGINA UM entre 2022 e 19 de Novembro de 2026. Inclui pesquisa, filtros,
cartografia por concelho, etapas anuais, reprodução, fichas e exportação CSV.

## Origem e arquitectura

Os dados e o método provêm da versão editorial do [PR #89](https://github.com/pagina-um/p1-headless-next/pull/89),
commit `3a510931578ea3200e5b8655ff508953f6a24eda`, cujo documento de origem era
`public/projectos/patrimonio-religioso/infografia.html`. A implementação actual
usa as rotas de `/infografias`, componentes React e JSON locais. Não requer
ficheiros HTML/CSS/JS autónomos em `public/` nem inscrição no registo de projectos.

| Rota                                      | Utilização                                                       |
| ----------------------------------------- | ---------------------------------------------------------------- |
| `/infografias/patrimonio-religioso`       | Página autónoma com cabeçalho e rodapé do jornal.                |
| `/infografias/patrimonio-religioso/embed` | A mesma infografia, sem essa moldura, para inserir numa notícia. |

Ambas as páginas usam `_components/Infografia.tsx`, a entrada de servidor também
registada em `src/infografias/registry.ts`. Esta carrega `getInfographicData()` de
`_lib/data.ts`, limitado ao servidor. O loader associa cada registo ao concelho e
ao identificador regional, preservando os campos editoriais.
`_components/Infographic.client.tsx` recebe os dados por propriedades e gere a
interacção. O mapa, o gráfico anual, as fichas e a
metodologia têm componentes próprios. `_lib/timeline.ts` concentra os filtros e
as regras temporais. `_lib/presentation.ts` trata a apresentação, o estado no
fragmento da ligação e o CSV.

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

O mecanismo comum introduzido no repositório permite inserir a peça directamente
no artigo através de um bloco **HTML personalizado**:

```html
<div data-infografia="patrimonio-religioso"></div>
```

`InfografiaInline` carrega o componente registado. Esta apresentação adapta-se à
coluna do artigo, usa um título `h2` e conserva os fragmentos de navegação da
notícia. Não inclui o cabeçalho nem o rodapé do site.

Esta contribuição conserva também a rota `/embed` e a integração por iframe
expressamente pedidas para substituir o PR #89. Essa compatibilidade adicional
é uma instrução do pedido, embora o contrato de infografias entretanto publicado
prefira o marcador acima. Não é necessário acrescentar scripts ao artigo:

```html
<iframe
  src="/infografias/patrimonio-religioso/embed"
  title="Património religioso: mapa, tipologias e cronologia"
></iframe>
```

O tratamento é comum às infografias nativas: `src/utils/wpParsing.ts` reconhece
as rotas `/infografias/<slug>/embed` e usa `InfographicFrame`, em
`src/components/infografias/`. As ligações canónicas são normalizadas para o
domínio da página, incluindo nos previews. O hook `useInfographicHeight`
comunica a altura à página que incorpora a infografia. O iframe cresce e
encolhe quando se abrem fichas ou mudam os resultados. O protocolo valida a
origem e a janela emissora.
Os restantes embeds mantêm o tratamento habitual do parser.

## Manutenção e verificação

Preservar IDs, fontes, textos de verificação, intervalos e valores desconhecidos.
Uma actualização editorial deve rever os registos afectados, as categorias e os
metadados em conjunto. Novos locais exigem uma associação ao concelho correcto,
sem converter o ponto municipal numa localização exacta. O JSON deve continuar
formatado para revisão.

Se o período documental for alargado, actualizar também `YEARS` e os textos
que identificam o intervalo e o corte da recolha nos componentes de apresentação.

Os testes de preservação reconstituem integralmente os dados e a geografia da
origem aprovada por hashes canónicos. Uma alteração editorial futura exige uma
nova referência aprovada e a actualização explícita desses testes. Os testes do
motor cobrem contagens anuais e acumuladas, intervalos incertos, Bicas, datas de
referência e filtros. Existe também um limite de 1 MB para o JSON efectivamente
serializado para o cliente, independente da indentação dos ficheiros em disco.

Executar na raiz do repositório:

```bash
npm test -- --runInBand src/app/infografias/patrimonio-religioso/_lib src/components/infografias src/utils/wpParsing.infografias.test.ts
npx tsc --noEmit
npm run lint
npm run build
```

Verificar as duas rotas e a inserção por marcador e por iframe numa notícia, em
ecrã largo e a 390 px:
filtros, pausa e reprodução, intervalos entre anos, fichas, fontes, CSV e ajuste
da altura do iframe. Registar os resultados de cada revisão no respectivo PR.
