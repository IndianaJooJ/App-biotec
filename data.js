/* ============================================================
   DATA.JS — Dados Estáticos e Matrizes Curriculares (BioPulse)
   
   ÍNDICE E ESTRUTURA DO ARQUIVO:
   1. TOTAL DE HORAS DO CURSO (Linha 16)
   2. MATRIZ CURRICULAR DO 1º PERÍODO / SEM1 (Linha 20)
   3. MATRIZ CURRICULAR DOS PERÍODOS 2 AO 9 / SEMS (Linha 32)
   4. LISTA DE OPTATIVAS PARA O PAINEL (Linha 105)
   5. GRAFO DE PRÉ-REQUISITOS (Nós e Arestas) (Linha 118)
   6. CARGA HORÁRIA DAS OPTATIVAS DO PLANEJADOR (Linha 140)
   7. GRADE DE HORÁRIOS PADRÃO (1º Período) (Linha 148)
   8. DIAS LETIVOS OFICIAIS / DELIBERAÇÃO CGRAD (Linha 163)
   9. CATÁLOGO DE EMENTAS DAS OPTATIVAS (Linha 167)
   10. BASE DE DADOS DO CALENDÁRIO ACADÊMICO (Linha 185)
   11. EXPOSIÇÃO GLOBAL WINDOW.BP_DATA (Linha 280)
   ============================================================ */

