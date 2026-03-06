import { type Json } from "@/integrations/supabase/types";

export type ProductCategory = "infoproduto" | "prestacao_servico" | "mentoria" | "ecommerce";

type BriefingFieldType = "input" | "textarea" | "radio" | "checkbox";

export interface BriefingFieldDefinition {
  key: string;
  label: string;
  placeholder: string;
  type: BriefingFieldType;
  required?: boolean;
  options?: string[];
  section?: string;
  icon?: string;
}

export interface BriefingSchema {
  category: ProductCategory;
  title: string;
  description: string;
  fileTitle: string;
  fields: BriefingFieldDefinition[];
}

export type BriefingAnswers = Record<string, string>;

export interface StoredBriefingField {
  key: string;
  label: string;
  value: string;
}

export interface StoredBriefingPayload {
  category: ProductCategory;
  answers: BriefingAnswers;
  fields: StoredBriefingField[];
  saved_at: string;
}

const req = { required: true as const };

export const BRIEFING_SCHEMAS: Record<ProductCategory, BriefingSchema> = {
  infoproduto: {
    category: "infoproduto",
    title: "Briefing — Infoproduto",
    description: "Preencha os campos para orientar estratégia, copy e produção de criativos.",
    fileTitle: "Briefing Infoproduto",
    fields: [
      // ── Produto & Oferta ──
      {
        key: "produto",
        label: "1. Qual é o seu produto? O que exatamente você entrega?",
        placeholder: "Curso online de inglês para iniciantes com foco em conversação, com 12 módulos em vídeo, suporte via Telegram e material de apoio em PDF.",
        type: "textarea",
        section: "Produto & Oferta",
        icon: "Package",
        ...req,
      },
      {
        key: "transformacao",
        label: "2. Qual é a principal transformação ou resultado que seu cliente terá ao comprar isso?",
        placeholder: "Falar inglês com segurança em até 3 meses, mesmo que comece do zero.",
        type: "textarea",
        section: "Produto & Oferta",
        icon: "Sparkles",
        ...req,
      },
      {
        key: "diferencial",
        label: "3. O que torna seu produto diferente dos concorrentes?",
        placeholder: "A única metodologia com foco em conversas reais, baseada em situações do cotidiano, e com plantão de dúvidas por Telegram 7 dias por semana.",
        type: "textarea",
        section: "Produto & Oferta",
        icon: "Trophy",
        ...req,
      },
      {
        key: "cliente_ideal",
        label: "4. Quem é o seu cliente ideal? (idade, profissão, localização, comportamento digital)",
        placeholder: "Mulheres de 30 a 45 anos, mães, que trabalham CLT ou empreendem, moram em cidades grandes e assistem Reels/TikToks sobre organização e produtividade.",
        type: "textarea",
        section: "Produto & Oferta",
        icon: "Users",
        ...req,
      },
      {
        key: "maior_dor",
        label: "5. Qual é o maior problema ou dor que essa pessoa sente hoje?",
        placeholder: "Sente vergonha de falar inglês no trabalho e já perdeu promoções por isso.",
        type: "textarea",
        section: "Produto & Oferta",
        icon: "HeartCrack",
        ...req,
      },
      {
        key: "tentativas_anteriores",
        label: "6. Quais tentativas anteriores essa pessoa já fez para resolver isso (e por que falharam)?",
        placeholder: "Já tentou 2 cursos online de inglês, mas achou as aulas chatas e sem acompanhamento.",
        type: "textarea",
        section: "Produto & Oferta",
        icon: "RotateCcw",
        ...req,
      },
      {
        key: "desejo",
        label: "7. O que ela quer muito conquistar (mesmo que ainda não admita)?",
        placeholder: "Ser reconhecida no trabalho e se sentir inteligente falando inglês com fluência.",
        type: "textarea",
        section: "Produto & Oferta",
        icon: "Star",
        ...req,
      },
      {
        key: "frase_eu_ajudo",
        label: '8. Complete a frase: "Eu ajudo [público] a [resultado específico] em [tempo] sem [sacrifício]"',
        placeholder: "Eu ajudo mães ocupadas a aprender inglês em 3 meses sem aulas cansativas ou decoreba.",
        type: "textarea",
        section: "Produto & Oferta",
        icon: "MessageSquareQuote",
        ...req,
      },
      {
        key: "crencas_mitos",
        label: "9. Quais crenças erradas ou mitos esse público acredita sobre o problema ou solução?",
        placeholder: "Que só é possível aprender inglês morando fora ou pagando caro por aulas particulares.",
        type: "textarea",
        section: "Produto & Oferta",
        icon: "ShieldAlert",
        ...req,
      },
      {
        key: "objecoes",
        label: "10. Quais são as 3 maiores objeções que você costuma ouvir na hora da venda?",
        placeholder: "Não tenho tempo\nJá tentei e não funcionou\nNão tenho dinheiro agora",
        type: "textarea",
        section: "Produto & Oferta",
        icon: "ShieldQuestion",
        ...req,
      },
      {
        key: "preco_incluso",
        label: "11. Qual o preço atual do seu produto e o que está incluso?",
        placeholder: "R$497 à vista – inclui acesso vitalício ao curso, suporte em grupo e certificado.",
        type: "textarea",
        section: "Produto & Oferta",
        icon: "BadgeDollarSign",
        ...req,
      },
      {
        key: "valor_resolver",
        label: "12. Quanto vale para seu cliente resolver esse problema HOJE?",
        placeholder: "Perder uma promoção no trabalho por não falar inglês pode custar +R$5.000/ano.",
        type: "textarea",
        section: "Produto & Oferta",
        icon: "TrendingUp",
        ...req,
      },
      {
        key: "garantia",
        label: "13. Existe alguma garantia ou promessa que você faz hoje?",
        placeholder: "Garantia incondicional de 7 dias.",
        type: "textarea",
        section: "Produto & Oferta",
        icon: "ShieldCheck",
        ...req,
      },
      {
        key: "bonus",
        label: "14. Que bônus você já oferece (ou poderia oferecer) que complementam a solução principal?",
        placeholder: "Bônus 1: Aulas de conversação ao vivo 1x por semana\nBônus 2: Checklist de pronúncia rápida\nBônus 3: Grupo de Networking com outros alunos",
        type: "textarea",
        section: "Produto & Oferta",
        icon: "Gift",
        ...req,
      },
      {
        key: "concorrentes",
        label: "15. Quais são os principais concorrentes e o que você acha que eles fazem bem ou mal?",
        placeholder: 'O inglês do "XCoach" é muito bom tecnicamente, mas sem acompanhamento. Outro concorrente foca só em gramática, o que assusta os iniciantes.',
        type: "textarea",
        section: "Produto & Oferta",
        icon: "Swords",
        ...req,
      },
      {
        key: "urls_vendas",
        label: "16. Coloque o URL das páginas de vendas de cada um:",
        placeholder: "https://...",
        type: "textarea",
        section: "Produto & Oferta",
        icon: "Link",
        ...req,
      },
      {
        key: "metodologias",
        label: "17. Quais principais diferenciais que seu produto tem? Conte mais sobre suas metodologias.",
        placeholder: "Método ARC (Análise, Roteiro e Copy) — roteiro guiado + templates de copy personalizáveis para cada nicho.\n\nO Método ARC é um framework em três etapas que acelera a criação de conteúdos de alto impacto. Primeiro, na Análise, mapeamos público-alvo, objeções e benefícios do seu produto; depois, no Roteiro, estruturamos gancho, problema, solução e CTA para cada formato; por fim, na Copy, aplicamos templates personalizáveis com gatilhos de prova social.",
        type: "textarea",
        section: "Produto & Oferta",
        icon: "Lightbulb",
        ...req,
      },
      {
        key: "produto_principal",
        label: "18. Qual seu produto principal?",
        placeholder: "Aquele que você gostaria de focar se só tivesse uma opção.",
        type: "input",
        section: "Produto & Oferta",
        icon: "Target",
        ...req,
      },
      {
        key: "ticket_medio",
        label: "19. Qual seu ticket médio?",
        placeholder: "Ex: R$497",
        type: "input",
        section: "Produto & Oferta",
        icon: "Receipt",
        ...req,
      },

      // ── Público-Alvo ──
      {
        key: "faixa_etaria",
        label: "20. Qual a faixa etária predominante dos seus compradores?",
        placeholder: "",
        type: "checkbox",
        options: ["18 a 25", "26 a 35", "36 a 45", "46 a 60", "Mais de 60"],
        section: "Público-Alvo",
        icon: "Calendar",
        ...req,
      },
      {
        key: "genero",
        label: "21. Gênero predominante de compradores:",
        placeholder: "",
        type: "radio",
        options: ["Masculino", "Feminino", "Indiferente"],
        section: "Público-Alvo",
        icon: "UserCircle",
        ...req,
      },
      {
        key: "renda_media",
        label: "22. Qual a renda média dos seus compradores?",
        placeholder: "",
        type: "radio",
        options: ["Até R$2.000,00", "de R$2.000,01 a R$4.000,00", "R$4.000,01 a R$7.000,00", "+ de R$7.000,01"],
        section: "Público-Alvo",
        icon: "Wallet",
        ...req,
      },

      // ── Faturamento / Modelo de Negócio ──
      {
        key: "faturamento_mensal",
        label: "23. Quanto você fatura em média por mês com a soma de todos os infoprodutos?",
        placeholder: "",
        type: "radio",
        options: [
          "Até R$10.000,00",
          "R$10.000,01 a R$20.000,00",
          "R$20.000,01 a R$30.000,00",
          "R$30.000,01 a R$50.000,00",
          "R$50.000,01 a R$80.000,00",
          "+ R$80.000,01",
        ],
        section: "Faturamento / Modelo de Negócio",
        icon: "BarChart3",
        ...req,
      },
      {
        key: "faturamento_6_meses",
        label: "24. Quanto você faturou em média nos últimos 6 meses?",
        placeholder: "Ex: R$30.000/mês",
        type: "input",
        section: "Faturamento / Modelo de Negócio",
        icon: "TrendingUp",
        ...req,
      },
      {
        key: "investimento_trafego",
        label: "25. Quanto você investiu em média nos últimos 6 meses em tráfego?",
        placeholder: "Ex: R$5.000/mês",
        type: "input",
        section: "Faturamento / Modelo de Negócio",
        icon: "CircleDollarSign",
        ...req,
      },
      {
        key: "modelo_preferido",
        label: "26. Qual dessas opções mais te agrada?",
        placeholder: "",
        type: "radio",
        options: ["Lowticket", "HighTicket", "Consultorias", "Mentorias", "Vendas no 1 a 1"],
        section: "Faturamento / Modelo de Negócio",
        icon: "Layers",
        ...req,
      },
      {
        key: "metrica_sucesso",
        label: "27. O que você considera como métrica de sucesso principal para sua operação?",
        placeholder: "",
        type: "radio",
        options: [
          "Criação de LTV sólido",
          "ROI na venda direta",
          "Engajamento nas redes (curtidas, comentários)",
          "Quantidade de vendas",
        ],
        section: "Faturamento / Modelo de Negócio",
        icon: "Goal",
        ...req,
      },
      {
        key: "expectativa_resultados",
        label: "28. Quando você espera começar a ver os primeiros resultados?",
        placeholder: "",
        type: "radio",
        options: ["1 mês", "1 a 3 meses", "4 a 6 meses", "Depois de 6 meses"],
        section: "Faturamento / Modelo de Negócio",
        icon: "Clock",
        ...req,
      },
      {
        key: "investimento_inicial",
        label: "29. Qual será o valor de investimento inicial (Primeiro mês)?",
        placeholder: "Esse valor pode ser alterado posteriormente.",
        type: "input",
        section: "Faturamento / Modelo de Negócio",
        icon: "Banknote",
        ...req,
      },
      {
        key: "primeiros_resultados",
        label: "30. O que você considera como primeiros resultados?",
        placeholder: "Seja específico, por exemplo: Quero atingir 100 alunos no meu curso principal nos primeiros 2 meses.",
        type: "textarea",
        section: "Faturamento / Modelo de Negócio",
        icon: "Rocket",
        ...req,
      },

      // ── Conteúdo e Equipe ──
      {
        key: "grava_criativos",
        label: "31. Você tem facilidade e disponibilidade para gravar criativos?",
        placeholder: "",
        type: "radio",
        options: ["Sim", "Não"],
        section: "Conteúdo e Equipe",
        icon: "Video",
        ...req,
      },
      {
        key: "instagram",
        label: "32. Qual link do perfil do Instagram?",
        placeholder: "https://instagram.com/...",
        type: "input",
        section: "Conteúdo e Equipe",
        icon: "AtSign",
        ...req,
      },
      {
        key: "equipe",
        label: "33. Marque os profissionais que você tem na equipe hoje:",
        placeholder: "",
        type: "checkbox",
        options: ["Social Media", "Designer", "Criador de página", "Video Maker", "Editor de vídeo", "Copywriter", "Vendedor", "Atendente"],
        section: "Conteúdo e Equipe",
        icon: "UsersRound",
        ...req,
      },
      {
        key: "dificuldades_trafego",
        label: "34. Quais são as maiores dificuldades que você teve até hoje com tráfego?",
        placeholder: "Ex: CPA alto, não conseguir escalar, falta de criativos...",
        type: "textarea",
        section: "Conteúdo e Equipe",
        icon: "AlertTriangle",
        ...req,
      },
      {
        key: "expectativa_agencia",
        label: "35. O que você espera da nossa agência?",
        placeholder: "Ex: Quero escalar minha operação e ter resultados consistentes.",
        type: "textarea",
        section: "Conteúdo e Equipe",
        icon: "Handshake",
        ...req,
      },
      {
        key: "cobranca",
        label: "36. Como nós podemos te cobrar caso você esqueça alguma demanda?",
        placeholder: "Ex: Pode mandar mensagem no WhatsApp sem problema.",
        type: "textarea",
        section: "Conteúdo e Equipe",
        icon: "Bell",
        ...req,
      },

      // ── Documentos ──
      {
        key: "link_criativos",
        label: "37. Cole o link das pastas com seus criativos",
        placeholder: "https://drive.google.com/...",
        type: "input",
        section: "Documentos",
        icon: "FolderOpen",
        ...req,
      },
      {
        key: "observacoes",
        label: "38. Alguma observação?",
        placeholder: "Escreva aqui qualquer observação adicional.",
        type: "textarea",
        section: "Documentos",
        icon: "FileText",
        required: false,
      },
    ],
  },
  prestacao_servico: {
    category: "prestacao_servico",
    title: "Briefing — Prestação de serviço",
    description: "Mapeie oferta, processo comercial e diferenciais do serviço.",
    fileTitle: "Briefing Prestação de Serviço",
    fields: [
      { key: "servico_principal", label: "Qual serviço principal você vende?", placeholder: "Ex: Gestão de tráfego para e-commerce.", type: "textarea", icon: "Briefcase", ...req },
      { key: "entregaveis", label: "Quais entregáveis estão inclusos no serviço?", placeholder: "Ex: Planejamento, execução, relatórios e reuniões quinzenais.", type: "textarea", icon: "ClipboardList", ...req },
      { key: "prazo_resultado", label: "Em quanto tempo o cliente costuma perceber resultado?", placeholder: "Ex: Primeiros indicadores em 30 dias.", type: "textarea", icon: "Clock", ...req },
      { key: "publico_ideal", label: "Quem é o cliente ideal desse serviço?", placeholder: "Ex: Negócios locais faturando acima de R$30 mil/mês.", type: "textarea", icon: "Users", ...req },
      { key: "problema_central", label: "Qual principal problema você resolve?", placeholder: "Ex: Falta de previsibilidade de vendas.", type: "textarea", icon: "HeartCrack", ...req },
      { key: "diferenciais", label: "Quais são os diferenciais frente à concorrência?", placeholder: "Ex: Dashboard em tempo real e SLA de atendimento.", type: "textarea", icon: "Trophy", ...req },
      { key: "provas", label: "Quais provas de resultado você possui?", placeholder: "Ex: Estudos de caso, depoimentos e números reais.", type: "textarea", icon: "Award", ...req },
      { key: "objecoes", label: "Quais objeções mais aparecem na negociação?", placeholder: "Ex: Preço, prazo e confiança.", type: "textarea", icon: "ShieldQuestion", ...req },
      { key: "modelo_contrato", label: "Como funciona contrato e fidelidade?", placeholder: "Ex: Contrato mensal sem fidelidade.", type: "textarea", icon: "FileText", ...req },
      { key: "precificacao", label: "Como é a precificação do serviço?", placeholder: "Ex: Mensalidade de R$2.500 + setup.", type: "textarea", icon: "BadgeDollarSign", ...req },
      { key: "meta_90_dias", label: "Qual meta comercial para os próximos 90 dias?", placeholder: "Ex: Fechar 10 novos contratos.", type: "textarea", icon: "Target", ...req },
      { key: "concorrentes", label: "Quais concorrentes diretos e indiretos?", placeholder: "Ex: Agência X, consultor Y.", type: "textarea", icon: "Swords", ...req },
      { key: "observacoes", label: "Observações importantes", placeholder: "Contextos específicos do negócio.", type: "textarea", icon: "FileText", required: false },
    ],
  },
  mentoria: {
    category: "mentoria",
    title: "Briefing — Mentoria",
    description: "Estruture posicionamento, promessa e jornada da mentoria.",
    fileTitle: "Briefing Mentoria",
    fields: [
      { key: "mentor", label: "Nome do mentor(a)", placeholder: "Ex: João Silva", type: "input", icon: "User", ...req },
      { key: "tema_mentoria", label: "Qual tema central da mentoria?", placeholder: "Ex: Escala de negócios digitais.", type: "textarea", icon: "BookOpen", ...req },
      { key: "promessa", label: "Qual promessa principal da mentoria?", placeholder: "Ex: Dobrar faturamento em 6 meses com método validado.", type: "textarea", icon: "Sparkles", ...req },
      { key: "publico", label: "Quem é o mentorado ideal?", placeholder: "Ex: Infoprodutores com faturamento entre 20k e 100k/mês.", type: "textarea", icon: "Users", ...req },
      { key: "nivel_aluno", label: "Qual nível atual dos alunos?", placeholder: "Iniciante, intermediário ou avançado.", type: "textarea", icon: "GraduationCap", ...req },
      { key: "maior_desafio", label: "Qual maior desafio dos mentorados hoje?", placeholder: "Ex: Falta de processo comercial claro.", type: "textarea", icon: "HeartCrack", ...req },
      { key: "estrutura", label: "Como a mentoria é estruturada?", placeholder: "Ex: Encontros semanais + comunidade + suporte.", type: "textarea", icon: "LayoutGrid", ...req },
      { key: "duracao", label: "Qual duração da mentoria?", placeholder: "Ex: 8 semanas.", type: "input", icon: "Clock", ...req },
      { key: "bonus", label: "Quais bônus e materiais de apoio existem?", placeholder: "Ex: Templates, playbooks e aulas extras.", type: "textarea", icon: "Gift", ...req },
      { key: "provas", label: "Quais provas de resultado dos mentorados?", placeholder: "Ex: Cases e depoimentos com métricas.", type: "textarea", icon: "Award", ...req },
      { key: "objecoes", label: "Quais objeções impedem a compra?", placeholder: "Ex: Falta de tempo, medo de não aplicar.", type: "textarea", icon: "ShieldQuestion", ...req },
      { key: "ticket", label: "Qual ticket da mentoria?", placeholder: "Ex: R$4.997", type: "input", icon: "Receipt", ...req },
      { key: "vagas", label: "Quantas vagas por turma?", placeholder: "Ex: 20 vagas.", type: "input", icon: "UsersRound", ...req },
      { key: "meta_lancamento", label: "Meta da próxima turma", placeholder: "Ex: 15 novos mentorados.", type: "textarea", icon: "Target", ...req },
    ],
  },
  ecommerce: {
    category: "ecommerce",
    title: "Briefing — E-commerce",
    description: "Mapeie produto, operação e argumentos de venda do e-commerce.",
    fileTitle: "Briefing E-commerce",
    fields: [
      { key: "marca", label: "Nome da marca", placeholder: "Ex: Loja Exemplo", type: "input", icon: "Store", ...req },
      { key: "nicho", label: "Qual nicho principal da loja?", placeholder: "Ex: Moda feminina.", type: "input", icon: "Tag", ...req },
      { key: "produtos_campeoes", label: "Quais produtos campeões de venda?", placeholder: "Ex: Vestido X e conjunto Y.", type: "textarea", icon: "ShoppingBag", ...req },
      { key: "ticket_medio", label: "Qual ticket médio atual?", placeholder: "Ex: R$189", type: "input", icon: "Receipt", ...req },
      { key: "publico_alvo", label: "Quem é o público-alvo principal?", placeholder: "Ex: Mulheres de 25-40 anos, capitais.", type: "textarea", icon: "Users", ...req },
      { key: "diferenciais", label: "Quais diferenciais competitivos da loja?", placeholder: "Ex: Entrega rápida e troca facilitada.", type: "textarea", icon: "Trophy", ...req },
      { key: "obstaculos", label: "Quais barreiras de compra mais frequentes?", placeholder: "Ex: Frete, prazo e confiança no site.", type: "textarea", icon: "ShieldAlert", ...req },
      { key: "estrutura_oferta", label: "Como está estruturada a oferta atual?", placeholder: "Ex: Desconto progressivo + cupom primeira compra.", type: "textarea", icon: "Layers", ...req },
      { key: "margin", label: "Margem média por produto", placeholder: "Ex: 35%", type: "input", icon: "Percent", ...req },
      { key: "sazonalidades", label: "Existem sazonalidades relevantes?", placeholder: "Ex: Alta no Dia das Mães e Black Friday.", type: "textarea", icon: "Calendar", ...req },
      { key: "canais", label: "Quais canais trazem mais vendas hoje?", placeholder: "Ex: Meta Ads, Google Shopping e orgânico.", type: "textarea", icon: "Megaphone", ...req },
      { key: "metas", label: "Quais metas de faturamento/ROAS?", placeholder: "Ex: R$150 mil/mês e ROAS 4+.", type: "textarea", icon: "Target", ...req },
      { key: "concorrentes", label: "Principais concorrentes", placeholder: "Ex: Loja A, Loja B.", type: "textarea", icon: "Swords", ...req },
      { key: "url_loja", label: "URL da loja", placeholder: "https://...", type: "input", icon: "Globe", ...req },
      { key: "observacoes", label: "Observações importantes", placeholder: "Contexto que o time deve saber.", type: "textarea", icon: "FileText", required: false },
    ],
  },
};

