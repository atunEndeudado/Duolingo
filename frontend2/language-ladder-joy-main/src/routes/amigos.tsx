import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Flame, Zap, UserPlus, UserMinus, Check, X, Clock, Crown, Search, LoaderCircle } from "lucide-react";

import * as api from "@/lib/api";
import { useApp } from "@/lib/store";
import { requireAuth } from "@/lib/routeGuards";
import type { Usuario } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/amigos")({
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: "Amigos y solicitudes — Duolingo" },
      {
        name: "description",
        content:
          "Enviá solicitudes de amistad: la otra persona decide si acepta. Después compará XP y racha.",
      },
      { property: "og:title", content: "Amigos y solicitudes — Duolingo" },
      { property: "og:description", content: "Solicitudes de amistad con confirmación de ambas partes." },
    ],
  }),
  component: Amigos,
});

// HU8 — POST /usuarios/{id}/solicitudes · PATCH /solicitudes/{id} · GET /usuarios/{id}/amigos
function Amigos() {
  const {
    db,
    usuario,
    enviarSolicitud,
    responderSolicitud,
    cancelarSolicitud,
    eliminarAmigo,
    buscarUsuarios,
    obtenerSugerencias,
  } = useApp();
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState<Usuario[]>([]);
  const [sugerencias, setSugerencias] = useState<Usuario[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);

  useEffect(() => {
    if (!usuario || !/^\d+$/.test(usuario.id)) {
      setLoadingSuggestions(false);
      setSugerencias([]);
      return;
    }
    setLoadingSuggestions(true);
    setSuggestionsError(null);
    obtenerSugerencias(usuario.id)
      .then(setSugerencias)
      .catch((reason: unknown) => {
        const message = reason instanceof Error ? reason.message : "No se pudieron cargar las sugerencias";
        setSuggestionsError(message);
        setSugerencias([]);
      })
      .finally(() => setLoadingSuggestions(false));
  }, [obtenerSugerencias, usuario]);

  useEffect(() => {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2) {
      setResultados([]);
      setLoadingSearch(false);
      return;
    }
    const timeout = window.setTimeout(() => {
      setLoadingSearch(true);
      setSearchError(null);
      buscarUsuarios(trimmedQuery)
        .then(setResultados)
        .catch((reason: unknown) => {
          const message = reason instanceof Error ? reason.message : "No se pudo buscar usuarios";
          setSearchError(message);
          setResultados([]);
        })
        .finally(() => setLoadingSearch(false));
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [buscarUsuarios, query]);

  if (!usuario) {
    return <p className="text-sm text-muted-foreground">Registrate para agregar amigos.</p>;
  }

  const misAmigos = api.amigosDeUsuario(db, usuario.id);
  const misAmigosIds = new Set(misAmigos.map((a) => a.id));
  const recibidas = api.solicitudesRecibidas(db, usuario.id);
  const enviadas = api.solicitudesEnviadas(db, usuario.id);
  const pendientesIds = new Set([
    ...recibidas.map((r) => r.usuario.id),
    ...enviadas.map((r) => r.usuario.id),
  ]);
  const usuariosSugeridos = sugerencias.filter(
    (u) => u.id !== usuario.id && !misAmigosIds.has(u.id) && !pendientesIds.has(u.id),
  );

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl">Amigos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {misAmigos.length} amigos · {recibidas.length} solicitudes recibidas · {enviadas.length}{" "}
          enviadas. Una amistad se crea solo cuando la otra persona acepta.
        </p>
      </header>

      <section>
        <h2 className="text-xl">Buscar usuarios</h2>
        <div className="mt-3 flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nombre o email"
              aria-label="Buscar usuarios por nombre o email"
              className="pl-9"
            />
          </div>
          {loadingSearch ? <LoaderCircle className="mt-2 size-5 animate-spin text-muted-foreground" /> : null}
        </div>
        {searchError ? <p className="mt-2 text-sm text-destructive">{searchError}</p> : null}
        {query.trim().length >= 2 ? (
          <ul className="mt-3 card-pop divide-y-2 divide-border">
            {resultados
              .filter((u) => u.id !== usuario.id)
              .map((u) => (
                <li key={u.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <span className="grid size-10 place-items-center rounded-2xl bg-accent text-base font-extrabold text-accent-foreground">
                    {u.nombre.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-32 flex-1">
                    <p className="font-semibold leading-tight">{u.nombre}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => enviarSolicitud(u.id)}>
                    <UserPlus className="mr-1 size-4" /> Enviar solicitud
                  </Button>
                </li>
              ))}
            {!loadingSearch && resultados.filter((u) => u.id !== usuario.id).length === 0 ? (
              <li className="px-4 py-3 text-sm text-muted-foreground">No se encontraron usuarios.</li>
            ) : null}
          </ul>
        ) : null}
      </section>

      <section>
        <h2 className="text-xl">Solicitudes recibidas</h2>
        <p className="text-sm text-muted-foreground">
          ¿Querés ser amigo/a de estas personas? Vos decidís.
        </p>
        <ul className="mt-3 card-pop divide-y-2 divide-border">
          {recibidas.map(({ solicitud, usuario: u }) => (
            <li key={solicitud.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <span className="grid size-10 place-items-center rounded-2xl bg-accent text-base font-extrabold text-accent-foreground">
                {u.nombre.charAt(0)}
              </span>
              <div className="min-w-32 flex-1">
                <p className="font-semibold leading-tight">{u.nombre}</p>
                <p className="text-xs text-muted-foreground">
                  Te envió una solicitud · {u.xp_total} XP
                </p>
              </div>
              <Button size="sm" onClick={() => responderSolicitud(solicitud.id, true)}>
                <Check className="mr-1 size-4" /> Aceptar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => responderSolicitud(solicitud.id, false)}
              >
                <X className="mr-1 size-4" /> Rechazar
              </Button>
            </li>
          ))}
          {recibidas.length === 0 ? (
            <li className="px-4 py-3 text-sm text-muted-foreground">No tenés solicitudes nuevas.</li>
          ) : null}
        </ul>
      </section>

      {enviadas.length > 0 ? (
        <section>
          <h2 className="text-xl">Solicitudes enviadas</h2>
          <ul className="mt-3 card-pop divide-y-2 divide-border">
            {enviadas.map(({ solicitud, usuario: u }) => (
              <li key={solicitud.id} className="flex items-center gap-3 px-4 py-3">
                <Clock className="size-4 text-muted-foreground" />
                <span className="flex-1 truncate font-semibold">{u.nombre}</span>
                <span className="text-xs text-muted-foreground">Esperando respuesta</span>
                <Button size="sm" variant="ghost" onClick={() => cancelarSolicitud(solicitud.id)}>
                  Cancelar
                </Button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2">
        {misAmigos.map((a) => (
          <article key={a.id} className="card-pop flex items-center gap-4 p-4">
            <span className="grid size-11 place-items-center rounded-2xl bg-secondary text-lg font-extrabold text-secondary-foreground">
              {a.nombre.charAt(0)}
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-base leading-tight">
                {a.nombre}
                {a.premium ? <Crown className="ml-1 inline size-4 text-badge" /> : null}
              </h2>
              <p className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1 font-bold text-xp-foreground">
                  <Zap className="size-3.5" />
                  {a.xp_total} XP
                </span>
                <span className="flex items-center gap-1 font-bold text-streak">
                  <Flame className="size-3.5" />
                  {a.racha_dias} d
                </span>
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Eliminar a ${a.nombre}`}
              onClick={() => eliminarAmigo(a.id)}
            >
              <UserMinus className="size-4" />
            </Button>
          </article>
        ))}
        {misAmigos.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no agregaste a nadie.</p>
        ) : null}
      </section>

      <section>
        <h2 className="text-xl">Sugerencias de amigos</h2>
        {suggestionsError ? (
          <p className="mt-2 text-sm text-muted-foreground">No se pudieron cargar las sugerencias.</p>
        ) : null}
        <ul className="mt-3 card-pop divide-y-2 divide-border">
          {loadingSuggestions ? (
            <li className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" /> Cargando sugerencias...
            </li>
          ) : usuariosSugeridos.map((u) => (
            <li key={u.id} className="flex items-center gap-4 px-4 py-3">
              <span className="flex-1 truncate font-semibold">{u.nombre}</span>
              <span className="text-sm text-muted-foreground">{u.xp_total} XP</span>
              <Button size="sm" variant="outline" onClick={() => enviarSolicitud(u.id)}>
                <UserPlus className="mr-1 size-4" /> Enviar solicitud
              </Button>
            </li>
          ))}
          {!loadingSuggestions && usuariosSugeridos.length === 0 ? (
            <li className="px-4 py-3 text-sm text-muted-foreground">
              No hay sugerencias disponibles.
            </li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
