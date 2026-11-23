# Projectos especiais

Um **projecto especial** é uma secção autónoma do paginaum.pt: um arquivo, um
observatório, uma base de dados com pesquisa. Vive dentro do site, com o
cabeçalho, o rodapé e a tipografia do Página UM, em vez de ser um site à parte.
O [Corpus](https://corpus.paginaum.pt) é o exemplo externo; o Arquivo Político
é o primeiro feito por este caminho.

Este documento é o contrato. Quem (pessoa ou modelo) cria um projecto segue-o
à letra; o revisor confere-o antes de aceitar o PR. Leia antes o `AGENTS.md`
na raiz do repositório (regras gerais, ortografia, como entra o trabalho) e o
`docs/design.md` (como o site deve parecer).

## Onde vive cada coisa

| O quê | Onde |
| --- | --- |
| As páginas do projecto | `src/app/projectos/<slug>/` |
| O registo do projecto (nome, lema, cor, ícone, data) | `src/projectos/registry.ts`, lista `PROJECTOS` |
| Onde o projecto é promovido (faixa do topo, bloco da homepage) | `src/config/destaques.ts` |
| A moldura comum (cabeçalho do projecto, navegação, rodapé) | `src/components/projectos/ProjectoShell.tsx` |
| O cartão usado em `/projectos` e na homepage | `src/components/projectos/ProjectoCard.tsx` |
| O modelo para copiar | `docs/projectos/template/` |

O URL público é `https://paginaum.pt/projectos/<slug>`. A lista de todos os
projectos está em `https://paginaum.pt/projectos` e é gerada a partir do
registo.

Dentro da pasta do projecto:

```
src/app/projectos/<slug>/
├── page.tsx              página principal (Síntese)
├── casos/page.tsx        uma pasta por secção, cada uma com page.tsx
├── metodo/page.tsx
├── _components/          componentes só deste projecto
└── data/                 os dados, em JSON
```

## Criar um projecto, passo a passo

1. Escolha o `slug`: só letras minúsculas sem acentos, números e hífens
   (`arquivo-politico`). É o nome da pasta, o segmento do URL e a chave no
   registo. Tem de ser igual nos três sítios.
2. Copie `docs/projectos/template/` para `src/app/projectos/<slug>/` e mude a
   constante `SLUG` no `page.tsx`.
3. Acrescente o projecto à lista `PROJECTOS` em `src/projectos/registry.ts`.
   Os campos estão comentados no ficheiro. A cor segue o `docs/design.md`:
   uma cor saturada e a sua variante escura, nem vermelho, nem âmbar, nem o
   verde do Corpus.
4. Ponha os dados em `data/*.json`, um ficheiro por tipo de entidade
   (`casos.json`, `partidos.json`, `pessoas.json`). Todos os registos do mesmo
   ficheiro têm os mesmos campos. Datas em `AAAA-MM-DD`. Cada registo com
   fonte (`{ "label": "...", "href": "..." }`).
5. Construa as secções. Cada secção é uma pasta com `page.tsx` que usa
   `<ProjectoShell slug={SLUG} nav={NAV}>` e devolve só o conteúdo. A lista
   `NAV` é a mesma em todas as páginas do projecto. Dentro da moldura, `h2`,
   `h3`, `p`, `ul`, `ol` e `table` simples já ficam formatados; não lhes
   ponha classes de tamanho de letra.
6. Para promover o projecto, edite `src/config/destaques.ts`:
   - `banner` é a faixa colorida por baixo do cabeçalho, em todas as páginas.
   - `blocoHomepage` é o projecto que o bloco "Projecto em destaque" mostra
     na grelha da homepage. O bloco em si é adicionado à grelha por quem tem
     acesso a `/admin`; o PR só escolhe o projecto.
7. Verifique (secção abaixo) e abra o PR.

## O que não fazer

- Não instalar dependências. Se parecer indispensável, pergunte no PR antes.
- Não tocar no WordPress, no GraphQL, no Redis, em `src/app/api/`, em
  variáveis de ambiente nem em `src/middleware.ts`.
- Não editar ficheiros fora de `src/app/projectos/<slug>/`,
  `public/projectos/<slug>/`, `src/projectos/registry.ts` e
  `src/config/destaques.ts`. Se o projecto precisar de outra coisa, explique
  no PR e deixe o revisor decidir.
- Não alterar `src/styles/globals.css` nem o `tailwind.config.js`.
- Não usar `"use client"` a não ser no componente que precisa de reagir ao
  leitor (pesquisa, filtros, ordenação). Esse componente recebe os dados por
  propriedade; não vai buscá-los à rede.
- Não passar ficheiros de dados grandes (mais de 1 MB) a um componente
  `"use client"`: tudo o que ele recebe vai para o browser do leitor. Pagine
  ou pré-filtre no servidor.
- Não inventar dados, nomes nem fontes. Falta um dado? Fica em branco.
- Nada de fotografias de pessoas sem autorização confirmada.

## Verificar antes do PR

Na raiz do repositório:

```bash
npm install
npx tsc --noEmit
npm run lint
npm run build
```

Os três comandos têm de terminar sem erros. Depois, `npm run dev` e abrir
`http://localhost:3000/projectos/<slug>` num ecrã largo e a 390 px de
largura. Confirme que `/projectos` lista o projecto e que a faixa e o bloco
mostram o que `destaques.ts` manda.

## O PR

O trabalho é feito num ramo do próprio repositório, quando se tem acesso de
escrita, ou num *fork* quando não se tem, e entra por pull request para
`main` (ver `AGENTS.md`).

- Ramo `projecto/<slug>` a partir de `main` actualizado.
- Um projecto por PR. Alterações a um projecto existente vão em PRs próprios,
  em ramos `projecto/<slug>-<o-que-muda>`.
- Título: `Projecto: <nome do projecto>`.
- Descrição, neste modelo:

```
## O que é
Uma frase sobre o projecto e o que o leitor pode fazer nele.

## Secções
- /projectos/<slug> (Síntese): ...
- /projectos/<slug>/casos: ...

## Dados
Origem, data de extracção, número de registos por ficheiro, o que falta.

## Promoção
Faixa do topo: sim/não. Bloco da homepage: sim/não.

## Verificação
tsc, lint e build sem erros; testado a 390 px e em ecrã largo.

## Fora deste PR
O que fica para depois, ou o que precisa de decisão do revisor.
```

Depois do merge, a Vercel publica sozinha. O bloco da homepage só aparece
quando alguém com acesso a `/admin` o adiciona à grelha e grava.