const DEFAULT_CATEGORY: ProductCategory = "infoproduto";

const categoryLabelMap: Record<ProductCategory, string> = {
  infoproduto: "Infoproduto",
  prestacao_servico: "Prestação de serviço",
  mentoria: "Mentoria",
  ecommerce: "E-commerce",
};

export const getCategoryLabel = (category?: string | null) => {
  if (!category) return categoryLabelMap[DEFAULT_CATEGORY];
  return categoryLabelMap[(category as ProductCategory)] ?? category;
};

export const getBriefingSchema = (category?: string | null): BriefingSchema => {
  if (!category) return BRIEFING_SCHEMAS[DEFAULT_CATEGORY];
  return BRIEFING_SCHEMAS[(category as ProductCategory)] ?? BRIEFING_SCHEMAS[DEFAULT_CATEGORY];
};

export const createEmptyBriefingAnswers = (fields: BriefingFieldDefinition[]): BriefingAnswers =>
  Object.fromEntries(fields.map((field) => [field.key, ""]));

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const asStringMap = (value: unknown): BriefingAnswers => {
  const record = asRecord(value);
  return Object.fromEntries(
    Object.entries(record).map(([key, val]) => [key, typeof val === "string" ? val : ""]),
  );
};

const toLegacyLabel = (key: string) =>
  key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const serializeBriefingPayload = (
  category: ProductCategory,
  answers: BriefingAnswers,
): StoredBriefingPayload => {
  const schema = getBriefingSchema(category);
  const normalizedAnswers = schema.fields.reduce<BriefingAnswers>((acc, field) => {
    acc[field.key] = (answers[field.key] ?? "").trim();
    return acc;
  }, {});

  return {
    category: schema.category,
    answers: normalizedAnswers,
    fields: schema.fields.map((field) => ({
      key: field.key,
      label: field.label,
      value: normalizedAnswers[field.key] ?? "",
    })),
    saved_at: new Date().toISOString(),
  };
};

