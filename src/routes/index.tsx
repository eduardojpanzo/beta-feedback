import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SiteNav } from "@/components/SiteNav";
import { TIPOS } from "@/lib/reports";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Reportar problema — Beta Feedback" },
      {
        name: "description",
        content:
          "Envia bugs, falhas e sugestões durante o beta teste. Sem login, em segundos.",
      },
      { property: "og:title", content: "Reportar problema — Beta Feedback" },
      {
        property: "og:description",
        content: "Envia bugs, falhas e sugestões durante o beta teste.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<string>(TIPOS[0].value);
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!mensagem.trim()) return;
    setLoading(true);
    setErro(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("reports").insert({
        nome: nome.trim() || null,
        tipo,
        mensagem: mensagem.trim(),
      });
      if (error) {
        console.error("[Supabase insert error]", error);
        setErro("Não foi possível enviar. Tenta novamente.");
        return;
      }
      setOk(true);
      setNome("");
      setTipo(TIPOS[0].value);
      setMensagem("");
    } catch (err) {
      console.error("[Unexpected error]", err);
      setErro("Erro inesperado. Tenta novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">Reportar problema</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Descreve o que aconteceu. Não precisas de conta.
        </p>

        {ok && (
          <div className="mt-6 rounded-lg border border-status-done/30 bg-status-done-soft px-4 py-3 text-sm text-status-done">
            Report enviado. Obrigado pelo feedback!
          </div>
        )}
        {erro && (
          <div className="mt-6 rounded-lg border border-status-open/30 bg-status-open-soft px-4 py-3 text-sm text-status-open">
            {erro}
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="nome" className="mb-1.5 block text-sm font-medium">
              Nome <span className="text-muted-foreground">(opcional)</span>
            </label>
            <input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="O teu nome"
              className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label htmlFor="tipo" className="mb-1.5 block text-sm font-medium">
              Tipo de report
            </label>
            <select
              id="tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              {TIPOS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.emoji} {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="mensagem" className="mb-1.5 block text-sm font-medium">
              Mensagem
            </label>
            <textarea
              id="mensagem"
              required
              rows={7}
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder="Descreve o problema com o máximo de detalhe possível…"
              className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 sm:w-auto"
          >
            {loading ? "A enviar…" : "Enviar Report"}
          </button>
        </form>
      </main>
    </div>
  );
}
