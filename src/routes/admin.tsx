import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav } from "@/components/SiteNav";
import { ESTADOS, type Estado } from "@/lib/reports";
import { ReportCard, fetchReports } from "./reports";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin — Beta Feedback" },
      { name: "description", content: "Gestão dos reports do beta teste." },
      { property: "og:title", content: "Admin — Beta Feedback" },
      { property: "og:description", content: "Gestão dos reports do beta teste." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-4 py-8">
        {!ready ? (
          <p className="text-sm text-muted-foreground">A carregar…</p>
        ) : session ? (
          <AdminList email={session.user.email ?? ""} />
        ) : (
          <LoginForm />
        )}
      </main>
    </div>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent, mode: "in" | "up") {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const { error } =
      mode === "in"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${window.location.origin}/admin` },
          });
    setLoading(false);
    if (error) setMsg(error.message);
    else if (mode === "up") setMsg("Conta criada. Já podes iniciar sessão.");
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-2xl font-semibold tracking-tight">Área de admin</h1>
      <p className="mt-1 text-sm text-muted-foreground">Inicia sessão para gerir reports.</p>
      <form onSubmit={(e) => submit(e, "in")} className="mt-6 space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            Entrar
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={(e) => submit(e, "up")}
            className="rounded-md border border-input px-4 py-2 text-sm hover:bg-accent disabled:opacity-50"
          >
            Criar conta
          </button>
        </div>
      </form>
    </div>
  );
}

function AdminList({ email }: { email: string }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["reports"], queryFn: fetchReports });

  async function setEstado(id: string, estado: Estado) {
    await supabase.from("reports").update({ estado }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["reports"] });
  }

  async function remover(id: string) {
    if (!confirm("Apagar este report?")) return;
    await supabase.from("reports").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["reports"] });
  }

  async function sair() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="mr-auto text-2xl font-semibold tracking-tight">Gestão de reports</h1>
        <span className="text-xs text-muted-foreground">{email}</span>
        <button
          onClick={sair}
          className="rounded-md border border-input px-3 py-1.5 text-sm hover:bg-accent"
        >
          Sair
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {isLoading && <p className="text-sm text-muted-foreground">A carregar…</p>}
        {(data ?? []).map((r) => (
          <ReportCard key={r.id} report={r}>
            <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
              {ESTADOS.map((e) => (
                <button
                  key={e.value}
                  onClick={() => setEstado(r.id, e.value)}
                  disabled={r.estado === e.value}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:opacity-40 ${e.className}`}
                >
                  {e.label}
                </button>
              ))}
              <button
                onClick={() => remover(r.id)}
                className="ml-auto rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:bg-accent"
              >
                Apagar
              </button>
            </div>
          </ReportCard>
        ))}
      </div>
    </>
  );
}
