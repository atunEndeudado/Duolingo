import { useEffect, useState } from "react";
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
import { toast } from "sonner";
import { useApp } from "@/lib/store";
import * as api from "@/lib/api";
import type { Nivel } from "@/lib/types";

interface AgregarVocabularioProps {}

export function AgregarVocabulario(_: AgregarVocabularioProps) {
  const [nivel, setNivel] = useState<Nivel>("A1");
  const [palabra, setPalabra] = useState("");
  const [loading, setLoading] = useState(false);
  const [palabras, setPalabras] = useState<{ id: string; palabra: string }[]>([]);
  const { crearVocabulario, eliminarVocabulario } = useApp();

  useEffect(() => {
    void api.listarVocabulario(nivel)
      .then((items) => setPalabras([...new Map(items.map((item) => [item.palabra.trim().toLowerCase(), { id: item.id, palabra: item.palabra }])).values()]))
      .catch(() => setPalabras([]));
  }, [nivel]);

  const NIVELES: Nivel[] = ["A1", "A2", "B1", "B2", "C1"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const palabraNormalizada = palabra.trim().toLocaleLowerCase();
    if (!palabraNormalizada) {
      toast.error("Completa todos los campos");
      return;
    }
    if (palabras.some((item) => item.palabra.trim().toLocaleLowerCase() === palabraNormalizada)) {
      toast.error("La palabra ya existe en ese nivel");
      return;
    }

    setLoading(true);
    try {
      const success = await crearVocabulario({
        palabra: palabra.trim(),
        nivel,
      });
      if (success) {
        setPalabra("");
        const actualizadas = await api.listarVocabulario(nivel);
        setPalabras([...new Map(actualizadas.map((item) => [item.palabra.trim().toLowerCase(), { id: item.id, palabra: item.palabra }])).values()]);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al agregar la palabra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card-pop space-y-4 p-6">
      <h2 className="text-xl font-bold">Agregar Palabras al Vocabulario</h2>

      <div className="space-y-2">
        <Label>Nivel</Label>
        <Select value={nivel} onValueChange={(v) => setNivel(v as Nivel)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {NIVELES.map((n) => (
              <SelectItem key={n} value={n}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <div className="space-y-2">
          <Label htmlFor="palabra">Palabra</Label>
          <Input
            id="palabra"
            value={palabra}
            onChange={(e) => setPalabra(e.target.value)}
            placeholder="ej: hola"
            required
          />
        </div>

      </div>

      <Button type="submit" disabled={loading} className="shadow-pop">
        {loading ? "Agregando..." : "Agregar Palabra"}
      </Button>

      <div className="border-t pt-4">
        <h3 className="text-sm font-bold">Vocabulario del nivel {nivel}</h3>
        <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-sm">
          {palabras.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-2">
              <span>{item.palabra}</span>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (window.confirm(`¿Eliminar la palabra "${item.palabra}"?`)) {
                    void eliminarVocabulario(item.id).then((eliminada) => {
                      if (eliminada) setPalabras((actuales) => actuales.filter((actual) => actual.id !== item.id));
                    });
                  }
                }}
              >
                Eliminar
              </Button>
            </li>
          ))}
          {palabras.length === 0 ? <li className="text-muted-foreground">No hay palabras cargadas.</li> : null}
        </ul>
      </div>
    </form>
  );
}
