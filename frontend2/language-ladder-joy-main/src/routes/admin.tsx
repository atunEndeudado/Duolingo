import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import * as api from "@/lib/api";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AgregarIdioma } from "@/components/AgregarIdioma";
import { AgregarPreguntas } from "@/components/AgregarPreguntas";
import { AgregarVocabulario } from "@/components/AgregarVocabulario";
import type { Nivel } from "@/lib/types";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Alta de contenido — Duolingo" },
      {
        name: "description",
        content:
          "Panel de administración: crear cursos por idioma y nivel, y lecciones con orden único y XP entre 5 y 50.",
      },
      { property: "og:title", content: "Alta de contenido — Duolingo" },
      { property: "og:description", content: "Crear cursos y lecciones del catálogo." },
    ],
  }),
  component: Admin,
});

// HU3 — POST /cursos · POST /cursos/{id}/lecciones
function Admin() {
  const { db, crearCurso, crearLeccion, eliminarCurso, eliminarLeccion } = useApp();
  const [refreshKey, setRefreshKey] = useState(0);

  const [idiomaId, setIdiomaId] = useState(db.idiomas[0]?.id ?? "");
  const [nivel, setNivel] = useState<Nivel>("A1");

  const [cursoId, setCursoId] = useState(db.cursos[0]?.id ?? "");
  const [titulo, setTitulo] = useState("");
  const [orden, setOrden] = useState(1);
  const [xp, setXp] = useState(10);

  const lecciones = api.leccionesDeCurso(db, cursoId);

  const handleEliminarCurso = async () => {
    if (!cursoId) return;
    if (!window.confirm("¿Estás seguro de que deseas eliminar este curso? Esta acción eliminará todas las preguntas y progresos asociados.")) {
      return;
    }

    const eliminado = await eliminarCurso(cursoId);
    if (eliminado) {
      const siguienteCurso = db.cursos.find((curso) => curso.id !== cursoId);
      setCursoId(siguienteCurso?.id ?? "");
      setOrden(1);
    }
  };

  const handleEliminarLeccion = async (leccionId: string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta lección? Esta acción eliminará todas las preguntas y progresos asociados.")) {
      return;
    }

    await eliminarLeccion(leccionId);
  };

  useEffect(() => {
    if (!idiomaId && db.idiomas[0]) setIdiomaId(db.idiomas[0].id);
    if (!cursoId && db.cursos[0]) setCursoId(db.cursos[0].id);
  }, [db.idiomas, db.cursos, idiomaId, cursoId]);

  const handleIdiomaCreado = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl">Alta de contenido</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Toda lección pertenece a un curso, el orden es único dentro del curso y la XP va de 5 a 50.
        </p>
      </header>

      <div key={refreshKey} className="grid gap-6 lg:grid-cols-3">
        <AgregarIdioma onIdiomaCreado={handleIdiomaCreado} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <form
          className="card-pop space-y-4 p-6"
          onSubmit={async (e) => {
            e.preventDefault();
            await crearCurso({ idioma_id: idiomaId, nivel });
          }}
        >
          <h2 className="text-xl">Nuevo curso</h2>

          <div className="space-y-2">
            <Label>Idioma</Label>
            <Select value={idiomaId} onValueChange={setIdiomaId}>
              <SelectTrigger>
                <SelectValue placeholder="Elegí un idioma" />
              </SelectTrigger>
              <SelectContent>
                {db.idiomas.map((i) => (
                  <SelectItem key={i.id} value={i.id}>
                    {i.nombre} ({i.codigo})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="destructive"
              disabled={!cursoId}
              onClick={() => void handleEliminarCurso()}
            >
              Eliminar Curso
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Nivel</Label>
            <Select value={nivel} onValueChange={(v) => setNivel(v as Nivel)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {api.NIVELES.map((n) => (
                  <SelectItem key={n} value={n}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="shadow-pop">
            Crear curso
          </Button>
        </form>

        <form
          className="card-pop space-y-4 p-6"
          onSubmit={async (e) => {
            e.preventDefault();
            if (await crearLeccion({ curso_id: cursoId, orden, titulo, xp_recompensa: xp })) {
              setTitulo("");
              setOrden(orden + 1);
            }
          }}
        >
          <h2 className="text-xl">Nueva lección</h2>

          <div className="space-y-2">
            <Label>Curso</Label>
            <Select
              value={cursoId}
              onValueChange={(v) => {
                setCursoId(v);
                setOrden(api.leccionesDeCurso(db, v).length + 1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Elegí un curso" />
              </SelectTrigger>
              <SelectContent>
                {db.cursos.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {api.idiomaDeCurso(db, c.id)?.nombre} — {c.nivel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="titulo">Título</Label>
            <Input id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="orden">Orden</Label>
              <Input
                id="orden"
                type="number"
                min={1}
                value={orden}
                onChange={(e) => setOrden(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="xp">XP recompensa (5-50)</Label>
              <Input
                id="xp"
                type="number"
                min={5}
                max={50}
                value={xp}
                onChange={(e) => setXp(Number(e.target.value))}
              />
            </div>
          </div>

          <Button type="submit" className="shadow-pop">
            Crear lección
          </Button>

          <div className="pt-2">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Lecciones del curso (GET /cursos/{"{"}id{"}"}/lecciones)
            </p>
            <ol className="mt-2 space-y-1 text-sm">
              {lecciones.map((l) => (
                <li key={l.id} className="flex justify-between gap-2">
                  <span className="min-w-0">
                    {l.orden}. {l.titulo} <span className="text-muted-foreground">(+{l.xp_recompensa} XP)</span>
                  </span>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => void handleEliminarLeccion(l.id)}
                  >
                    Eliminar Lección
                  </Button>
                </li>
              ))}
              {lecciones.length === 0 ? (
                <li className="text-muted-foreground">Sin lecciones.</li>
              ) : null}
            </ol>
          </div>
        </form>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AgregarPreguntas lecciones={lecciones} />
        <AgregarVocabulario idiomas={db.idiomas} />
      </div>
    </div>
  );
}
