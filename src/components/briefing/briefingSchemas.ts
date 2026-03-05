import { type Json } from "@/integrations/supabase/types";

export type ProductCategory = "infoproduto" | "prestacao_servico" | "mentoria" | "ecommerce";

type BriefingFieldType = "input" | "textarea";

export interface BriefingFieldDefinition {
  key: string;
  label: string;
  placeholder: string;
  type: BriefingFieldType;
  required?: boolean;
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

const baseRequired = { required: true as const };

export const BRIEFING_SCHEMAS: Record<ProductCategory, BriefingSchema> = {
  infoproduto: {
    category: "infoproduto",
    title: "Briefing — Infoproduto",
    description: "Preencha os campos para orientar estratégia, copy e produção de criativos.",
    fileTitle: "Briefing Infoproduto",
    fields: [
      { key: "empresa", label: "Nome da sua empresa", placeholder: "Ex: Ayres Marketing", type: "input", ...baseRequired },
      { key: "produto", label: "1. Qual é o seu produto? O que exatamente você entrega?", placeholder: "Ex: Curso online de inglês para iniciantes com foco em conversação.", type: "textarea", ...baseRequired },
      { key: "transformacao", label: "2. Qual é a principal transformação que seu cliente terá?", placeholder: "Ex: Falar inglês com segurança em até 3 meses.", type: "textarea", ...baseRequired },
      { key: "diferencial", label: "3. O que torna seu produto diferente dos concorrentes?", placeholder: "Ex: Metodologia prática com suporte diário.", type: "textarea", ...baseRequired },
      { key: "cliente_ideal", label: "4. Quem é o seu cliente ideal?", placeholder: "Ex: Mulheres de 30 a 45 anos, empreendedoras.", type: "textarea", ...baseRequired },
      { key: "maior_dor", label: "5. Qual é a maior dor desse público hoje?", placeholder: "Ex: Falta de direção e excesso de tentativas sem resultado.", type: "textarea", ...baseRequired },
      { key: "tentativas_anteriores", label: "6. Quais tentativas anteriores já foram feitas?", placeholder: "Ex: Cursos gravados sem acompanhamento e mentorias genéricas.", type: "textarea", ...baseRequired },
      { key: "desejo", label: "7. Qual desejo profundo esse cliente quer conquistar?", placeholder: "Ex: Viver da internet com previsibilidade.", type: "textarea", ...baseRequired },
      { key: "frase_eu_ajudo", label: "8. Complete: Eu ajudo [público] a [resultado] em [tempo] sem [sacrifício]", placeholder: "Ex: Eu ajudo mães ocupadas a vender todos os dias em 90 dias sem virar escrava do celular.", type: "textarea", ...baseRequired },
      { key: "crencas_mitos", label: "9. Quais crenças ou mitos esse público acredita?", placeholder: "Ex: Que só dá certo para quem já é conhecido.", type: "textarea", ...baseRequired },
      { key: "objecoes", label: "10. Quais são as 3 maiores objeções na venda?", placeholder: "Ex: Não tenho tempo / Já tentei antes / Está caro.", type: "textarea", ...baseRequired },
      { key: "preco_incluso", label: "11. Qual preço atual e o que está incluso?", placeholder: "Ex: R$497 à vista com suporte e bônus.", type: "textarea", ...baseRequired },
      { key: "valor_resolver", label: "12. Quanto vale resolver esse problema hoje?", placeholder: "Ex: Pode representar +R$5.000/mês em receita.", type: "textarea", ...baseRequired },
      { key: "garantia", label: "13. Existe garantia ou promessa atual?", placeholder: "Ex: Garantia incondicional de 7 dias.", type: "textarea", ...baseRequired },
      { key: "bonus", label: "14. Quais bônus você oferece (ou pode oferecer)?", placeholder: "Ex: Comunidade, aulas ao vivo e templates.", type: "textarea", ...baseRequired },
      { key: "concorrentes", label: "15. Quem são os concorrentes e o que fazem bem/mal?", placeholder: "Ex: Concorrente X vende bem, mas entrega fraca.", type: "textarea", ...baseRequired },
      { key: "urls_vendas", label: "URLs das páginas de vendas dos concorrentes", placeholder: "https://...", type: "textarea", ...baseRequired },
      { key: "metodologias", label: "Quais diferenciais/metodologias seu produto possui?", placeholder: "Ex: Método ARC com passo a passo validado.", type: "textarea", ...baseRequired },
      { key: "produto_principal", label: "Qual seu produto principal?", placeholder: "Produto foco da operação.", type: "input", ...baseRequired },
      { key: "ticket_medio", label: "Qual seu ticket médio?", placeholder: "Ex: R$497", type: "input", ...baseRequired },
    ],
  },
  prestacao_servico: {
    category: "prestacao_servico",
    title: "Briefing — Prestação de serviço",
    description: "Mapeie oferta, processo comercial e diferenciais do serviço.",
    fileTitle: "Briefing Prestação de Serviço",
    fields: [
      { key: "empresa", label: "Nome da empresa", placeholder: "Ex: Ayres Marketing", type: "input", ...baseRequired },
      { key: "servico_principal", label: "Qual serviço principal você vende?", placeholder: "Ex: Gestão de tráfego para e-commerce.", type: "textarea", ...baseRequired },
      { key: "entregaveis", label: "Quais entregáveis estão inclusos no serviço?", placeholder: "Ex: Planejamento, execução, relatórios e reuniões quinzenais.", type: "textarea", ...baseRequired },
      { key: "prazo_resultado", label: "Em quanto tempo o cliente costuma perceber resultado?", placeholder: "Ex: Primeiros indicadores em 30 dias.", type: "textarea", ...baseRequired },
      { key: "publico_ideal", label: "Quem é o cliente ideal desse serviço?", placeholder: "Ex: Negócios locais faturando acima de R$30 mil/mês.", type: "textarea", ...baseRequired },
      { key: "problema_central", label: "Qual principal problema você resolve?", placeholder: "Ex: Falta de previsibilidade de vendas.", type: "textarea", ...baseRequired },
      { key: "diferenciais", label: "Quais são os diferenciais frente à concorrência?", placeholder: "Ex: Dashboard em tempo real e SLA de atendimento.", type: "textarea", ...baseRequired },
      { key: "provas", label: "Quais provas de resultado você possui?", placeholder: "Ex: Estudos de caso, depoimentos e números reais.", type: "textarea", ...baseRequired },
      { key: "objecoes", label: "Quais objeções mais aparecem na negociação?", placeholder: "Ex: Preço, prazo e confiança.", type: "textarea", ...baseRequired },
      { key: "modelo_contrato", label: "Como funciona contrato e fidelidade?", placeholder: "Ex: Contrato mensal sem fidelidade.", type: "textarea", ...baseRequired },
      { key: "precificacao", label: "Como é a precificação do serviço?", placeholder: "Ex: Mensalidade de R$2.500 + setup.", type: "textarea", ...baseRequired },
      { key: "meta_90_dias", label: "Qual meta comercial para os próximos 90 dias?", placeholder: "Ex: Fechar 10 novos contratos.", type: "textarea", ...baseRequired },
      { key: "concorrentes", label: "Quais concorrentes diretos e indiretos?", placeholder: "Ex: Agência X, consultor Y.", type: "textarea", ...baseRequired },
      { key: "observacoes", label: "Observações importantes", placeholder: "Contextos específicos do negócio.", type: "textarea", ...baseRequired },
    ],
  },
  mentoria: {
    category: "mentoria",
    title: "Briefing — Mentoria",
    description: "Estruture posicionamento, promessa e jornada da mentoria.",
    fileTitle: "Briefing Mentoria",
    fields: [
      { key: "mentor", label: "Nome do mentor(a)", placeholder: "Ex: João Silva", type: "input", ...baseRequired },
      { key: "tema_mentoria", label: "Qual tema central da mentoria?", placeholder: "Ex: Escala de negócios digitais.", type: "textarea", ...baseRequired },
      { key: "promessa", label: "Qual promessa principal da mentoria?", placeholder: "Ex: Dobrar faturamento em 6 meses com método validado.", type: "textarea", ...baseRequired },
      { key: "publico", label: "Quem é o mentorado ideal?", placeholder: "Ex: Infoprodutores com faturamento entre 20k e 100k/mês.", type: "textarea", ...baseRequired },
      { key: "nivel_aluno", label: "Qual nível atual dos alunos?", placeholder: "Iniciante, intermediário ou avançado.", type: "textarea", ...baseRequired },
      { key: "maior_desafio", label: "Qual maior desafio dos mentorados hoje?", placeholder: "Ex: Falta de processo comercial claro.", type: "textarea", ...baseRequired },
      { key: "estrutura", label: "Como a mentoria é estruturada?", placeholder: "Ex: Encontros semanais + comunidade + suporte.", type: "textarea", ...baseRequired },
      { key: "duracao", label: "Qual duração da mentoria?", placeholder: "Ex: 8 semanas.", type: "input", ...baseRequired },
      { key: "bonus", label: "Quais bônus e materiais de apoio existem?", placeholder: "Ex: Templates, playbooks e aulas extras.", type: "textarea", ...baseRequired },
      { key: "provas", label: "Quais provas de resultado dos mentorados?", placeholder: "Ex: Cases e depoimentos com métricas.", type: "textarea", ...baseRequired },
      { key: "objecoes", label: "Quais objeções impedem a compra?", placeholder: "Ex: Falta de tempo, medo de não aplicar.", type: "textarea", ...baseRequired },
      { key: "ticket", label: "Qual ticket da mentoria?", placeholder: "Ex: R$4.997", type: "input", ...baseRequired },
      { key: "vagas", label: "Quantas vagas por turma?", placeholder: "Ex: 20 vagas.", type: "input", ...baseRequired },
      { key: "meta_lancamento", label: "Meta da próxima turma", placeholder: "Ex: 15 novos mentorados.", type: "textarea", ...baseRequired },
    ],
  },
  ecommerce: {
    category: "ecommerce",
    title: "Briefing — E-commerce",
    description: "Mapeie produto, operação e argumentos de venda do e-commerce.",
    fileTitle: "Briefing E-commerce",
    fields: [
      { key: "marca", label: "Nome da marca", placeholder: "Ex: Loja Exemplo", type: "input", ...baseRequired },
      { key: "nicho", label: "Qual nicho principal da loja?", placeholder: "Ex: Moda feminina.", type: "input", ...baseRequired },
      { key: "produtos_campeoes", label: "Quais produtos campeões de venda?", placeholder: "Ex: Vestido X e conjunto Y.", type: "textarea", ...baseRequired },
      { key: "ticket_medio", label: "Qual ticket médio atual?", placeholder: "Ex: R$189", type: "input", ...baseRequired },
      { key: "publico_alvo", label: "Quem é o público-alvo principal?", placeholder: "Ex: Mulheres de 25-40 anos, capitais.", type: "textarea", ...baseRequired },
      { key: "diferenciais", label: "Quais diferenciais competitivos da loja?", placeholder: "Ex: Entrega rápida e troca facilitada.", type: "textarea", ...baseRequired },
      { key: "obstaculos", label: "Quais barreiras de compra mais frequentes?", placeholder: "Ex: Frete, prazo e confiança no site.", type: "textarea", ...baseRequired },
      { key: "estrutura_oferta", label: "Como está estruturada a oferta atual?", placeholder: "Ex: Desconto progressivo + cupom primeira compra.", type: "textarea", ...baseRequired },
      { key: "margin", label: "Margem média por produto", placeholder: "Ex: 35%", type: "input", ...baseRequired },
      { key: "sazonalidades", label: "Existem sazonalidades relevantes?", placeholder: "Ex: Alta no Dia das Mães e Black Friday.", type: "textarea", ...baseRequired },
      { key: "canais", label: "Quais canais trazem mais vendas hoje?", placeholder: "Ex: Meta Ads, Google Shopping e orgânico.", type: "textarea", ...baseRequired },
      { key: "metas", label: "Quais metas de faturamento/ROAS?", placeholder: "Ex: R$150 mil/mês e ROAS 4+.", type: "textarea", ...baseRequired },
      { key: "concorrentes", label: "Principais concorrentes", placeholder: "Ex: Loja A, Loja B.", type: "textarea", ...baseRequired },
      { key: "url_loja", label: "URL da loja", placeholder: "https://...", type: "input", ...baseRequired },
      { key: "observacoes", label: "Observações importantes", placeholder: "Contexto que o time deve saber.", type: "textarea", ...baseRequired },
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
