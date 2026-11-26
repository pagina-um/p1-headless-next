# Tribunal de Contas — varrimento histórico, primeiro lote

23 de Novembro de 2026. Revisão de Pedro Almeida Vieira. Âmbito pretendido: 25-04-1974 a 23-11-2026. **Levantamento incompleto, sem publicação.**

## Resultado e comparação

A base consultada contém 464 casos e 535 pessoas, incluindo 64 fichas de natureza Financeira com 126 identificadores pessoais distintos. Esses números não representam condenados: incluem absolvições, prescrições, responsabilidade relevada e dispensa de multa. O PR 88 está integrado. O original permanece em c20af92b25bb577657eb6bf0f48ce640ca453314 e o ramo de revisão foi conferido em c973612e1290450167bc72365b3fda409e647c38. Não foi encontrado PR aberto com «casos». Preservam-se os dossiers anteriores.

Foram confrontados nomes, localidades e processos com os JSON públicos e ficheiros de revisão. Baltasar Lopes, Luís Madureira, Francisco Luís da Mota e Vítor Manuel da Silva Amorim não constam desses registos. As propostas seguintes são revisão documental, não alterações automáticas da base.

## Nova pessoa e três processos para revisão: Baltasar Lopes

Nome completo: **Baltasar Moisés Barroso Lopes**, antigo presidente da Junta de Aldeia Viçosa, Guarda. A [acta de 27-12-2024](https://d11e74ea3d.clvaw-cdnwnd.com/22479174fbe0553f64754eca8c95bec4/200019863-9411394115/15._Ata_numero_dezembro_2024.pdf) identifica-o nominalmente na bancada do PS e como seu líder. Prova ligação política, não data de inscrição partidária nem filiação no momento de todos os factos. Não se deve projectar esta situação para mandatos anteriores sem outra fonte.

| Ficha proposta, inexistente | Decisão / processo | Conteúdo a registar | Definitividade e reservas |
| --- | --- | --- | --- |
| `aldeia-vicosa-baltasar-contas-2010` | 21/2013, 30-05-2013, 7/2012-PAM, 2.ª Secção | Duas multas de 1.428 euros, total 2.856 euros. Emolumentos separados: 343,28 euros. Omissões relativas às contas de 2010 | PDF oficial assinala trânsito. Não inventar a data do trânsito |
| `aldeia-vicosa-baltasar-documentos-2004-2008` | 56/2013, 17-12-2013, 38/2012-PAM, 2.ª Secção | Gerência de 2004: multa de 1.428 euros. Gerência de 2008: culpa declarada, com dispensa de pena. Emolumentos: 214,20 euros | PDF assinala trânsito. Preservar os dois resultados, sem chamar absolvição à dispensa |
| `aldeia-vicosa-baltasar-contas-2006` | 37/2014, 26-11-2014, 100/2013-PAM, 2.ª Secção | Gerência de 2006: multa de 1.428 euros, emolumentos de 214 euros. Gerência de 2003: procedimento prescrito | Publicada em 15-09-2016. Data de publicação não é data da sentença. Confirmar eventual recurso antes de fixar definitividade |

Fontes primárias abertas e lidas:

- [Sentença 21/2013, no TdC](https://www.tcontas.pt/pt-pt/ProdutosTC/Sentencas/2s/Documents/2013/st021-2013-2s.pdf) e [publicação de 07-02-2014 no DR](https://files.diariodarepublica.pt/2s/2014/02/027000000/0387903881.pdf).
- [Sentença 56/2013](https://www.tcontas.pt/pt-pt/ProdutosTC/Sentencas/2s/Documents/2013/st056-2013-2s.pdf). Contém ainda referência a condenação transitada de 16-09-2011, PAM 31/2011, multa de 510 euros. Conservada como antecedente, pendente de leitura do original.
- [Sentença 37/2014, publicada no DR em 2016](https://files.diariodarepublica.pt/2s/2016/09/178000000/2826628269.pdf).

A [notícia RTP/Lusa sobre as contas de 2010](https://www.rtp.pt/noticias/politica/ex-autarca-de-aldeia-vicosa-guarda-condenado-por-nao-entregar-contas-de-2010_n715267) apresenta no início 3.199,28 euros como multa, mas discrimina depois multas e emolumentos. A ficha deve usar a discriminação da sentença.

Campos anteriores: inexistentes. Campos propostos: `id`, `title`, `people`, `nature=Financeira`, `phase=Condenações financeiras`, `court`, `caseNumber`, `date`, `penalty`, `finality`, `sources`, `timeline` e `affiliation`, com as reservas acima. Reutilizar uma única pessoa `baltasar-moises-barroso-lopes` nas três fichas. A associação ao PS deve explicar que a prova consultada é de 2024. Decisão editorial: manter três processos separados ou agrupá-los numa ficha com cronologia, sem perder os números e desfechos individuais. Não classificar como corrupção, peculato ou apropriação de fundos.

## Condenações documentadas, inclusão retida

| Pessoa ou código | Decisão lida | Elemento em falta |
| --- | --- | --- |
| Francisco Luís da Mota, gerente do Hospital Concelhio da Povoação | Processo 2-MA, Açores, 09-11-1988: multa de 40.000 escudos acrescida de 25%, emolumentos separados de 1.500 escudos | Filiação partidária ou cargo político anterior e seguimento do processo não apurados |
| Luís Madureira, secretário-geral da Assembleia da República | Acórdão 61/97, 17-04-1997, recurso 1/97: confirma multa de 50.000 escudos do acórdão 5/97, processo 153/94, por pagamento após recusa de visto | O cargo administrativo não prova partido. Não foi encontrada prova suficiente de filiação |
| Vítor Manuel da Silva Amorim, Monte Redondo, Arcos de Valdevez | Sentença 10/2007, processo 3-M/2005: multa global de 1.496,40 euros por atraso nas contas | Filiação e eventual recurso por confirmar. Excluir resultados de homónimos, incluindo futebolista |
| F1, antigo presidente da Junta de Burgães | Sentença 8/2002, 19-04-2002: reposição reduzida para 1.300 euros, acrescida de juros nos termos do dispositivo | Identidade e partido ainda não fechados. Não atribuir o nome apenas pelo período do mandato |

Fontes: [DR de 29-11-1988](https://files.diariodarepublica.pt/gratuitos/2s/1988/11/2S276A0000S00.pdf), [DR de 17-05-1997](https://files.diariodarepublica.pt/gratuitos/2s/1997/05/2S114A0000S00.pdf), [sentença 10/2007](https://www.tcontas.pt/pt-pt/ProdutosTC/Sentencas/3s/Documents/2007/st010-2007-3s.pdf), [sentença 8/2002](https://www.tcontas.pt/pt-pt/ProdutosTC/Sentencas/3s/Documents/2002/st008-2002-3s.pdf).

## Exclusões que evitam falsos condenados

- **EMECB / Barcelos:** a [sentença 17/2026, de 25-09-2026](https://www.tcontas.pt/pt-pt/ProdutosTC/Sentencas/3s/Documents/2026/st017-2026-3s.pdf), processo 09/2025-JRF, julgou prescrito o procedimento e absolveu os três demandados dos pedidos. Resolve a pista deixada no dossier anterior. Não acrescentar à lista de condenações. Não equivale a decisão de mérito sobre a licitude dos actos.
- **Santo Tirso / subsídio ao Tirsense:** [sentença 17/2002, de 19-11-2002](https://www.tcontas.pt/pt-pt/ProdutosTC/Sentencas/3s/Documents/2002/st017-2002-3s.pdf), processo 1-JC/02, absolveu todos os demandados. Não se provou o destino do subsídio alegado pelo MP. Não atribuir condenação ao presidente ou aos vereadores por constarem do pedido inicial.

## Anonimização e BASE

O protocolo de identificação exige: número de processo ou contrato, entidade, período, acto individual e correspondência nominal verificável. A ocupação de um cargo, a vitória eleitoral de um partido ou a assinatura de outro contrato não bastam. O BASE pode localizar o contrato e os seus anexos, mas estes não demonstram, por si, quem foi condenado. Para factos antigos ou de prestação de contas, são necessárias actas, relações nominais, DR, tabelas judiciais ou notícias que liguem expressamente pessoa e decisão.

Este lote **não produziu uma nova identificação nominal através do BASE**. As seis correspondências já fechadas em VRSA-SGU/IPDJ e os limites da consulta BASE/Naturtejo continuam no [dossier anterior](2026-11-23-cruzamento-tdc.md), sem repetição como novas descobertas. Para Burgães falta uma ponte nominal para a sentença e confirmação de recurso. Para gestores públicos, a identificação judicial e a ligação partidária são verificações independentes.

## Cobertura e lacunas

O inventário anexo recolhe ligações dos índices oficiais, com origem e estado de leitura. **Documento inventariado não significa documento lido, condenação ou pessoa elegível.** As ligações foram deduplicadas por URL. Não pressupõe que o site publique todas as decisões existentes.

O índice corrente da 3.ª Secção lista anos de 2002 a 2026. O [relatório de actividade de 1999](https://www.tcontas.pt/pt-pt/Transparencia/PlaneamentoGestao/RelatoriosAnuaisAtividade/Documents/1999/ra1999.pdf) refere duas sentenças condenatórias em primeira instância, mostrando que o índice corrente não cobre toda a história. Não foram identificadas nominalmente essas duas decisões neste lote.

Pesquisa efectuada: índices das secções, documentos judiciais de 1988, 1997, 2002, 2007, 2013, 2014 e 2026, DR, acta autárquica e imprensa nacional/regional. Pesquisas textuais sobre 1975 e 1982 não forneceram decisão elegível verificada. Isso não prova ausência de condenações. Permanecem por inventariar integralmente 1974–2001, acórdãos regionais eventualmente fora destes índices, decisões não digitalizadas e recursos subsequentes. Permanecem por ler os documentos assinalados `por_ler` no inventário.

Próximas verificações documentais: originais dos antecedentes de Baltasar Lopes, prova partidária datada, identificação de Burgães, recursos dos casos pendentes e pesquisa histórica por anos no DR. Uma conclusão de exaustividade exigirá confrontar o inventário com os registos anuais do Tribunal. Não foram enviados pedidos a terceiros.

Nenhum dado público, fotografia, permissão, automatismo ou critério editorial foi alterado.

## Inventário e verificação técnica deste lote

Foram extraídas 1.019 ligações documentais distintas: 708 sentenças e 311 acórdãos, a partir de sete páginas de entrada e 80 índices anuais. Seis documentos inventariados têm o dispositivo e factos revistos neste lote. As decisões históricas do DR e a sentença 37/2014 lida no DR são complementares ao inventário. O JSON conserva cada índice e as lacunas de anos observadas. Não houve erros HTTP nas páginas de índice, o que não garante a disponibilidade de todos os PDFs.

O verificador dos dados passou nesta execução: 464 casos e 535 pessoas preservados. Não houve alterações de código ou dos dados públicos. Não se voltou a correr lint/build para esta entrega documental. O impedimento de configuração WordPress registado no dossier anterior não foi resolvido nem contornado. O dossier e inventário ficam no ramo de revisão, sem PR de alteração de dados nem publicação.
