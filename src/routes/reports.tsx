import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav } from "@/components/SiteNav";
import {
  ESTADOS,
  estadoInfo,
  formatDate,
  tipoInfo,
  type Estado,
  type Report,
} from "@/lib/reports";

export const Route = createFileRoute("/reports")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Lista de reports — Beta Feedback" },
      {
        name: "description",
        content: "Todos os reports do beta teste com o estado atual de resolução.",
      },
      { property: "og:title", content: "Lista de reports — Beta Feedback" },
      {
        property: "og:description",
        content: "Todos os reports do beta teste com o estado atual de resolução.",
      },
    ],
  }),
  component: ReportsPage,
});

export async function fetchReports(): Promise<Report[]> {
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Report[];
}

function ReportsPage() {
  const [filtro, setFiltro] = useState<Estado | "todos">("todos");
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["reports"],
    queryFn: fetchReports,
    refetchInterval: 15000,
  });

  const reports = (data ?? []).filter((r) => filtro === "todos" || r.estado === filtro);

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="mr-auto text-2xl font-semibold tracking-tight">Reports</h1>
          <button
            onClick={() => refetch()}
            className="rounded-md border border-input px-3 py-1.5 text-sm transition-colors hover:bg-accent"
          >
            {isFetching ? "A atualizar…" : "Atualizar"}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {(["todos", ...ESTADOS.map((e) => e.value)] as const).map((v) => (
            <button
              key={v}
              onClick={() => setFiltro(v as Estado | "todos")}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                filtro === v
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:bg-accent"
              }`}
            >
              {v === "todos" ? "Todos" : estadoInfo(v).label}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          {isLoading && <p className="text-sm text-muted-foreground">A carregar…</p>}
          {!isLoading && reports.length === 0 && (
            <p className="text-sm text-muted-foreground">Sem reports para este filtro.</p>
          )}
          {reports.map((r) => (
            <ReportCard key={r.id} report={r} />
          ))}
        </div>
      </main>
    </div>
  );
}

export function ReportCard({
  report,
  children,
}: {
  report: Report;
  children?: React.ReactNode;
}) {
  const t = tipoInfo(report.tipo);
  const e = estadoInfo(report.estado);
  return (
    <article className="rounded-lg border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium">
          {t.emoji} {t.label}
        </span>
        <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${e.className}`}>
          {e.label}
        </span>
        <span className="ml-auto text-xs text-muted-foreground">
          {formatDate(report.created_at)}
        </span>
      </div>
      <p className="mt-2 whitespace-pre-wrap text-sm">{report.mensagem}</p>
      <p className="mt-2 text-xs text-muted-foreground">
        {report.nome ? `Por ${report.nome}` : "Anónimo"}
      </p>
      {children}
    </article>
  );
}
