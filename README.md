README — BioPulse (Painel de Formação em Biotecnologia)

1. Sobre o Projeto

O BioPulse é uma aplicação web de código aberto desenvolvida para dar suporte aos estudantes do curso de Bacharelado em Biotecnologia do Centro Federal de Educação Tecnológica de Minas Gerais (CEFET-MG). A ferramenta centraliza o acompanhamento do percurso acadêmico, fornecendo recursos para cálculo de desempenho escolar, monitoramento de assiduidade, consulta de pré-requisitos, planejamento de disciplinas e acesso a comunicados oficiais e publicações científicas da comunidade.

A aplicação opera inteiramente no modelo client-side (no navegador do usuário), garantindo privacidade e persistência de dados no próprio dispositivo, combinada a uma integração em nuvem para o mural de artigos do blog comunitário.

2. Arquitetura e Tecnologias

A estrutura técnica do projeto foi construída priorizando leveza, baixo tempo de carregamento e compatibilidade com provedores de hospedagem estática.

Frontend: HTML5, CSS3 Nulo (CSS Nativo com suporte a CSS Variables e temas), JavaScript ES6+ assíncrono.
Animações e Efeitos Visuais: HTML5 Canvas API para renderização de partículas moleculares dinâmicas.
Banco de Dados e Backend do Blog: Supabase (PostgreSQL serverless) com comunicação via SDK JS/CDN.
Segurança e Moderação: Triggers e Restrições no PostgreSQL (PL/pgSQL) para sanitização e filtragem automática de conteúdo.
Persistência de Dados do Aluno: Web Storage API (localStorage) para salvamento local privado de notas, faltas, notas de aula e preferências de tema.
3. Principais Módulos do Sistema

