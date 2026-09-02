export type Estado = "nao_visto" | "em_progresso" | "resolvido";

export type Report = {
  id: string;
  created_at: string;
  nome: string | null;
  tipo: string;
  mensagem: string;
  estado: Estado;
};

export const TIPOS = [
  { value: "bug", label: "Bug / Erro", emoji: "🐞" },
  { value: "falha", label: "Falha de funcionalidade", emoji: "⚠️" },
  { value: "sugestao", label: "Sugestão de melhoria", emoji: "💡" },
  { value: "ui", label: "Problema de interface (UI/UX)", emoji: "🎨" },
  { value: "outro", label: "Outro", emoji: "📝" },
] as const;

export const ESTADOS: { value: Estado; label: string; className: string }[] = [
  {
    value: "nao_visto",
    label: "Não visto",
    className: "bg-status-open-soft text-status-open border-status-open/30",
  },
  {
    value: "em_progresso",
    label: "A resolver",
    className:
      "bg-status-progress-soft text-status-progress border-status-progress/30",
  },
  {
    value: "resolvido",
    label: "Resolvido",
    className: "bg-status-done-soft text-status-done border-status-done/30",
  },
];

export function tipoInfo(value: string) {
  return TIPOS.find((t) => t.value === value) ?? { value, label: value, emoji: "📝" };
}

export function estadoInfo(value: string) {
  return ESTADOS.find((e) => e.value === value) ?? ESTADOS[0]!;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
