# BioPulse — Painel de Formação em Biotecnologia (CEFET-MG)

Aplicação web local (client-side) para acompanhamento acadêmico do curso de
Bacharelado em Biotecnologia do CEFET-MG: estrutura curricular, notas e faltas,
CRA projetado, horários, pré-requisitos, planejador de optativas, calendário
acadêmico e atividades complementares.

Tudo roda **100% no navegador** e os dados do usuário são salvos no
**localStorage** (sem servidor, sem back-end).

---

## 🗂️ Estrutura de arquivos (arquitetura modular)

Este projeto foi modularizado a partir de um HTML único (monolítico) para
facilitar a manutenção e evitar reescritas gigantes a cada ajuste.

| Arquivo         | Papel                                                                 | Muda com frequência? |
|-----------------|-----------------------------------------------------------------------|----------------------|
| `index.html`    | Estrutura (markup)           das 4 páginas, nav, modal e footer. Amarra CSS/JS. | Em mudanças de layout |
| `styles.css`    | Todo o CSS, organizado por seções numeradas (índice no topo).         | Em ajustes visuais   |
| `data.js`       | Dados estáticos em `window.BP_DATA` (calendário, grade, ementas...).  | Quase nunca          |
| `particles.js`  | Motor de partículas + hélice de DNA em `window.BP_PARTICLES`.         | Nunca (estável)      |
| `app.js`        | Toda a lógica (notas, CRA, grafo, planejador, calendário, backups).   | Em mudanças de comportamento |
| `README.md`     | Este arquivo. Mapa do projeto e guia de manutenção.                   | Quando a arquitetura mudar |

---

## 🔗 Ordem de carregamento (OBRIGATÓRIA)

No final do `<body>` do `index.html`, os scripts são carregados **nesta ordem**:

html

São **scripts clássicos** (sem `type="module"`) de propósito: assim o app
funciona tanto com **duplo clique** no `index.html` (`file://`) quanto via
servidor local. Módulos ES seriam bloqueados no `file://`.

### Contrato entre os módulos
- `data.js` expõe **`window.BP_DATA`** — objeto somente com dados:
  `TOTAL_HA, SEM1, SEMS, OPTATIVAS, GNODES, GEDGES, CH_BY_NAME, SCHED,
  MONTHLY_DAYS_OFICIAL, OPT_CATALOGUE, CALENDAR_DB`.
- `particles.js` expõe **`window.BP_PARTICLES`** com:
  `init(canvas, opts)`, `resizeAll()`, `buildDNA()`, `enabled`.
- `app.js` lê os dados via `var D = window.BP_DATA;` e usa as partículas via
  `var P = window.BP_PARTICLES;`. Toda a lógica vive dentro de um único
  `DOMContentLoaded`.

---

## ▶️ Como rodar

Coloque os **6 arquivos na mesma pasta**. Depois, escolha uma opção:

### Opção A — Duplo clique (mais simples)
Abra o `index.html` no navegador. Funciona porque usamos scripts clássicos.

### Opção B — Servidor local (recomendado)
- **VS Code + Live Server:** clique direito no `index.html` → "Open with Live Server".
- **Python:** na pasta do projeto, rode `python3 -m http.server` e acesse
  `http://localhost:8000`.

> Os dados do usuário ficam no **localStorage** do navegador e persistem entre
> sessões, independentemente da forma de execução.

---

## ⚡ Partículas (efeitos de fundo) — como ligar/desligar

As animações de partículas ficam isoladas em `particles.js` e têm um
**interruptor mestre**. No topo do arquivo:

js var ENABLED = true; // true = ligado (padrão) | false = desligado

Trocar para `false` transforma `init`, `resizeAll` e `buildDNA` em "no-op"
(não fazem nada) — **zero consumo de CPU**, sem tocar em nenhum outro arquivo.
Os `<canvas class="biosoup">` continuam no HTML, porém inertes e invisíveis
(o layout não muda). O comentário no topo do `particles.js` explica em detalhe.

---

## 🛠️ Guia de manutenção (protocolo de edição)

Para edições rápidas e seguras, saiba **onde** cada tipo de mudança acontece:

| Tipo de mudança                         | Arquivo(s) a olhar                 |
|-----------------------------------------|------------------------------------|
| Cor, espaçamento, layout (visual)       | `styles.css` (+ `index.html` p/ achar a classe) |
| Texto/estrutura visível na tela         | `index.html`                       |
| Comportamento (cálculo, clique, render) | `app.js`                           |
| Dados (calendário, grade, ementas)      | `data.js`                          |
| Recurso novo visual + lógico            | `index.html` + `app.js` (+ `styles.css`) |

Dicas:
- O `styles.css` tem um **índice de seções** (01–23) no topo, com cabeçalhos
  `/* ===== ... ===== */` para localização rápida.
- Ao pedir um ajuste, **cite o texto visível** do elemento ou a **classe**
  (ex.: `.summary`, `.sim-chart`) para eliminar ambiguidade.
- Para arquivos grandes (`app.js`), prefira **edições cirúrgicas** (substituir
  só a função) em vez de reescrever o arquivo inteiro.

---

## 🧩 Mapa funcional do `app.js`

Principais blocos (procure pelos comentários `/* ===== ... ===== */`):

- **Tema** (claro/escuro, persistido)
- **Migração de dados** (`bp_dataversion`)
- **Grafo de pré-requisitos** (`layoutGraph`, `selectGraph`)
- **Notas & Faltas** (`renderNotas`, avaliações, faltas, CRA)
- **CRA / Integralização** (`realCRA`, `craSeries`, `drawCra`, `renderIntegr`)
- **Horários** (`schedTable`, `renderHorarios`)
- **Agenda** (`renderAgenda`)
- **Visão Geral** (`renderVisao`)
- **Complementares** (`renderComp`)
- **Planejador** (`renderPlanner`, drag & drop)
- **Calendário** (`renderCalendario`, `createDayCell`, `createEventPill`)
- **Modal de eventos/ementas** (`openEventDetailsModal`)
- **Kanban de optativas** (abre modal com a ementa)
- **Backups** (exportar/importar JSON, imprimir, limpar)

---

## 💾 Chaves de localStorage utilizadas

bp_faltas, bp_rooms, bp_opt, bp_plan, bp_curperiod, bp_notes, bp_evals, bp_comp, bp_agenda, bp_theme, bp_dataversion, bp_expanded

O botão de **backup** (menu de ferramentas, canto inferior direito) exporta
todas essas chaves para um `biopulse-backup.json`; o **import** restaura.

---

## 🌱 Git / branches

- `main` — versão monolítica (HTML único) estável.
- `refactor/modularizacao` — esta versão modular (6 arquivos).

Quando validada localmente, abrir Pull Request de `refactor/modularizacao` → `main`.

---

## ⚠️ Observações

- Datas, dias letivos e o calendário seguem a **Deliberação CGRAD nº 25/2026**
  (CEFET-MG, Belo Horizonte). **Sempre confirme** oferta, horários e critérios
  nos canais oficiais.
- Este é um app de apoio pessoal; não substitui os sistemas oficiais da
  instituição (ex.: SIGAA).

