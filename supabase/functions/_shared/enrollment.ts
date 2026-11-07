// Flujo de inscripción de un alumno, con las dependencias inyectadas para poder
// probarlo sin red (scripts/test-enrollment.ts). La Edge Function enroll-student
// conecta estas dependencias con Supabase.
import {
  codigosIguales,
  correoDeNie,
  validarInscripcion,
} from "./enrollmentRules.ts";

export interface CodigoGrupo {
  code: string;
  expires_at: string;
  active: boolean;
}

export interface EnrollDeps {
  ahora(): Date;
  obtenerCodigo(grupo: string): Promise<CodigoGrupo | null>;
  gruposAbiertos(ahoraIso: string): Promise<string[]>;
  existeAlumno(nie: string): Promise<boolean>;
  /** Intentos fallidos desde `desdeIso`; con `nie` solo los de ese NIE. */
  fallosDesde(desdeIso: string, nie?: string): Promise<number>;
  registrarIntento(nie: string | null, ok: boolean): Promise<void>;
  crearUsuarioAuth(correo: string, password: string): Promise<{ id: string } | { error: "existe" | "falla" }>;
  insertarAlumno(fila: {
    nie: string; name: string; group_code: string;
    active: boolean; enrollment_status: string; enrolled_at: string;
  }): Promise<string | null>; // mensaje de error, o null si salió bien
  borrarUsuarioAuth(id: string): Promise<void>;
}

export interface Respuesta {
  status: number;
  body: Record<string, unknown>;
}

export const VENTANA_MS = 15 * 60 * 1000;
export const MAX_FALLOS_POR_NIE = 5;
export const MAX_FALLOS_GLOBALES = 80;

const MENSAJE_CODIGO = "Código de inscripción inválido o vencido. Pídele uno nuevo a tu docente.";
const MENSAJE_LIMITE = "Demasiados intentos. Espera 15 minutos e inténtalo de nuevo.";

export async function gruposConInscripcionAbierta(deps: EnrollDeps): Promise<Respuesta> {
  return { status: 200, body: { groups: await deps.gruposAbiertos(deps.ahora().toISOString()) } };
}

export async function inscribir(deps: EnrollDeps, crudo: unknown): Promise<Respuesta> {
  const datos = validarInscripcion(crudo);
  if (!datos.ok) return { status: 400, body: { error: datos.error } };
  const { nie, nombre, grupo, password, codigo } = datos.valor;

  const ahora = deps.ahora();
  const desde = new Date(ahora.getTime() - VENTANA_MS).toISOString();
  if (
    (await deps.fallosDesde(desde, nie)) >= MAX_FALLOS_POR_NIE ||
    (await deps.fallosDesde(desde)) >= MAX_FALLOS_GLOBALES
  ) {
    return { status: 429, body: { error: MENSAJE_LIMITE } };
  }

  // Mismo mensaje si el grupo no existe, el código está desactivado, vencido o es incorrecto:
  // no se revela cuál de las condiciones falló.
  const guardado = await deps.obtenerCodigo(grupo);
  const vigente = guardado && guardado.active && new Date(guardado.expires_at).getTime() > ahora.getTime();
  if (!guardado || !vigente || !codigosIguales(guardado.code, codigo)) {
    await deps.registrarIntento(nie, false);
    return { status: 403, body: { error: MENSAJE_CODIGO } };
  }

  if (await deps.existeAlumno(nie)) {
    await deps.registrarIntento(nie, false);
    return {
      status: 409,
      body: { error: "Este NIE ya está inscrito. Si olvidaste tu contraseña, pídele a tu docente que la restablezca." }
    };
  }

  const usuario = await deps.crearUsuarioAuth(correoDeNie(nie), password);
  if ("error" in usuario) {
    await deps.registrarIntento(nie, false);
    return usuario.error === "existe"
      ? { status: 409, body: { error: "No se pudo inscribir este NIE. Habla con tu docente." } }
      : { status: 502, body: { error: "No se pudo crear la cuenta. Inténtalo de nuevo en unos minutos." } };
  }

  const fallo = await deps.insertarAlumno({
    nie,
    name: nombre,
    group_code: grupo,
    active: false,
    enrollment_status: "pending",
    enrolled_at: ahora.toISOString()
  });
  if (fallo) {
    // Sin esto quedaría una cuenta de acceso sin alumno, y el NIE quedaría bloqueado.
    await deps.borrarUsuarioAuth(usuario.id);
    return { status: 500, body: { error: "No se pudo completar la inscripción. Inténtalo de nuevo." } };
  }

  await deps.registrarIntento(nie, true);
  return { status: 200, body: { ok: true, status: "pending" } };
}
