import type { Category, CategorySlug, ContentItem } from "@/types/content";

/**
 * Imagens de demonstração (Unsplash), uma por conteúdo. Centralizadas aqui
 * para que possam ser substituídas facilmente pelas thumbnails oficiais da
 * Acelera mais adiante, sem tocar nos componentes.
 */
function unsplash(id: string, width = 1600) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`;
}

export const categoryNameMap: Record<CategorySlug, string> = {
  vendas: "Vendas",
  gestao: "Gestão",
  marketing: "Marketing",
  compras: "Compras",
  financeiro: "Financeiro",
  pessoas: "Pessoas",
  lideranca: "Liderança",
  operacao: "Operação",
  tecnologia: "Tecnologia",
};

export const categories: Category[] = (
  Object.entries(categoryNameMap) as [CategorySlug, string][]
).map(([slug, name]) => ({ slug, name }));

export const heroContent = {
  eyebrow: "Gestão de loja",
  title: "Transforme gestão em resultado",
  description:
    "Um método prático para líderes de loja organizarem rotina, pessoas e indicadores — e transformarem gestão em resultado real todos os meses.",
  mentor: "Marcos Vinícius",
  duration: "2h 40min",
  category: "Gestão",
  image: unsplash("1552664730-d307ca884978", 1920),
  contentId: "gestao-que-gera-resultado",
};

export const contentItems: ContentItem[] = [
  // Vendas
  {
    id: "arte-de-vender-servicos",
    title: "A Arte de Vender Serviços",
    description:
      "Técnicas práticas para apresentar serviços com clareza e converter mais orçamentos em vendas fechadas.",
    mentor: "Camila Duarte",
    category: "vendas",
    type: "aula",
    duration: "38 min",
    image: unsplash("1556761175-5973dc0f32e7"),
    progress: 62,
  },
  {
    id: "negociacao-de-alta-performance",
    title: "Negociação de Alta Performance",
    description:
      "Estratégias de negociação usadas por times comerciais de alta performance para fechar negócios com margem saudável.",
    mentor: "Rafael Nogueira",
    category: "vendas",
    type: "curso",
    duration: "2h 10min",
    image: unsplash("1521791136064-7986c2920216"),
    featured: true,
  },
  {
    id: "como-fechar-mais-vendas-no-balcao",
    title: "Como Fechar Mais Vendas no Balcão",
    description:
      "Um passo a passo direto para transformar atendimento de balcão em vendas consistentes.",
    mentor: "Bruna Castilho",
    category: "vendas",
    type: "aula",
    duration: "25 min",
    image: unsplash("1600607687939-ce8a6c25118c"),
  },
  {
    id: "vendas-consultivas-para-o-varejo",
    title: "Vendas Consultivas para o Varejo",
    description:
      "Como aplicar a venda consultiva no dia a dia da loja, entendendo a real necessidade do cliente.",
    mentor: "Eduardo Lima",
    category: "vendas",
    type: "curso",
    duration: "3h 05min",
    image: unsplash("1600880292203-757bb62b4baf"),
  },
  {
    id: "gestao-de-objecoes",
    title: "Gestão de Objeções",
    description:
      "Como identificar, entender e responder às principais objeções dos clientes sem perder a venda.",
    mentor: "Patrícia Ramos",
    category: "vendas",
    type: "aula",
    duration: "30 min",
    image: unsplash("1543269865-cbf427effbad"),
  },
  {
    id: "insights-sobre-mercado-livre",
    title: "Insights sobre Mercado Livre",
    description:
      "Boas práticas para vender mais no Mercado Livre, direto de quem vive o marketplace todos os dias.",
    mentor: "Marcos Vinícius",
    category: "vendas",
    type: "live",
    duration: "50 min",
    image: unsplash("1600880292089-90a7e086ee0c"),
    partner: "Mercado Livre",
    featured: true,
  },

  // Gestão
  {
    id: "gestao-que-gera-resultado",
    title: "Gestão que Gera Resultado",
    description:
      "Um método prático para organizar rotina, pessoas e indicadores e transformar gestão em resultado real.",
    mentor: "Marcos Vinícius",
    category: "gestao",
    type: "curso",
    duration: "2h 40min",
    image: unsplash("1552664730-d307ca884978"),
    progress: 18,
  },
  {
    id: "indicadores-que-todo-gestor-deveria-acompanhar",
    title: "Indicadores que Todo Gestor Deveria Acompanhar",
    description:
      "Os indicadores essenciais para acompanhar a saúde do negócio sem se perder em planilhas.",
    mentor: "Juliana Prado",
    category: "gestao",
    type: "aula",
    duration: "34 min",
    image: unsplash("1507679799987-c73779587ccf"),
  },
  {
    id: "gestao-de-estoque-inteligente",
    title: "Gestão de Estoque Inteligente",
    description:
      "Como equilibrar giro, ruptura e capital parado com uma gestão de estoque mais inteligente.",
    mentor: "Thiago Salles",
    category: "gestao",
    type: "curso",
    duration: "1h 50min",
    image: unsplash("1600585154340-be6161a56a0c"),
  },
  {
    id: "rotina-de-gestao-para-lojas",
    title: "Rotina de Gestão para Lojas",
    description:
      "Uma rotina simples e replicável para líderes de loja organizarem a semana com foco no que importa.",
    mentor: "André Bittencourt",
    category: "gestao",
    type: "aula",
    duration: "28 min",
    image: unsplash("1541888946425-d81bb19240f5"),
  },
  {
    id: "diagnostico-operacional-da-equipe",
    title: "Diagnóstico Operacional da Equipe",
    description:
      "Uma consultoria ao vivo para identificar gargalos operacionais e oportunidades de melhoria na equipe.",
    mentor: "Larissa Menezes",
    category: "gestao",
    type: "live",
    duration: "55 min",
    image: unsplash("1531973576160-7125cd663d86"),
    partner: "Consultoria Ápice",
    featured: true,
  },

  // Marketing
  {
    id: "marketing-digital-para-o-varejo",
    title: "Marketing Digital para o Varejo",
    description:
      "Como estruturar uma presença digital que gera tráfego qualificado para a loja física e online.",
    mentor: "Camila Duarte",
    category: "marketing",
    type: "curso",
    duration: "2h 15min",
    image: unsplash("1522071820081-009f0129c71c"),
  },
  {
    id: "como-criar-ofertas-irresistiveis",
    title: "Como Criar Ofertas Irresistíveis",
    description:
      "Princípios de copywriting e precificação para criar ofertas que realmente convertem.",
    mentor: "Rafael Nogueira",
    category: "marketing",
    type: "aula",
    duration: "22 min",
    image: unsplash("1573496359142-b8d87734a5a2"),
  },
  {
    id: "redes-sociais-que-vendem",
    title: "Redes Sociais que Vendem",
    description:
      "Como transformar redes sociais em canal de vendas com conteúdo simples e consistente.",
    mentor: "Bruna Castilho",
    category: "marketing",
    type: "aula",
    duration: "27 min",
    image: unsplash("1522075469751-3a6694fb2f61"),
  },
  {
    id: "branding-para-lojas-regionais",
    title: "Branding para Lojas Regionais",
    description:
      "Uma conversa sobre como construir uma marca forte mesmo operando em mercados regionais.",
    mentor: "Eduardo Lima",
    category: "marketing",
    type: "entrevista",
    duration: "40 min",
    image: unsplash("1517245386807-bb43f82c33c4"),
    featured: true,
  },

  // Compras
  {
    id: "negociacao-com-fornecedores",
    title: "Negociação com Fornecedores",
    description:
      "Táticas de negociação para melhorar prazos, condições e margem junto aos fornecedores.",
    mentor: "Patrícia Ramos",
    category: "compras",
    type: "curso",
    duration: "1h 30min",
    image: unsplash("1553877522-43269d4ea984"),
  },
  {
    id: "gestao-de-compras-e-reposicao",
    title: "Gestão de Compras e Reposição",
    description:
      "Como planejar compras e reposição para evitar ruptura sem travar capital em excesso de estoque.",
    mentor: "Juliana Prado",
    category: "compras",
    type: "aula",
    duration: "32 min",
    image: unsplash("1573164713988-8665fc963095"),
  },

  // Financeiro
  {
    id: "financas-para-nao-financeiros",
    title: "Finanças para Não Financeiros",
    description:
      "Os fundamentos financeiros que todo gestor precisa dominar, mesmo sem formação na área.",
    mentor: "Thiago Salles",
    category: "financeiro",
    type: "curso",
    duration: "2h 20min",
    image: unsplash("1560472354-b33ff0c44a43"),
  },
  {
    id: "fluxo-de-caixa-na-pratica",
    title: "Fluxo de Caixa na Prática",
    description:
      "Como montar e acompanhar um fluxo de caixa simples que dá visibilidade real do negócio.",
    mentor: "André Bittencourt",
    category: "financeiro",
    type: "aula",
    duration: "29 min",
    image: unsplash("1552581234-26160f608093"),
  },
  {
    id: "insights-de-contabilidade",
    title: "Insights de Contabilidade",
    description:
      "Uma live com especialistas em contabilidade para tirar dúvidas comuns do dia a dia do lojista.",
    mentor: "Larissa Menezes",
    category: "financeiro",
    type: "live",
    duration: "48 min",
    image: unsplash("1543269664-56d93c1b41a6"),
    partner: "Contabilidade Prime",
  },

  // Pessoas
  {
    id: "confianca-uma-questao-de-coragem",
    title: "Confiança: Uma Questão de Coragem",
    description:
      "Uma reflexão sobre como a coragem, mais do que a confiança pronta, move quem lidera pessoas e negócios.",
    mentor: "Camila Duarte",
    category: "pessoas",
    type: "aula",
    duration: "24 min",
    image: unsplash("1521737604893-d14cc237f11d"),
    progress: 90,
  },
  {
    id: "comunicacao-oral-e-eficaz",
    title: "Comunicação Oral e Eficaz",
    description:
      "Ferramentas práticas para se comunicar com clareza em reuniões, treinamentos e conversas difíceis.",
    mentor: "Rafael Nogueira",
    category: "pessoas",
    type: "curso",
    duration: "1h 15min",
    image: unsplash("1519389950473-47ba0277781c"),
    progress: 45,
  },
  {
    id: "nr1-na-pratica",
    title: "NR-1 na Prática",
    description:
      "O que muda na prática com a NR-1 e como aplicar a norma sem burocratizar a gestão de pessoas.",
    mentor: "Bruna Castilho",
    category: "pessoas",
    type: "live",
    duration: "52 min",
    image: unsplash("1573497491208-6b1acb260507"),
    partner: "SESI",
  },
  {
    id: "recrutamento-e-selecao-no-varejo",
    title: "Recrutamento e Seleção no Varejo",
    description: "Como estruturar um processo seletivo simples para contratar melhor no varejo.",
    mentor: "Eduardo Lima",
    category: "pessoas",
    type: "aula",
    duration: "31 min",
    image: unsplash("1450101499163-c8848c66ca85"),
  },

  // Liderança
  {
    id: "a-arte-do-encantamento",
    title: "A Arte do Encantamento",
    description:
      "Como criar experiências que encantam o cliente e transformam a loja em referência na região.",
    mentor: "Patrícia Ramos",
    category: "lideranca",
    type: "curso",
    duration: "1h 40min",
    image: unsplash("1560250097-0b93528c311a"),
    progress: 73,
    featured: true,
  },
  {
    id: "lideranca-situacional",
    title: "Liderança Situacional",
    description:
      "Um modelo prático para adaptar o estilo de liderança ao momento e à maturidade de cada pessoa do time.",
    mentor: "Marcos Vinícius",
    category: "lideranca",
    type: "curso",
    duration: "2h 05min",
    image: unsplash("1454165804606-c3d57bc86b40"),
  },
  {
    id: "gestao-e-performance",
    title: "Gestão e Performance",
    description:
      "Uma conversa sobre como unir gestão de pessoas e indicadores para elevar a performance do time.",
    mentor: "Juliana Prado",
    category: "lideranca",
    type: "live",
    duration: "46 min",
    image: unsplash("1560179707-f14e90ef3623"),
    partner: "Sebrae",
  },
  {
    id: "feedback-que-transforma-times",
    title: "Feedback que Transforma Times",
    description:
      "Como dar feedbacks que realmente geram desenvolvimento, sem gerar desconforto desnecessário.",
    mentor: "Thiago Salles",
    category: "lideranca",
    type: "aula",
    duration: "26 min",
    image: unsplash("1517048676732-d65bc937f952"),
  },

  // Operação
  {
    id: "excelencia-no-atendimento",
    title: "Excelência no Atendimento",
    description:
      "Padrões simples de atendimento que elevam a experiência do cliente em qualquer ponto de contato.",
    mentor: "André Bittencourt",
    category: "operacao",
    type: "aula",
    duration: "33 min",
    image: unsplash("1556740758-90de374c12ad"),
  },
  {
    id: "seguranca-e-prevencao-de-perdas",
    title: "Segurança e Prevenção de Perdas",
    description:
      "Boas práticas operacionais para reduzir perdas e aumentar a segurança dentro da loja.",
    mentor: "Larissa Menezes",
    category: "operacao",
    type: "curso",
    duration: "1h 20min",
    image: unsplash("1557804506-669a67965ba0"),
  },

  // Tecnologia
  {
    id: "tecnologia-aplicada-ao-varejo-de-materiais",
    title: "Tecnologia Aplicada ao Varejo de Materiais",
    description:
      "Como a tecnologia está transformando a gestão e a venda no varejo de materiais de construção.",
    mentor: "Camila Duarte",
    category: "tecnologia",
    type: "parceiro",
    duration: "36 min",
    image: unsplash("1444653614773-995cb1ef9efa"),
    partner: "TechVarejo",
    featured: true,
  },
];

const continueWatchingOrder = [
  "arte-de-vender-servicos",
  "a-arte-do-encantamento",
  "comunicacao-oral-e-eficaz",
  "confianca-uma-questao-de-coragem",
  "gestao-que-gera-resultado",
];

export function getContinueWatching(): ContentItem[] {
  return continueWatchingOrder
    .map((id) => contentItems.find((item) => item.id === id))
    .filter((item): item is ContentItem => Boolean(item));
}

export function getFeatured(): ContentItem[] {
  return contentItems.filter((item) => item.featured);
}

export function getLives(): ContentItem[] {
  return contentItems.filter((item) => item.type === "live");
}

export function getByCategory(slug: CategorySlug): ContentItem[] {
  return contentItems.filter((item) => item.category === slug);
}

export function getContentById(id: string): ContentItem | undefined {
  return contentItems.find((item) => item.id === id);
}
