import { Link } from "@tanstack/react-router";
import { Flame, Zap, Menu, LogOut } from "lucide-react";
import type { ReactNode } from "react";

import { useApp } from "@/lib/store";
import { useAuth } from "@/lib/authContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/", label: "Inicio" },
  { to: "/cursos", label: "Cursos" },
  { to: "/ranking", label: "Ranking" },
  { to: "/amigos", label: "Amigos" },
  { to: "/insignias", label: "Insignias" },
  { to: "/premium", label: "Premium" },
  { to: "/actividad", label: "Actividad" },
  { to: "/admin", label: "Admin" },
] as const;

function NavLinks({ onNavigate, isAdmin = false }: { onNavigate?: () => void; isAdmin?: boolean }) {
  const navItems = NAV.filter((item) => {
    // Solo mostrar Admin si el usuario es admin
    if (item.to === "/admin" && !isAdmin) {
      return false;
    }
    return true;
  });

  return (
    <>
      {navItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className="rounded-xl px-3 py-2 text-sm font-bold text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
          activeProps={{ className: "bg-secondary text-secondary-foreground" }}
          activeOptions={{ exact: item.to === "/" }}
        >
          {item.label}
        </Link>
      ))}
    </>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { usuario } = useApp();
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b-2 border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-2xl bg-primary text-lg text-primary-foreground shadow-pop">
              🦉
            </span>
            <span className="text-display text-xl font-extrabold tracking-tight">Duolingo</span>
          </Link>

          <nav className="ml-4 hidden items-center gap-1 lg:flex">
            <NavLinks isAdmin={usuario?.es_admin ?? false} />
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {usuario && (
                  <>
                    <span className="flex items-center gap-1 rounded-xl bg-streak/15 px-2.5 py-1.5 text-sm font-extrabold text-streak">
                      <Flame className="size-4" /> {usuario.racha_dias}
                    </span>
                    <span className="flex items-center gap-1 rounded-xl bg-xp/20 px-2.5 py-1.5 text-sm font-extrabold text-xp-foreground">
                      <Zap className="size-4" /> {usuario.xp_total} XP
                    </span>
                    <Link
                      to="/perfil"
                      className="hidden rounded-xl border-2 border-border px-2.5 py-1.5 text-sm font-bold sm:block"
                    >
                      {usuario.nombre.split(" ")[0]}
                    </Link>
                  </>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="gap-2"
                  title="Cerrar sesión"
                >
                  <LogOut className="size-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="outline" size="sm" className="hidden sm:flex">
                  <Link to="/login">Iniciar sesión</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/registro">Registrarme</Link>
                </Button>
              </>
            )}

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden" aria-label="Menú">
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <SheetHeader>
                  <SheetTitle className="text-display">Navegación</SheetTitle>
                </SheetHeader>
                <nav className="mt-4 flex flex-col gap-1 px-4">
                  <NavLinks isAdmin={usuario?.es_admin ?? false} />
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>

      <footer className="border-t-2 border-border py-6 text-center text-xs text-muted-foreground">
        Duolingo · aprendizaje de idiomas
      </footer>
    </div>
  );
}