export const normalizeBriefingPayload = (
  raw: Json | unknown,
  fallbackCategory?: string | null,
): StoredBriefingPayload | null => {
  if (!raw) return null;

  const record = asRecord(raw);
  const storedCategory =
    typeof record.category === "string" ? record.category : fallbackCategory ?? DEFAULT_CATEGORY;
  const schema = getBriefingSchema(storedCategory);

  if (Array.isArray(record.fields)) {
    const fields = record.fields
      .map((item) => {
        const parsed = asRecord(item);
        const key = typeof parsed.key === "string" ? parsed.key : "";
        if (!key) return null;
        return {
          key,
          label: typeof parsed.label === "string" ? parsed.label : toLegacyLabel(key),
          value: typeof parsed.value === "string" ? parsed.value : "",
        };
      })
      .filter((item): item is StoredBriefingField => Boolean(item));

    const answers = Object.fromEntries(fields.map((field) => [field.key, field.value]));
    return {
      category: schema.category,
      fields,
      answers,
      saved_at:
        typeof record.saved_at === "string"
          ? record.saved_at
          : typeof record.savedAt === "string"
            ? record.savedAt
            : new Date().toISOString(),
    };
  }

  const metaKeys = new Set(["category", "answers", "fields", "saved_at", "savedAt"]);
  const answersSource = record.answers ? asStringMap(record.answers) : asStringMap(
    Object.fromEntries(Object.entries(record).filter(([key]) => !metaKeys.has(key))),
  );

  const schemaFieldKeys = new Set(schema.fields.map((field) => field.key));
  const schemaFields: StoredBriefingField[] = schema.fields.map((field) => ({
    key: field.key,
    label: field.label,
    value: answersSource[field.key] ?? "",
  }));

  const extraFields: StoredBriefingField[] = Object.entries(answersSource)
    .filter(([key]) => !schemaFieldKeys.has(key))
    .map(([key, value]) => ({
      key,
      label: toLegacyLabel(key),
      value,
    }));

  const fields = [...schemaFields, ...extraFields];

  if (fields.every((field) => !field.value.trim())) {
    return null;
  }

  return {
    category: schema.category,
    answers: Object.fromEntries(fields.map((field) => [field.key, field.value])),
    fields,
    saved_at:
      typeof record.saved_at === "string"
        ? record.saved_at
        : typeof record.savedAt === "string"
          ? record.savedAt
          : new Date().toISOString(),
  };
};

export const buildBriefingText = (
  briefing: StoredBriefingPayload,
  productName: string,
): string => {
  const lines: string[] = [
    `Produto: ${productName}`,
    `Categoria: ${getCategoryLabel(briefing.category)}`,
    `Data de preenchimento: ${new Date(briefing.saved_at).toLocaleString("pt-BR")}`,
    "",
    "RESPOSTAS",
    "==============================",
  ];

  briefing.fields
    .filter((field) => field.value.trim().length > 0)
    .forEach((field) => {
      lines.push("", field.label, field.value.trim());
    });

  return lines.join("\n");
};
