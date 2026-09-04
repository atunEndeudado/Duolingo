import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import * as api from "@/lib/api";
import { useApp } from "@/lib/store";
import type { DireccionPregunta, Leccion, Pregunta } from "@/lib/types";

interface AgregarPreguntasProps {
  lecciones: Leccion[];
}

type TipoPregunta = "traducir" | "unir_palabras" | "unir_oraciones";

export function AgregarPreguntas({ lecciones }: AgregarPreguntasProps) {
  const [leccionId, setLeccionId] = useState(lecciones[0]?.id ?? "");
  const [tipo, setTipo] = useState<TipoPregunta>("traducir");
  const [direccion, setDireccion] = useState<DireccionPregunta>("nativo_a_curso");
  const [pregunta, setPregunta] = useState("");
  const [esPremium, setEsPremium] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generandoMatch, setGenerandoMatch] = useState(false);
  const [preguntasExistentes, setPreguntasExistentes] = useState<Pregunta[]>([]);
  const [cargandoPreguntas, setCargandoPreguntas] = useState(false);
  const { crearPregunta } = useApp();

  const cargarPreguntas = async (id = leccionId) => {
    if (!id) {
      setPreguntasExistentes([]);
      return;
    }

    setCargandoPreguntas(true);
    try {
      const preguntas = await api.listarPreguntasPorLeccion(id);
      setPreguntasExistentes(preguntas.filter((item) => item.id && !item.id.startsWith("-")));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudieron cargar las preguntas");
    } finally {
      setCargandoPreguntas(false);
    }
  };

  useEffect(() => {
    void cargarPreguntas();
  }, [leccionId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leccionId || (tipo !== "unir_palabras" && !pregunta.trim())) {
      toast.error("Completa todos los campos");
      return;
    }

    setLoading(true);
    try {
      const success = await crearPregunta({
        leccion_id: leccionId,
        pregunta: pregunta.trim(),
        tipo,
        direccion,
        es_premium: esPremium,
      });
      if (success) {
        setPregunta("");
        await cargarPreguntas();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al crear la pregunta");
    } finally {
      setLoading(false);
    }
  };

  const generarMatch = async () => {
    if (!leccionId) return;
    setGenerandoMatch(true);
    try {
      const match = await api.generarMatchVocabularioBackend(leccionId, esPremium);
      if (!match.pares?.length) {
        toast.error("No hay palabras en el vocabulario de este nivel");
        return;
      }
      setPreguntasExistentes((actuales) => [...actuales, match]);
      toast.success(`${match.pares.length} palabras seleccionadas para el matching`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo generar el matching");
    } finally {
      setGenerandoMatch(false);
    }
  };

  const eliminarPregunta = async (preguntaId: string) => {
    if (preguntaId.startsWith("-")) {
      setPreguntasExistentes((actuales) => actuales.filter((item) => item.id !== preguntaId));
      toast.success("Matching eliminado de la lección");
      return;
    }
    try {
      await api.eliminarPreguntaBackend(preguntaId);
      setPreguntasExistentes((actuales) => actuales.filter((item) => item.id !== preguntaId));
      toast.success("Pregunta eliminada");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo eliminar la pregunta");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card-pop space-y-4 p-6">
      <h2 className="text-xl font-bold">Agregar Preguntas</h2>

      <div className="space-y-2">
        <Label>Lección</Label>
        <Select value={leccionId} onValueChange={setLeccionId}>
          <SelectTrigger>
            <SelectValue placeholder="Elegí una lección" />
          </SelectTrigger>
          <SelectContent>
            {lecciones.map((l) => (
              <SelectItem key={l.id} value={l.id}>
                {l.titulo} (Orden {l.orden})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Tipo de Pregunta</Label>
        <Select value={tipo} onValueChange={(v) => setTipo(v as TipoPregunta)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="traducir">Traducir textualmente</SelectItem>
            <SelectItem value="unir_palabras">Unir palabras con traducciones</SelectItem>
            <SelectItem value="unir_oraciones">Unir palabras para formar oraciones</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {tipo === "unir_palabras" ? (
        <div className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
          Las palabras se seleccionan automáticamente del vocabulario del nivel de la lección.
          <Button type="button" className="mt-3 w-full" disabled={generandoMatch || !leccionId} onClick={() => void generarMatch()}>
            {generandoMatch ? "Generando..." : "Generar matching con vocabulario"}
          </Button>
        </div>
      ) : null}

      {tipo !== "unir_palabras" ? (
        <div className="space-y-2">
          <Label htmlFor="pregunta">Palabra o frase base en español</Label>
          <Textarea
            id="pregunta"
            value={pregunta}
            onChange={(e) => setPregunta(e.target.value)}
            placeholder="ej: Ambulancia"
            required
          />
        </div>
      ) : null}

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={esPremium}
          onChange={(e) => setEsPremium(e.target.checked)}
          className="size-4 rounded border border-border"
        />
        <span className="text-sm">Solo Premium</span>
      </label>

      <div className="border-t pt-4">
        <h3 className="text-sm font-bold">Preguntas de esta lección</h3>
        {cargandoPreguntas ? <p className="mt-2 text-sm text-muted-foreground">Cargando…</p> : null}
        {!cargandoPreguntas && preguntasExistentes.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Todavía no hay preguntas.</p>
        ) : null}
        <ul className="mt-2 space-y-2">
          {preguntasExistentes.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 rounded-lg bg-secondary/50 px-3 py-2 text-sm">
              <span className="min-w-0 truncate">
                {item.orden}. {item.pregunta || "Pregunta sin contenido"}
                {item.tipo === "match" && !item.pares?.length ? " (sin pares: eliminar)" : ""}
              </span>
              <Button type="button" variant="destructive" size="sm" onClick={() => void eliminarPregunta(item.id)}>
                Eliminar
              </Button>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-2">
        <Label>Dirección del ejercicio</Label>
        <Select value={direccion} onValueChange={(valor) => setDireccion(valor as DireccionPregunta)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nativo_a_curso">Nativo (Español) a Idioma del Curso</SelectItem>
            <SelectItem value="curso_a_nativo">Idioma del Curso a Nativo (Español)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={loading || tipo === "unir_palabras"} className="shadow-pop">
        {loading ? "Creando..." : "Crear Pregunta"}
      </Button>
    </form>
  );
}
