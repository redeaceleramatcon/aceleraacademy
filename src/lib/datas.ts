/**
 * Datas sempre no horário de Brasília. O servidor da Vercel roda em UTC; sem o fuso explícito,
 * `toLocaleString("pt-BR")` mostra 3 horas a mais do que o relógio do usuário.
 */
const FUSO = "America/Sao_Paulo";

export function formatarDataHora(valor: string | number | Date): string {
  return new Date(valor).toLocaleString("pt-BR", { timeZone: FUSO });
}

export function formatarData(valor: string | number | Date, opcoes: Intl.DateTimeFormatOptions = {}): string {
  return new Date(valor).toLocaleDateString("pt-BR", { timeZone: FUSO, ...opcoes });
}