(function () {
  "use strict";

  /* ---- 1. Total de horas/aula do curso ---- */
  var TOTAL_HA = 3960;

  /* ---- 2. 1º período (Ordem e matriz oficial do PDF do CEFET-MG) ---- */
  var SEM1 = [
    { cod: 'G00BIOE1.01', nome: 'Bioestatística I', ch: 30, dept: 'decom' },
    { cod: 'G00BCEL0.01', nome: 'Biologia Celular', ch: 60, dept: 'debio' },
    { cod: 'G00QUIM1.01', nome: 'Química Geral', ch: 60, dept: 'dequi' },
    { cod: 'G00BFLA0.01', nome: 'Biossegurança e Fundamentos de Laboratório', ch: 30, dept: 'debio' },
    { cod: 'G00LQUI1.01', nome: 'Laboratório de Química Geral', ch: 30, dept: 'dequi' },
    { cod: 'G00CSPB0.01', nome: 'Contexto Social e Profissional da Biotecnologia', ch: 30, dept: 'dcsf' },
    { cod: 'G00FITE0.01', nome: 'Filosofia da Tecnologia', ch: 30, dept: 'dcsf' },
    { cod: 'G00PAOR0.01', nome: 'Psicologia Aplicada às Organizações', ch: 30, dept: 'dcsf' }
  ];

  /* ---- 3. Períodos 2 a 9: [Nome, CH, Código, Departamento] (Ordem do PDF) ---- */
  var SEMS = {
    '2': [
      ['Bioestatística II', 30, 'G00BIOE2.01', 'decom'],
      ['Histologia Geral Humana', 60, 'G00HGHU0.01', 'debio'],
      ['Estrutura e Propriedades dos Compostos Orgânicos', 60, 'G00EPCO1.01', 'dequi'],
      ['Segurança e Regulamentação em Biotecnologia', 30, 'G00SRBI0.01', 'debio'],
      ['Introdução à Sociologia', 30, 'G00INSO0.01', 'dcsf'],
      ['Metodologia Científica', 30, 'G00MCIE1.01', 'dcsa'],
      ['Microbiologia Geral', 60, 'G00MGER0.01', 'debio']
    ],
    '3': [
      ['Bioética', 30, 'G00BETI0.01', 'dcsf'],
      ['Bioquímica Básica', 60, 'G00BBAS0.01', 'debio'],
      ['Genética Básica e Citogenética', 60, 'G00GBC10.01', 'debio'],
      ['Instrumentação em Microbiologia', 30, 'G00IMIC0.01', 'debio'],
      ['Imunologia Básica', 60, 'G00IBAS0.01', 'debio'],
      ['Metodologia da Pesquisa', 30, 'G00MPES0.05', 'dcsa'],
      ['Optativas', 30, 'OPT', 'deteq']
    ],
    '4': [
      ['Fisiologia Geral Humana', 60, 'G00FGHU0.01', 'debio'],
      ['Química Analítica Teórica', 30, 'G00QATE0.01', 'dequi'],
      ['Química Analítica Prática', 30, 'G00QAPR0.01', 'dequi'],
      ['Imunologia Aplicada', 30, 'G00IAPL0.01', 'debio'],
      ['Bioquímica Aplicada', 60, 'G00BQAP0.01', 'debio'],
      ['Genética Aplicada', 60, 'G00GEAP0.01', 'debio'],
      ['Optativas', 60, 'OPT', 'deteq']
    ],
    '5': [
      ['Fundamentos em Farmacologia', 60, 'G00FFAR0.01', 'debio'],
      ['Introdução à Bioinformática', 60, 'G00IBIO0.01', 'decom'],
      ['Morfofisiologia Vegetal', 60, 'G00MVEG0.01', 'debio'],
      ['Biologia Molecular Aplicada', 60, 'G00BMAP0.01', 'debio'],
      ['Optativas', 60, 'OPT', 'deteq']
    ],
    '6': [
      ['Parasitologia Aplicada', 60, 'G00PAPL0.01', 'debio'],
      ['Biotecnologia Vegetal', 60, 'G00BVEG0.01', 'debio'],
      ['Biotecnologia Animal', 60, 'G00BANI0.01', 'debio'],
      ['Biofísica', 60, 'G00BIOF0.01', 'df'],
      ['Engenharia Metabólica', 60, 'G00ENME0.01', 'debio']
    ],
    '7': [
      ['Nanobiotecnologia', 30, 'G00NBIO0.01', 'debio'],
      ['Biotecnologia Humana', 60, 'G00BHUM0.01', 'debio'],
      ['Ecotoxicologia', 60, 'G00ETOX0.01', 'dcta'],
      ['Tecnologia de Fermentações e Bioprocessos', 60, 'G00TFBI0.01', 'debio'],
      ['Optativas', 60, 'OPT', 'deteq']
    ],
    '8': [
      ['Genômica e Pós-Genômica', 30, 'G00GPGE0.01', 'debio'],
      ['Empreendedorismo – Modelo e Plano de Negócios', 60, 'G00EMPN0.01', 'dcsa'],
      ['Atividade de TCC I', 15, 'G00ATCC1.03', 'debio'],
      ['Optativas', 150, 'OPT', 'deteq']
    ],
    '9': [
      ['Atividade de Estágio Supervisionado', 15, 'G00AESU0.02', 'dcsa'],
      ['Atividade de TCC II', 15, 'G00ATCC2.03', 'debio'],
      ['Optativas', 60, 'OPT', 'deteq']
    ]
  };

  /* ---- 4. Lista de optativas (dropdown da aba Notas) ---- */
  var OPTATIVAS = [
    'Biomimética (30 h/a)', 'Inglês Instrumental I (30 h/a)', 'Inglês Instrumental II (30 h/a)',
    'Biotelemetria (60 h/a)', 'Biotecnologia Médica (30 h/a)', 'Proteínas Recombinantes (30 h/a)',
    'Engenharia Genética e Terapia Gênica (30 h/a)', 'Etnofarmacologia/Farmacogenética (30 h/a)',
    'Biotecnologia Farmacêutica (60 h/a)', 'Tecnologia de Desenvolvimento de Vacinas (30 h/a)',
    'Empreendedorismo p/ Organizações Criativas (60 h/a)', 'Biotecnologia Aplicada à Microbiologia (60 h/a)',
    'Interação Patógeno-Hospedeiro (60 h/a)'
  ];

  /* ---- 5. Nós do grafo de pré-requisitos ---- */
  var GNODES = [
    { id: 'bioq', n: 'Bioquímica Básica', p: 3, row: 0 }, { id: 'gen', n: 'Genética Básica', p: 3, row: 1 },
    { id: 'imb', n: 'Imunologia Básica', p: 3, row: 2 }, { id: 'fis', n: 'Fisiologia Humana', p: 4, row: 0 },
    { id: 'bioqa', n: 'Bioquímica Aplicada', p: 4, row: 1 }, { id: 'gena', n: 'Genética Aplicada', p: 4, row: 2 },
    { id: 'ima', n: 'Imunologia Aplicada', p: 4, row: 3 }, { id: 'farm', n: 'Farmacologia', p: 5, row: 1 },
    { id: 'bmol', n: 'Bio. Molecular Apl.', p: 5, row: 0 }, { id: 'bioinf', n: 'Bioinformática', p: 5, row: 2 },
    { id: 'btele', n: 'Biotelemetria', p: 5, row: 3, opt: true }, { id: 'biof', n: 'Biofísica', p: 6, row: 0 },
    { id: 'paras', n: 'Parasitologia', p: 6, row: 1 }, { id: 'nano', n: 'Nanobiotecnologia', p: 7, row: 0 },
    { id: 'bmed', n: 'Biotec. Médica', p: 7, row: 1, opt: true }, { id: 'prot', n: 'Proteínas Recomb.', p: 7, row: 2, opt: true },
    { id: 'eng', n: 'Eng. Genética', p: 8, row: 0, opt: true }, { id: 'farmg', n: 'Farmacogenética', p: 8, row: 1, opt: true },
    { id: 'bfarm', n: 'Biotec. Farmacêutica', p: 8, row: 2, opt: true }, { id: 'biom', n: 'Biomimética', p: 3, row: 4, opt: true },
    { id: 'ing1', n: 'Inglês Instrumental I', p: 3, row: 5, opt: true }, { id: 'ing2', n: 'Inglês Instrumental II', p: 4, row: 4, opt: true },
    { id: 'empr', n: 'Empreendedorismo', p: 8, row: 3, opt: true }
  ];

  /* ---- Arestas do grafo (pré-requisito -> destrava) ---- */
  var GEDGES = [
    ['bioq', 'bioqa'], ['bioqa', 'bmol'], ['bioqa', 'prot'], ['bmol', 'prot'], ['bmol', 'eng'],
    ['fis', 'btele'], ['fis', 'paras'], ['gen', 'gena'], ['gena', 'farmg'], ['farm', 'farmg'],
    ['farm', 'bfarm'], ['bmol', 'bfarm'], ['ima', 'bmed'], ['paras', 'bmed'], ['farm', 'bmed'],
    ['imb', 'ima'], ['ing1', 'ing2']
  ];

  /* ---- 6. Carga horária das optativas do planejador (por nome do nó) ---- */
  var CH_BY_NAME = {
    'Biomimética': 30, 'Inglês Instrumental I': 30, 'Inglês Instrumental II': 30, 'Biotelemetria': 60,
    'Biotec. Médica': 30, 'Proteínas Recomb.': 30, 'Eng. Genética': 30, 'Farmacogenética': 30,
    'Biotec. Farmacêutica': 60, 'Empreendedorismo': 60
  };

  /* ---- 7. Grade de horários do 1º período ---- */
  var SCHED = {
    head: ['Horário', 'SEG · NS', 'TER · NS', 'QUA · NS', 'QUI · NG', 'SEX · NS'],
    rows: [
      { t: '19:00–20:40', cells: [
        { c: 'G00QUIM1.01', n: 'Química Teórica', p: 'Claudinei Calado', rk: 'seg1', rd: '421', cp: 'ns' },
        { c: 'G00PAOR0.01', n: 'Psicologia Apl. às Organizações', p: 'Thiago Nunes', rk: 'ter1', rd: '421', cp: 'ns' },
        { c: 'G00BCEL0.01 / G00BFLA0.01', n: 'Bio. Celular Prát. (T1) / Biosseg. Prát. (T2)', p: 'L. M. Costa Moreira / M. M. Drumond', rk: 'qua1', rd: 'Lab 208 / 209', cp: 'ns' },
        { c: 'G00LQUI1.01 / G00BIOE1.01', n: 'Lab. Química (T1) / Bioestatística I (T2)', p: 'Eudes Lourenço / M. M. Drumond', rk: 'qui1', rd: 'Lab 205 / 121A', cp: 'ng' },
        { c: 'G00QUIM1.01', n: 'Química Teórica', p: 'Claudinei Calado', rk: 'sex1', rd: '421', cp: 'ns' }
      ] },
      { t: '20:50–22:30', cells: [
        { c: 'G00BCEL0.01', n: 'Biologia Celular Teórica', p: 'Thiago Cotta Ribeiro', rk: 'seg2', rd: '421', cp: 'ns' },
        { c: 'G00CSPB0.01', n: 'Contexto Social e Prof. da Biotec.', p: 'Leila S. Ortega / Raquel C. S. Chagas', rk: 'ter2', rd: '421', cp: 'ns' },
        { c: 'G00BCEL0.01 / G00BFLA0.01', n: 'Bio. Celular Prát. (T2) / Biosseg. Prát. (T1)', p: 'L. M. Costa Moreira / M. M. Drumond', rk: 'qua2', rd: 'Lab 208 / 209', cp: 'ns' },
        { c: 'G00LQUI1.01 / G00BIOE1.01', n: 'Lab. Química (T2) / Bioestatística I (T1)', p: 'Eudes Lourenço / M. M. Drumond', rk: 'qui2', rd: 'Lab 205 / 121A', cp: 'ng' },
        { c: 'G00FITE0.01', n: 'Filosofia da Tecnologia', p: 'Huener Silva Gonçalves', rk: 'sex2', rd: '421', cp: 'ns' }
      ] }
    ]
  };

  /* ---- 8. Dias letivos oficiais por mês (Deliberação CGRAD 25/2026) ---- */
  var MONTHLY_DAYS_OFICIAL = { 7: 0, 8: 22, 9: 25, 10: 25, 11: 22, 12: 6 };

  /* ---- 9. Catálogo de ementas das optativas (modal do Kanban) ---- */
  var OPT_CATALOGUE = {
    biom: { code: 'G00BIOM0.01', title: 'Biomimética', dept: 'DEBIO', hours: '30 h/a', credits: '2', color: '--debio-color', prereqs: 'Nenhum', desc: 'Princípios e leis de organização dos sistemas biológicos como modelos para engenharia e design. Estudo de superfícies funcionais, biossensores mecânicos e estruturas adaptativas inspiradas na fauna e flora.' },
    empr: { code: 'G00EOC00.01', title: 'Empreendedorismo para Organizações Criativas', dept: 'DCSA', hours: '60 h/a', credits: '4', color: '--dcsa-color', prereqs: 'Nenhum', desc: 'Gestão de negócios voltados às indústrias biotecnológicas e criativas. Elaboração de planos de negócios, captação de recursos de inovação tecnológica, estruturação de startups (spin-offs acadêmicas) e propriedade intelectual.' },
    ing1: { code: 'G00IIN10.01', title: 'Inglês Instrumental I', dept: 'DCSF', hours: '30 h/a', credits: '2', color: '--dcsf-color', prereqs: 'Nenhum', desc: 'Desenvolvimento de competência leitora de artigos científicos e especificações técnicas de bioinformática e química na língua inglesa. Análise lexical e sintática aplicada ao discurso acadêmico internacional.' },
    libr: { code: 'G00LIBR0.01', title: 'Língua Brasileira de Sinais - Libras I', dept: 'DCSF', hours: '30 h/a', credits: '2', color: '--dcsf-color', prereqs: 'Nenhum', desc: 'Aspectos históricos, sociolinguísticos e culturais da surdez e da comunidade surda brasileira. Aquisição de vocabulário e estruturas sintáticas básicas de comunicação científica em Libras.' },
    semi: { code: 'G00FSE00.01', title: 'Fundamentos de Semiótica', dept: 'DCSF', hours: '30 h/a', credits: '2', color: '--dcsf-color', prereqs: 'Nenhum', desc: 'Teorias do signo, representação e significação na ciência moderna. Leitura crítica de símbolos científicos, diagramas metabólicos e semiose na produção e transmissão de dados genômicos.' },
    bta: { code: 'G00BTA00.01', title: 'Biotecnologia Aplicada à Microbiologia', dept: 'DETEQ', hours: '60 h/a', credits: '4', color: '--deteq-color', prereqs: 'Microbiologia Geral (G00MBG)', desc: 'Manipulação e cultivo de fungos, leveduras e bactérias industriais. Fermentações em estado sólido e líquido, seleção de cepas selvagens e modificadas por mutagênese ou engenharia para síntese de bioativos.' },
    ing2: { code: 'G00IIN20.01', title: 'Inglês Instrumental II', dept: 'DCSF', hours: '30 h/a', credits: '2', color: '--dcsf-color', prereqs: 'Inglês Instrumental I (G00IIN1)', desc: 'Redação científica internacional na língua inglesa. Elaboração estruturada de resumos, redação de papers e apresentação oral de banners em congressos e eventos internacionais de Biotecnologia.' },
    iph: { code: 'G00IPH00.01', title: 'Interação Patógeno-Hospedeiro', dept: 'DEBIO', hours: '60 h/a', credits: '4', color: '--debio-color', prereqs: 'Imunologia Aplicada (G00IMA)', desc: 'Mecanismos moleculares de invasão de patógenos virais, fúngicos e bacterianos em células hospedeiras. Processos de escape imunológico e modelagem de alvos terapêuticos e biosensores diagnósticos.' },
    btef: { code: 'G00BTEF0.01', title: 'Biotelemetria', dept: 'DEBIO', hours: '60 h/a', credits: '4', color: '--debio-color', prereqs: 'Fisiologia Geral Humana (G00FGH) + Biossegurança (G00BFL)', desc: 'Medição eletrônica de sinais biológicos a distância. Captação de biopotenciais (EEG, ECG, EMG), desenvolvimento de módulos transmissores sem fio, processamento de sinais fisiológicos e blindagem de interferência eletromagnética.' },
    btm: { code: 'G00BTM00.01', title: 'Biotecnologia Médica', dept: 'DEBIO', hours: '30 h/a', credits: '2', color: '--debio-color', prereqs: 'Imunologia Aplicada (G00IMA) + Farmacologia (G00FAF)', desc: 'Desenvolvimento e design de dispositivos diagnósticos miniaturizados (Lab-on-a-chip), biomateriais biocompatíveis para próteses, terapias celulares baseadas em células-tronco e engenharia de tecidos biológicos.' },
    btf: { code: 'G00BTF00.01', title: 'Biotecnologia Farmacêutica', dept: 'DETEQ', hours: '60 h/a', credits: '4', color: '--deteq-color', prereqs: 'Farmacologia (G00FAF) + Biologia Molecular Aplicada (G00BMA)', desc: 'Produção e purificação de fármacos de origem biológica, anticorpos monoclonais e proteínas terapêuticas. Sistemas de entrega de fármacos por nanocarreadores lipídicos e controle de qualidade farmacopeico de biológicos.' },
    tdv: { code: 'G00TDV00.01', title: 'Tecnologia de Desenvolvimento de Vacinas', dept: 'DETEQ', hours: '30 h/a', credits: '2', color: '--deteq-color', prereqs: 'Imunologia Aplicada (G00IMA) + Biologia Molecular Aplicada (G00BMA)', desc: 'Plataformas tecnológicas de produção de vacinas de subunidades, atenuadas, inativadas e vetores vacinais recombinantes. Formulação de vacinas de mRNA de última geração e adjuvantes imunológicos.' },
    prot: { code: 'G00PRR00.01', title: 'Proteínas Recombinantes', dept: 'DEBIO', hours: '30 h/a', credits: '2', color: '--debio-color', prereqs: 'Bioquímica Aplicada (G00BQA) + Biologia Molecular Aplicada (G00BMA)', desc: 'Desenvolvimento de vetores de expressão e transformação em sistemas hospedeiros (E. coli, leveduras e células de mamíferos). Estratégias de engenharia de proteínas por evolução dirigida para aumento de estabilidade catalítica.' }
  };

  /* ---- 10. Calendário acadêmico 2026.2 (CGRAD 25/2026) ---- */
  var CALENDAR_DB = [
    { date: '2026-08-01', title: 'Férias Escolares (Término)', type: 'Feriados & Recessos', oficial: true, desc: 'Fim do recesso escolar de inverno decretado pelo Colegiado de Ensino, Pesquisa e Extensão (CEPE).' },
    { date: '2026-08-02', title: '2ª Fase de Matrícula (Término)', type: 'Matrículas & Ajustes', oficial: true, desc: 'Fim do prazo para os alunos veteranos solicitarem reserva de vagas extras diretamente pelo SIGAA.' },
    { date: '2026-08-03', title: 'Acolhimento de Ingressantes', type: 'Ensino & Aulas', oficial: true, desc: 'Atividades de recepção e introdução ao curso de Bacharelado em Biotecnologia com a presença de professores e coordenação.' },
    { date: '2026-08-04', title: 'Acolhimento de Ingressantes', type: 'Ensino & Aulas', oficial: true, desc: 'Segundo dia de acolhimento aos calouros: visitas técnicas guiadas e apresentação das diretrizes acadêmicas.' },
    { date: '2026-08-04', title: 'Resultado da 2ª Fase de Matrícula', type: 'Matrículas & Ajustes', oficial: true, desc: 'Divulgação oficial das turmas deferidas no SIGAA para veteranos na segunda fase.' },
    { date: '2026-08-05', title: 'Início do Semestre Letivo 2026.2', type: 'Ensino & Aulas', oficial: true, desc: 'Aula inaugural e recepção oficial das turmas de veteranos de Biotecnologia e Engenharia.' },
    { date: '2026-08-05', title: 'Solicitação de Ajustes de Matrícula', type: 'Matrículas & Ajustes', oficial: true, desc: 'Período para solicitar correções cadastrais ou inclusão emergencial de disciplinas com as coordenações.' },
    { date: '2026-08-05', title: 'Início da Atividade de Extensão (AEX)', type: 'TCC, Estágio & Ext.', oficial: true, desc: 'Início da vigência e execução de projetos de extensão vinculados ao curso de biotecnologia aprovados anteriormente.' },
    { date: '2026-08-05', title: 'Divulgação do Calendário de Estágio Obrigatório', type: 'TCC, Estágio & Ext.', oficial: true, desc: 'Publicação do cronograma de reuniões, envios de convênios e relatórios de estágio supervisionado.' },
    { date: '2026-08-06', title: 'Solicitação de Ajustes de Matrícula', type: 'Matrículas & Ajustes', oficial: true, desc: 'Prazo limite para pedidos de ajustes em disciplinas do período.' },
    { date: '2026-08-07', title: 'Ajustes de Matrícula (Análise Coord.)', type: 'Matrículas & Ajustes', oficial: true, desc: 'Processamento e deferimento manual dos planos e quebras de pré-requisitos pela coordenação.' },
    { date: '2026-08-12', title: 'Ajustes de Matrícula (Análise)', type: 'Matrículas & Ajustes', oficial: true, desc: 'Finalização das adequações curriculares no sistema acadêmico.' },
    { date: '2026-08-14', title: 'Início do Período de Solenidades de Colação', type: 'Ensino & Aulas', oficial: true, desc: 'Abertura oficial do décimo dia corrido para pedidos de outorga de grau.' },
    { date: '2026-08-15', title: 'Feriado: Assunção de Nossa Senhora', type: 'Feriados & Recessos', oficial: true, desc: 'Feriado municipal em Belo Horizonte. Sem expediente administrativo e sem atividades letivas.' },
    { date: '2026-08-17', title: 'Matrícula Extraordinária', type: 'Matrículas & Ajustes', oficial: true, desc: 'Início da ocupação direta de vagas ociosas por ordem de chegada na WEB.' },
    { date: '2026-08-18', title: 'Matrícula Extraordinária', type: 'Matrículas & Ajustes', oficial: true, desc: 'Processamento contínuo das matrículas em disciplinas optativas com vagas livres.' },
    { date: '2026-08-19', title: 'Matrícula Extraordinária (Fim)', type: 'Matrículas & Ajustes', oficial: true, desc: 'Fechamento do sistema de matrícula extraordinária na WEB ao término do décimo quinto dia letivo.' },
    { date: '2026-08-27', title: 'Confirmação de Matrícula no TG/TCC (Fim)', type: 'TCC, Estágio & Ext.', oficial: true, desc: 'Data limite para as coordenações enviarem ao SRCA a confirmação de matrículas de TCC I e TCC II.' },
    { date: '2026-08-27', title: 'Período de Requerimento de Aproveitamento', type: 'Prazos & Trancamento', oficial: true, desc: 'Abertura de protocolo para pedido de equivalência de disciplinas cursadas anteriormente (19º dia letivo).' },
    { date: '2026-09-02', title: 'Período de Requerimento de Aproveitamento (Fim)', type: 'Prazos & Trancamento', oficial: true, desc: 'Último dia para entrada de processos de aproveitamento instruídos com memorial descritivo (24º dia letivo).' },
    { date: '2026-09-03', title: 'Dispensa de disciplinas (Início)', type: 'Matrículas & Ajustes', oficial: true, desc: 'Período oficial de solicitação de dispensa de disciplinas para o próximo período.' },
    { date: '2026-09-03', title: 'Trancamento Parcial/Total (Fim)', type: 'Prazos & Trancamento', oficial: true, desc: 'Data limite improrrogável para trancamento de disciplinas (parcial) via SIGAA ou trancamento total do período na coordenação.' },
    { date: '2026-09-03', title: 'Validação de Estágio Obrigatório (Fim)', type: 'TCC, Estágio & Ext.', oficial: true, desc: 'Prazo máximo para envio e validação de estágios realizados em mobilidade ou semestres anteriores.' },
    { date: '2026-09-07', title: 'Feriado: Independência do Brasil', type: 'Feriados & Recessos', oficial: true, desc: 'Feriado Nacional. Não haverá expediente acadêmico ou aulas no campus.' },
    { date: '2026-09-10', title: 'Preenchimento Avaliação Discente CPA (Início)', type: 'Ensino & Aulas', oficial: true, desc: 'Abertura do formulário de avaliação discente elaborado pela CPA sobre o semestre anterior (30º dia letivo).' },
    { date: '2026-09-10', title: 'Divulgação de Vagas Remanescentes', type: 'Prazos & Trancamento', oficial: true, desc: 'Divulgação, pela Secretaria de Registro, das vagas ociosas para transferências e reingressos.' },
    { date: '2026-09-15', title: 'Emissão de Certificado de Estágio (Fim)', type: 'TCC, Estágio & Ext.', oficial: true, desc: 'Último dia para requerer emissão de certificados de estágios não obrigatórios para validação de horas complementares.' },
    { date: '2026-09-19', title: 'Aproveitamento de Estudos (Análise Coord.)', type: 'Prazos & Trancamento', oficial: true, desc: 'Prazo para coordenações avaliarem pedidos deferidos de aproveitamento e destinarem aos departamentos específicos.' },
    { date: '2026-09-22', title: 'Trancamento de Matrícula em TG/TCC (Fim)', type: 'TCC, Estágio & Ext.', oficial: true, desc: 'Data limite para o pedido de trancamento de matrícula de Trabalho de Conclusão de Curso ou Trabalho de Graduação.' },
    { date: '2026-09-22', title: 'Dispensa de disciplinas (Fim)', type: 'Matrículas & Ajustes', oficial: true, desc: 'Encerramento das inscrições para solicitação de exames de dispensa de disciplinas.' },
    { date: '2026-09-26', title: 'Aproveitamento de Estudos (Bancas/Departamentos)', type: 'Prazos & Trancamento', oficial: true, desc: 'Divulgação dos cronogramas e bancas avaliadoras de exames de aproveitamento nos departamentos.' },
    { date: '2026-09-28', title: 'Envio de Critérios de Vagas Remanescentes', type: 'Prazos & Trancamento', oficial: true, desc: 'Envio dos pesos de notas e critérios de seleção de transferências para a DIRGRAD.' },
    { date: '2026-09-29', title: 'Proposta de Horários de Disciplinas Equalizadas', type: 'Ensino & Aulas', oficial: true, desc: 'Primeiro dia para elaboração conjunta dos horários de matérias comuns pelas chefias de departamento.' },
    { date: '2026-09-29', title: 'Validação de Estágio Ativ. Complementar (Fim)', type: 'TCC, Estágio & Ext.', oficial: true, desc: 'Prazo máximo para validação de certificados de estágio como carga complementar (46º dia letivo).' },
    { date: '2026-10-01', title: 'Planos de Ensino de Tópicos Especiais (Início)', type: 'Ensino & Aulas', oficial: true, desc: 'Início do prazo para as coordenações cadastrarem as ementas das disciplinas eletivas e tópicos livres.' },
    { date: '2026-10-03', title: 'Inscrição em Mobilidade Acadêmica (Início)', type: 'Prazos & Trancamento', oficial: true, desc: 'Abertura das inscrições para o programa de mobilidade estudantil interna ou com convênios federais.' },
    { date: '2026-10-05', title: 'Proposta de Horários de Disciplinas Equalizadas (Fim)', type: 'Ensino & Aulas', oficial: true, desc: 'Encerramento da confecção dos horários compartilhados de grade.' },
    { date: '2026-10-06', title: 'Cadastro de Atividades Complementares (Início)', type: 'TCC, Estágio & Ext.', oficial: true, desc: 'Abertura do sistema acadêmico para inserção de certificados e horas complementares (52º dia letivo).' },
    { date: '2026-10-12', title: 'Feriado: N. Sra. Aparecida', type: 'Feriados & Recessos', oficial: true, desc: 'Feriado Nacional: Padroeira do Brasil. Campus fechado.' },
    { date: '2026-10-14', title: 'Avaliações de Aproveitamento de Estudos (Fim)', type: 'Prazos & Trancamento', oficial: true, desc: 'Encerramento da aplicação das provas teóricas de suficiência ou aproveitamento nos departamentos (58º dia letivo).' },
    { date: '2026-10-14', title: 'Planos de Ensino de Tópicos Especiais (Fim)', type: 'Ensino & Aulas', oficial: true, desc: 'Prazo máximo para envio dos planos de novos Tópicos Especiais aprovados em Colegiado.' },
    { date: '2026-10-16', title: 'Preenchimento CPA (Fim)', type: 'Ensino & Aulas', oficial: true, desc: 'Prazo limite de preenchimento dos formulários de autoavaliação institucional pelos alunos.' },
    { date: '2026-10-16', title: 'Cadastro de turmas extras/desvinculadas', type: 'Ensino & Aulas', oficial: true, desc: 'Início das solicitações de criação de turmas de reforço ou dependência no SIGAA pelos departamentos.' },
    { date: '2026-10-16', title: 'Inscrição em Mobilidade Acadêmica (Fim)', type: 'Prazos & Trancamento', oficial: true, desc: 'Último dia para inscrições e entrega de documentação para intercâmbio/mobilidade.' },
    { date: '2026-10-19', title: 'Semana de Ciência & Tecnologia (Início)', type: 'Ensino & Aulas', oficial: true, desc: 'Abertura das atividades científicas, simpósios e mostras de inovação da Biotecnologia e Engenharias no campus.' },
    { date: '2026-10-21', title: 'Cadastro de novos Tópicos Especiais (SRCA)', type: 'Ensino & Aulas', oficial: true, desc: 'Homologação e cadastro das eletivas de tópicos pelo Registro Acadêmico.' },
    { date: '2026-10-21', title: 'Trancamento de Estágio Supervisionado', type: 'TCC, Estágio & Ext.', oficial: true, desc: 'Último dia de solicitação de desistência na disciplina de estágio por e-mail.' },
    { date: '2026-10-22', title: 'Cadastro de Atividades Complementares (Fim)', type: 'TCC, Estágio & Ext.', oficial: true, desc: 'Fim do prazo para os alunos enviarem os diplomas de atividades de extensão ou iniciação científica no sistema.' },
    { date: '2026-10-23', title: 'Semana de Ciência & Tecnologia (Fim)', type: 'Ensino & Aulas', oficial: true, desc: 'Encerramento oficial das mostras e emissão dos certificados de participação.' },
    { date: '2026-10-23', title: 'Análise de Atividades Complementares (Início)', type: 'TCC, Estágio & Ext.', oficial: true, desc: 'Primeiro dia de avaliação das comissões curriculares para deferimento das horas extracurriculares.' },
    { date: '2026-10-23', title: 'Turmas de Tópicos Especiais no SIGAA (Início)', type: 'Ensino & Aulas', oficial: true, desc: 'Geração e disponibilização das turmas especiais de eletivas.' },
    { date: '2026-10-26', title: 'Resultados de Aproveitamento de Estudos', type: 'Prazos & Trancamento', oficial: true, desc: 'Envio das notas dos exames de aproveitamento para as respectivas coordenações (68º dia letivo).' },
    { date: '2026-10-28', title: 'Recesso: Dia do Servidor Público', type: 'Feriados & Recessos', oficial: true, desc: 'Recesso administrativo decretado. Não haverá aulas presenciais.' },
    { date: '2026-10-29', title: 'Seleção de Mobilidade Acadêmica (Coord.)', type: 'Prazos & Trancamento', oficial: true, desc: 'Fim do prazo de análise dos alunos recomendados para programas de intercâmbio de mobilidade.' },
    { date: '2026-10-31', title: 'Cadastro de turmas extras/desvinculadas (Fim)', type: 'Ensino & Aulas', oficial: true, desc: 'Fim do envio de demandas departamentais para turmas extras.' },
    { date: '2026-11-02', title: 'Feriado: Finados', type: 'Feriados & Recessos', oficial: true, desc: 'Feriado Nacional. Campus inativo.' },
    { date: '2026-11-05', title: 'Edital de Vagas Remanescentes (DIRGRAD)', type: 'Prazos & Trancamento', oficial: true, desc: 'Publicação oficial do processo seletivo para preenchimento das vagas ociosas.' },
    { date: '2026-11-05', title: 'Abertura de turmas no SIGAA (Início)', type: 'Ensino & Aulas', oficial: true, desc: 'Abertura das demandas para o próximo semestre letivo de 2027.1 pelas coordenações.' },
    { date: '2026-11-06', title: 'Cronograma do Seminário de Estágios', type: 'TCC, Estágio & Ext.', oficial: true, desc: 'Divulgação das datas, salas e horários de apresentações orais de relatórios de estágio supervisionado.' },
    { date: '2026-11-06', title: 'Cronograma de apresentações de Monografias/TCC', type: 'TCC, Estágio & Ext.', oficial: true, desc: 'Publicação das agendas das bancas avaliadoras de defesas de TCC II (76º dia letivo).' },
    { date: '2026-11-06', title: 'Resultados de Mobilidade Acadêmica (DIRGRAD)', type: 'Prazos & Trancamento', oficial: true, desc: 'Divulgação das listas consolidadas dos estudantes contemplados em mobilidade para o próximo semestre.' },
    { date: '2026-11-09', title: 'Turmas de Tópicos Especiais no SIGAA (Fim)', type: 'Ensino & Aulas', oficial: true, desc: 'Prazo limite para inserção de turmas especiais de eletivas.' },
    { date: '2026-11-11', title: 'Processo Final de Aproveitamento de Estudos (SRCA)', type: 'Prazos & Trancamento', oficial: true, desc: 'Envio dos processos consolidados das avaliações de suficiência para o Registro Central (80º dia letivo).' },
    { date: '2026-11-12', title: 'Autorização de Turmas de Tópicos Especiais (Início)', type: 'Ensino & Aulas', oficial: true, desc: 'Período para chefias homologarem e determinarem docentes encarregados das turmas livres de eletivas.' },
    { date: '2026-11-13', title: 'Divulgação de Defesas de TG/TCC/PFC', type: 'TCC, Estágio & Ext.', oficial: true, desc: 'Divulgação pública dos convites e cronogramas detalhados das defesas de fim de curso (82º dia letivo).' },
    { date: '2026-11-15', title: 'Feriado: Proclamação da República', type: 'Feriados & Recessos', oficial: true, desc: 'Feriado Nacional. Não haverá expediente letivo.' },
    { date: '2026-11-20', title: 'Feriado: Dia da Consciência Negra', type: 'Feriados & Recessos', oficial: true, desc: 'Feriado Estadual. Atividades suspensas.' },
    { date: '2026-11-23', title: 'Validação de Estágio Supervisionado (Fim)', type: 'TCC, Estágio & Ext.', oficial: true, desc: 'Último dia para alunos entregarem e validarem os relatórios finais de estágio para o atual semestre.' },
    { date: '2026-11-23', title: 'Análise de Atividades Complementares (Fim)', type: 'TCC, Estágio & Ext.', oficial: true, desc: 'Fechamento das análises curriculares e digitação das cargas horárias complementares deferidas no sistema.' },
    { date: '2026-11-25', title: 'Estágio de Docência Pós-Graduação (Início)', type: 'Ensino & Aulas', oficial: true, desc: 'Envio das decisões dos colegiados para autorização de monitorias e auxílios de docência de pós-graduandos.' },
    { date: '2026-11-28', title: 'Autorização de Turmas de Tópicos Especiais (Fim)', type: 'Ensino & Aulas', oficial: true, desc: 'Encerramento das validações das eletivas livres nos departamentos.' },
    { date: '2026-11-30', title: 'Abertura de turmas no SIGAA (Fim)', type: 'Ensino & Aulas', oficial: true, desc: 'Fim da etapa de solicitação de novas disciplinas curriculares pelas coordenações.' },
    { date: '2026-11-30', title: 'Divulgação de resultados de Estágio Obrigatório', type: 'TCC, Estágio & Ext.', oficial: true, desc: 'Divulgação das homologações e validações de estágios pelo setor de carreiras.' },
    { date: '2026-11-30', title: 'Submissão de Proposta de Extensão (AEX)', type: 'TCC, Estágio & Ext.', oficial: true, desc: 'Encerramento do recebimento de propostas de novos projetos de extensão no Bacharelado.' },
    { date: '2026-12-01', title: 'Autorização de Turmas SIGAA (Início)', type: 'Ensino & Aulas', oficial: true, desc: 'Fase de validação departamental das matérias e vinculação direta de professores em disciplinas comuns de Engenharia/Biotecnologia.' },
    { date: '2026-12-07', title: 'Apresentações de TG, TCC e Projeto de Curso (Fim)', type: 'TCC, Estágio & Ext.', oficial: true, desc: 'Prazo limite de realizações e defesas orais das monografias diante das bancas avaliadoras.' },
    { date: '2026-12-07', title: 'Estágio de Docência Pós-Graduação (Fim)', type: 'Ensino & Aulas', oficial: true, desc: 'Último dia para devolução dos planos de estágio por pós-graduandos aos colegiados.' },
    { date: '2026-12-07', title: 'Término do Semestre Letivo 2026.2', type: 'Ensino & Aulas', oficial: true, desc: 'Fim das aulas teóricas e encerramento da contagem dos dias letivos regulares (100º dia letivo).' },
    { date: '2026-12-07', title: 'Aprovação de Propostas de Extensão (AEX) 1ª Inst.', type: 'TCC, Estágio & Ext.', oficial: true, desc: 'Aprovação preliminar em primeira instância de novos projetos de extensão cadastrados.' },
    { date: '2026-12-08', title: 'Feriado BH: Imaculada Conceição', type: 'Feriados & Recessos', oficial: true, desc: 'Feriado Municipal em Belo Horizonte. Sem aulas.' },
    { date: '2026-12-10', title: 'Período de realização de EXAMES ESPECIAIS', type: 'Avaliação & Exames', oficial: true, desc: 'Primeiro dia de avaliações extraordinárias para substituição de nota ou recuperação final de semestre.' },
    { date: '2026-12-16', title: 'Período de realização de EXAMES ESPECIAIS (Fim)', type: 'Avaliação & Exames', oficial: true, desc: 'Fim do prazo para aplicação de exames especiais de recuperação nos departamentos.' },
    { date: '2026-12-16', title: 'Reconhecimento de Atividade de Estágio no Sistema', type: 'TCC, Estágio & Ext.', oficial: true, desc: 'Consolidação final dos relatórios e lançamento das notas e frequências de estágio supervisionado.' },
    { date: '2026-12-16', title: 'Publicação de TCC/PFC em repositório institucional', type: 'TCC, Estágio & Ext.', oficial: true, desc: 'Data limite para envio de arquivos de monografias, ata assinada e termos de autorização ao portal do acervo digital.' },
    { date: '2026-12-16', title: 'Finalização de Atividades de Extensão (AEX)', type: 'TCC, Estágio & Ext.', oficial: true, desc: 'Encerramento das atividades práticas dos programas de extensão vigentes no período.' },
    { date: '2026-12-16', title: 'Aprovação de Propostas de Extensão (AEX) 2ª Inst.', type: 'TCC, Estágio & Ext.', oficial: true, desc: 'Homologação e aprovação final de novos programas de extensão de Bacharelado.' },
    { date: '2026-12-16', title: 'Autorização de Turmas SIGAA (Fim)', type: 'Ensino & Aulas', oficial: true, desc: 'Fechamento definitivo das grades com a respectiva vinculação de docentes no sistema acadêmico.' },
    { date: '2026-12-23', title: 'Data-limite para entrega de diários de classe', type: 'Ensino & Aulas', oficial: true, desc: 'Encerramento do prazo para lançamento de faltas, diários e notas finais das disciplinas consolidadas no SIGAA.' },
    { date: '2026-12-24', title: 'Recesso de Natal', type: 'Feriados & Recessos', oficial: true, desc: 'Recesso oficial de fim de ano administrativo.' },
    { date: '2026-12-25', title: 'Natal', type: 'Feriados & Recessos', oficial: true, desc: 'Feriado Nacional.' },
    { date: '2026-12-31', title: 'Recesso de Ano Novo', type: 'Feriados & Recessos', oficial: true, desc: 'Véspera de Confraternização Universal. Campus inativo.' }
  ];

  /* ---- 11. Exposição Global do Módulo ---- */
  window.BP_DATA = {
    TOTAL_HA: TOTAL_HA,
    SEM1: SEM1,
    SEMS: SEMS,
    OPTATIVAS: OPTATIVAS,
    GNODES: GNODES,
    GEDGES: GEDGES,
    CH_BY_NAME: CH_BY_NAME,
    SCHED: SCHED,
    MONTHLY_DAYS_OFICIAL: MONTHLY_DAYS_OFICIAL,
    OPT_CATALOGUE: OPT_CATALOGUE,
    CALENDAR_DB: CALENDAR_DB
  };
})();