A. Painel do Estudante
Visão Geral: Exposição do Coeficiente de Rendimento Acadêmico (CRA) real, progresso percentual de integralização das 3.300 horas do curso, horas complementares acumuladas e alertas de infrequência.
Gestão de Notas e Avaliações: Cadastro de exames, trabalhos e seminários por disciplina, com cálculo automatizado da média parcial e final no período.
Controle de Assiduidade: Calculadora de faltas programada para aplicar o limite legal de 25% de infrequência máxima conforme a carga horária de cada matéria (15h, 30h, 60h, 150h e 510h).
Simulador de CRA Futuro: Gráfico interativo e projeção do CRA do estudante ao longo dos nove semestres do curso.
Quadro de Horários e Alocação de Salas: Grade de aulas do turno noturno com filtros em formato de lista (dropdown) para alternar entre os períodos letivos e aplicar destaque visual em verde suave (#D4EDDA) para turmas práticas divididas (T1 e T2). Permite customização das salas dos Campus Nova Suíça (NS) e Nova Gameleira (NG).
B. Grade Curricular & Optativas
Percurso Regular Obrigatório: Exibição em colunas no formato Kanban dos nove períodos letivos, respeitando rigorosamente a ordem oficial do Projeto Pedagógico do Curso (PPC) do CEFET-MG.
Catálogo de Optativas: Visualização Kanban de disciplinas optativas organizadas por número de pré-requisitos e departamento gestor (DEBIO, DEQUI, DECOM, DF, DETEQ, DCSA, DCSF e DCTA).
Ementas e Detalhes: Janela modal contendo código da disciplina, carga horária, créditos e ementa descritiva.
C. Pré-requisitos & Planejador Curricular
Grafo em Rede: Mapeamento visual onde a seleção de uma matéria ilumina suas raízes (pré-requisitos) e ramos (disciplinas destravadas).
Planejador Arrastável: Interface para planejamento semestral de matérias optativas com validação automática de dependências pendentes.
D. Mural de Avisos e Boletins
Central de comunicados oficiais do Colegiado e professores.
Classificação visual por prioridade (Crítico em vermelho, Atenção em amarelo e Comum em verde).
Notificação automática por janela modal na abertura do sistema caso existam avisos não lidos.
E. Blog da Biotecnologia
Mural aberto para envio de artigos, relatos de iniciação científica, experiências de estágio e notícias do curso.
Integração com Supabase para salvamento e publicação em tempo real.
Filtro sanitário automático no banco de dados para bloqueio de conteúdos inadequados, ofensivos ou contrários às diretrizes acadêmicas.
F. Calendário Acadêmico
Grade mensal contendo os eventos e prazos oficiais da Deliberação CGRAD do CEFET-MG.
Agenda pessoal integrada para inclusão de lembretes e compromissos privados.
4. Instalação e Execução Local

Como o projeto utiliza tecnologias nativas da web, não há necessidade de instalação de dependências via Node.js ou gerenciadores de pacote.

Clone este repositório para o seu computador:
bash


git clone https://github.com/IndianaJooJ/App-biotec.git
Navegue até a pasta do projeto:
bash


cd App-biotec
(talvez n funcione, qualquer coisa me chama no insta)
Abra o arquivo index.html diretamente em qualquer navegador moderno ou utilize uma extensão de servidor local (como o Live Server do VS Code).
5. Configuração do Banco de Dados (Supabase)

Para ativar a publicação automática e a filtragem do Blog, execute o script SQL abaixo no Editor de Consultas do seu projeto no Supabase:

sql


-- Criar tabela de artigos
CREATE TABLE posts (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  autor TEXT NOT NULL,
  titulo TEXT NOT NULL,
  categoria TEXT NOT NULL,
  resumo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  status TEXT DEFAULT 'aprovado'
);

-- Habilitar segurança por linha
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura publica de posts aprovados" ON posts
  FOR SELECT USING (status = 'aprovado');

CREATE POLICY "Permitir envio publico de novos posts" ON posts
  FOR INSERT WITH CHECK (status = 'aprovado');

-- Trigger de segurança e moderação automática de conteúdo
CREATE OR REPLACE FUNCTION moderar_e_filtrar_artigo()
RETURNS TRIGGER AS $$
DECLARE
  texto_completo TEXT;
BEGIN
  texto_completo := LOWER(COALESCE(NEW.titulo, '') || ' ' || 
                          COALESCE(NEW.resumo, '') || ' ' || 
                          COALESCE(NEW.conteudo, '') || ' ' || 
                          COALESCE(NEW.autor, ''));

  IF texto_completo ~* '\y(porn|porno|pornografia|xvideos|redtube|onlyfans|hentai|sexo|nudez|nudes|pelada|pelado|pussy|dick)\y' THEN
    RAISE EXCEPTION 'Conteúdo adulto ou inadequado detectado.';
  END IF;

  IF texto_completo ~* '\y(nazismo|hitler|racista|racismo|homofobia|xenofobia|capacitismo)\y' THEN
    RAISE EXCEPTION 'Discurso de ódio detectado.';
  END IF;

  IF texto_completo ~* '\y(<script|javascript:|eval\(|onclick|onload)\y' THEN
    RAISE EXCEPTION 'Código não permitido detectado.';
  END IF;

  NEW.titulo := regexp_replace(NEW.titulo, '\y(caralho|porra|puta|merda|buceta|pica|cacete|foder|foda)\y', '***', 'gi');
  NEW.resumo := regexp_replace(NEW.resumo, '\y(caralho|porra|puta|merda|buceta|pica|cacete|foder|foda)\y', '***', 'gi');
  NEW.conteudo := regexp_replace(NEW.conteudo, '\y(caralho|porra|puta|merda|buceta|pica|cacete|foder|foda)\y', '***', 'gi');

  NEW.status := 'aprovado';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_moderar_artigo
BEFORE INSERT OR UPDATE ON posts
FOR EACH ROW
EXECUTE FUNCTION moderar_e_filtrar_artigo();
6. Isenção de Responsabilidade Legal (Disclaimer)

O BioPulse é uma ferramenta de caráter estritamente educativo, de código aberto e sem fins lucrativos, desenvolvida de forma independente para fins de suporte acadêmico e planejamento curricular dos estudantes.

Esta aplicação não possui qualquer vínculo oficial, patrocínio, autorização ou representação legal com o Centro Federal de Educação Tecnológica de Minas Gerais (CEFET-MG), seus departamentos ou órgãos colegiados. Todas as informações curriculares, códigos de disciplinas, matrizes pedagógicas e calendários escolares exibidos nesta plataforma são de natureza pública e extraídos diretamente de resoluções e documentos disponibilizados publicamente pela instituição de ensino nos termos da Lei de Acesso à Informação (Lei nº 12.527/2011).

7. Licença e Autoria

Desenvolvido por João Gabriel Sousa de Paula. Distribuído sob a licença MIT. Consulte o arquivo LICENSE para mais detalhes.
