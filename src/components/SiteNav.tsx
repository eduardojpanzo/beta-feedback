import { Link } from "@tanstack/react-router";

export function SiteNav() {
  return (
    <header className="border-b border-border bg-card">
      <nav className="mx-auto flex max-w-3xl items-center gap-1 px-4 py-3 text-sm">
        <span className="mr-auto font-semibold tracking-tight">Beta Feedback</span>
        <Link
          to="/"
          activeOptions={{ exact: true }}
          className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-accent"
          activeProps={{ className: "bg-accent text-foreground" }}
        >
          Reportar
        </Link>
        <Link
          to="/reports"
          className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-accent"
          activeProps={{ className: "bg-accent text-foreground" }}
        >
          Ver reports
        </Link>
        <Link
          to="/admin"
          className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-accent"
          activeProps={{ className: "bg-accent text-foreground" }}
        >
          Admin
        </Link>
      </nav>
    </header>
  );
}
