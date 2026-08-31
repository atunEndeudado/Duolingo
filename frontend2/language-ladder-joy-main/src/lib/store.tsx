import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

import * as api from "./api";
import { dbInicial, type DB } from "./mock-db";
import type { Nivel, Usuario } from "./types";

interface AppContextValue {
  db: DB;
  usuario: Usuario | null;
  registrar: (body: { email: string; nombre: string }) => boolean;
  inscribirse: (curso_id: string) => void;
  crearCurso: (body: { idioma_id: string; nivel: Nivel }) => boolean;
  crearLeccion: (body: {
    curso_id: string;
    orden: number;
    titulo: string;
    xp_recompensa: number;
  }) => boolean;
  completarLeccion: (leccion_id: string, puntaje: number) => void;
  activarPremium: (plan: string) => void;
  cancelarPremium: () => void;
  enviarSolicitud: (amigo_id: string) => void;
  responderSolicitud: (solicitud_id: string, acepta: boolean) => void;
  cancelarSolicitud: (solicitud_id: string) => void;
  eliminarAmigo: (amigo_id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB>(dbInicial);

  const usuario = useMemo(
    () => db.usuarios.find((u) => u.id === db.usuario_actual) ?? null,
    [db.usuarios, db.usuario_actual],
  );

  const registrar = useCallback((body: { email: string; nombre: string }) => {
    let creado = false;
    setDb((prev) => {
      const res = api.crearUsuario(prev, body);
      if (!res.ok) {
        toast.error(res.error);
        return prev;
      }
      creado = true;
      toast.success(`¡Bienvenido/a, ${res.data.usuario.nombre}! (201 Created)`);
      return res.data.db;
    });
    return creado;
  }, []);

  const inscribirse = useCallback(
    (curso_id: string) => {
      if (!usuario) return;
      setDb((prev) => {
        const res = api.inscribirse(prev, usuario.id, curso_id);
        if (!res.ok) {
          toast.error(res.error);
          return prev;
        }
        toast.success("Inscripción confirmada");
        return res.data.db;
      });
    },
    [usuario],
  );

  const crearCurso = useCallback((body: { idioma_id: string; nivel: Nivel }) => {
    let hecho = false;
    setDb((prev) => {
      const res = api.crearCurso(prev, body);
      if (!res.ok) {
        toast.error(res.error);
        return prev;
      }
      hecho = true;
      toast.success("Curso creado");
      return res.data.db;
    });
    return hecho;
  }, []);

  const crearLeccion = useCallback(
    (body: { curso_id: string; orden: number; titulo: string; xp_recompensa: number }) => {
      let hecho = false;
      setDb((prev) => {
        const res = api.crearLeccion(prev, body);
        if (!res.ok) {
          toast.error(res.error);
          return prev;
        }
        hecho = true;
        toast.success("Lección creada");
        return res.data.db;
      });
      return hecho;
    },
    [],
  );

  const completarLeccion = useCallback(
    (leccion_id: string, puntaje: number) => {
      if (!usuario) return;
      setDb((prev) => {
        const res = api.completarLeccion(prev, usuario.id, leccion_id, puntaje);
        if (!res.ok) {
          toast.error(res.error);
          return prev;
        }
        const { completada, xp_ganado, insignias_nuevas } = res.data;
        if (completada) {
          toast.success(
            xp_ganado > 0 ? `¡Lección completada! +${xp_ganado} XP` : "¡Lección completada de nuevo!",
          );
        } else {
          toast.error(`Puntaje ${puntaje}: necesitás 60 para aprobar. Podés reintentar.`);
        }
        for (const i of insignias_nuevas) {
          toast.success(`${i.icono} Insignia desbloqueada: ${i.nombre}`);
        }
        return res.data.db;
      });
    },
    [usuario],
  );

  const activarPremium = useCallback(
    (plan: string) => {
      if (!usuario) return;
      setDb((prev) => {
        const res = api.activarPremium(prev, usuario.id);
        if (!res.ok) {
          toast.error(res.error);
          return prev;
        }
        toast.success(`Pago aprobado · plan ${plan}. ¡Preguntas Premium desbloqueadas!`);
        return res.data.db;
      });
    },
    [usuario],
  );

  const cancelarPremium = useCallback(() => {
    if (!usuario) return;
    setDb((prev) => api.cancelarPremium(prev, usuario.id));
    toast.info("Suscripción cancelada");
  }, [usuario]);

  const enviarSolicitud = useCallback(
    (amigo_id: string) => {
      if (!usuario) return;
      setDb((prev) => {
        const res = api.enviarSolicitud(prev, usuario.id, amigo_id);
        if (!res.ok) {
          toast.error(res.error);
          return prev;
        }
        toast.success("Solicitud enviada. Queda pendiente hasta que la acepte.");
        return res.data.db;
      });
    },
    [usuario],
  );

  const responderSolicitud = useCallback((solicitud_id: string, acepta: boolean) => {
    setDb((prev) => {
      const res = api.responderSolicitud(prev, solicitud_id, acepta);
      if (!res.ok) {
        toast.error(res.error);
        return prev;
      }
      toast.success(acepta ? "¡Ahora son amigos!" : "Solicitud rechazada");
      return res.data.db;
    });
  }, []);

  const cancelarSolicitud = useCallback((solicitud_id: string) => {
    setDb((prev) => api.cancelarSolicitud(prev, solicitud_id));
    toast.info("Solicitud cancelada");
  }, []);

  const eliminarAmigo = useCallback(
    (amigo_id: string) => {
      if (!usuario) return;
      setDb((prev) => api.eliminarAmigo(prev, usuario.id, amigo_id));
    },
    [usuario],
  );

  const value: AppContextValue = {
    db,
    usuario,
    registrar,
    inscribirse,
    crearCurso,
    crearLeccion,
    completarLeccion,
    activarPremium,
    cancelarPremium,
    enviarSolicitud,
    responderSolicitud,
    cancelarSolicitud,
    eliminarAmigo,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp debe usarse dentro de <AppProvider>");
  return ctx;
}
