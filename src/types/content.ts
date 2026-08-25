export type ContentType = "curso" | "aula" | "entrevista" | "live" | "parceiro";

export type CategorySlug =
  | "vendas"
  | "gestao"
  | "marketing"
  | "compras"
  | "financeiro"
  | "pessoas"
  | "lideranca"
  | "operacao"
  | "tecnologia";

export interface Category {
  slug: CategorySlug;
  name: string;
}

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  mentor: string;
  category: CategorySlug;
  type: ContentType;
  duration: string;
  image: string;
  partner?: string;
  progress?: number;
  featured?: boolean;
}
