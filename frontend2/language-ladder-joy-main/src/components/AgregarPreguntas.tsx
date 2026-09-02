import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useApp } from "@/lib/store";
import type { Leccion } from "@/lib/types";

interface AgregarPreguntasProps {
  lecciones: Leccion[];
}

type TipoPregunta = "traducir" | "unir_palabras" | "unir_oraciones";

export function AgregarPreguntas({ lecciones }: AgregarPreguntasProps) {
  const [leccionId, setLeccionId] = useState(lecciones[0]?.id ?? "");
  const [orden, setOrden] = useState(1);
  const [tipo, setTipo] = useState<TipoPregunta>("traducir");
  const [pregunta, setPregunta] = useState("");
  const [respuesta, setRespuesta] = useState("");
  const [esPremium, setEsPremium] = useState(false);
  const [loading, setLoading] = useState(false);
  const { crearPregunta } = useApp();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leccionId || !pregunta.trim() || !respuesta.trim()) {
      toast.error("Completa todos los campos");
      return;
    }

    setLoading(true);
    try {
      const success = await crearPregunta({
        leccion_id: leccionId,
        orden,
        pregunta: pregunta.trim(),
        respuesta: respuesta.trim(),
        es_premium: esPremium,
      });
      if (success) {
        setPregunta("");
        setRespuesta("");
        setOrden(orden + 1);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al crear la pregunta");
    } finally {
      setLoading(false);
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

      <div className="space-y-2">
        <Label htmlFor="pregunta">Pregunta</Label>
        <Textarea
          id="pregunta"
          value={pregunta}
          onChange={(e) => setPregunta(e.target.value)}
          placeholder={
            tipo === "traducir"
              ? "ej: Traducir: Hello"
              : tipo === "unir_palabras"
                ? "ej: Unir palabra con su traducción"
                : "ej: Formar oración con: The, cat, is, black"
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="respuesta">Respuesta Correcta</Label>
        <Textarea
          id="respuesta"
          value={respuesta}
          onChange={(e) => setRespuesta(e.target.value)}
          placeholder="ej: Hola"
          required
        />
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
            required
          />
        </div>

        <div className="flex items-end">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={esPremium}
              onChange={(e) => setEsPremium(e.target.checked)}
              className="size-4 rounded border border-border"
            />
            <span className="text-sm">Solo Premium</span>
          </label>
        </div>
      </div>

      <Button type="submit" disabled={loading} className="shadow-pop">
        {loading ? "Creando..." : "Crear Pregunta"}
      </Button>
    </form>
  );
}
