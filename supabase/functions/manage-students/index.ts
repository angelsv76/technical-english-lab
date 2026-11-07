// Edge Function SOLO DOCENTE: operaciones de gestión de usuarios que exigen la
// service key (el navegador no puede hacerlas): códigos de inscripción,
// restablecer contraseña, borrar alumno e importar alumnos en lote.
// Aprobar, rechazar, activar y editar nombre/grupo los hace el docente con su
// propia sesión (políticas RLS "docente actualiza students").
//
// Desplegar:  npx supabase functions deploy manage-students
import { authenticatedTeacher } from "../_shared/teacherAuth.ts";
import {
  correoDeNie,
  generarClave,
  generarCodigo,
  validarDiasVigencia,
  validarFilasImportacion,
  validarGrupo,
} from "../_shared/enrollmentRules.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { ...CORS, "Content-Type": "application/json" }
});
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  const teacher = await authenticatedTeacher(req);
  if (!teacher) return json({ error: "Solo el docente puede hacer esto." }, 401);
  const { service } = teacher;

  try {
    const texto = await req.text();
    if (texto.length > 60000) return json({ error: "solicitud demasiado larga" }, 413);
    const cuerpo = JSON.parse(texto);

    // Busca la cuenta de acceso de un alumno por correo (paginado; el curso es pequeño).
    async function buscarUsuarioAuth(correo: string) {
      for (let pagina = 1; pagina <= 10; pagina++) {
        const { data, error } = await service.auth.admin.listUsers({ page: pagina, perPage: 1000 });
        if (error) throw error;
        const hallado = data.users.find((u) => u.email?.toLowerCase() === correo.toLowerCase());
        if (hallado) return hallado;
        if (data.users.length < 1000) return null;
      }
      return null;
    }

    switch (cuerpo.action) {
      case "list_codes": {
        const { data, error } = await service.from("enrollment_codes")
          .select("group_code, code, expires_at, active").order("group_code");
        if (error) return json({ error: error.message }, 500);
        return json({ codes: data });
      }

      case "create_code": {
        const grupo = validarGrupo(cuerpo.group);
        if (!grupo.ok) return json({ error: grupo.error }, 400);
        const dias = validarDiasVigencia(cuerpo.days);
        const codigo = generarCodigo();
        const vence = new Date(Date.now() + dias * 86_400_000).toISOString();
        const { error } = await service.from("enrollment_codes").upsert(
          { group_code: grupo.valor, code: codigo, expires_at: vence, active: true, created_at: new Date().toISOString() },
          { onConflict: "group_code" }
        );
        if (error) return json({ error: error.message }, 500);
        return json({ group_code: grupo.valor, code: codigo, expires_at: vence, active: true });
      }

      case "disable_code": {
        const grupo = validarGrupo(cuerpo.group);
        if (!grupo.ok) return json({ error: grupo.error }, 400);
        const { error } = await service.from("enrollment_codes")
          .update({ active: false }).eq("group_code", grupo.valor);
        if (error) return json({ error: error.message }, 500);
        return json({ ok: true });
      }

      case "reset_password": {
        if (!UUID.test(cuerpo.studentId ?? "")) return json({ error: "Alumno no válido." }, 400);
        const { data: alumno } = await service.from("students")
          .select("nie").eq("id", cuerpo.studentId).maybeSingle();
        if (!alumno) return json({ error: "Alumno no encontrado." }, 404);

        const password = generarClave();
        const correo = correoDeNie(alumno.nie);
        const usuario = await buscarUsuarioAuth(correo);
        const { error } = usuario
          ? await service.auth.admin.updateUserById(usuario.id, { password, email_confirm: true })
          : await service.auth.admin.createUser({ email: correo, password, email_confirm: true });
        if (error) return json({ error: error.message }, 500);
        return json({ password, created: !usuario });
      }

      case "delete_student": {
        if (!UUID.test(cuerpo.studentId ?? "")) return json({ error: "Alumno no válido." }, 400);
        const { data: alumno } = await service.from("students")
          .select("nie").eq("id", cuerpo.studentId).maybeSingle();
        if (!alumno) return json({ error: "Alumno no encontrado." }, 404);

        // Primero la fila: si tiene notas o historial la base lo impide y no se pierde nada.
        const { error: errorFila } = await service.from("students").delete().eq("id", cuerpo.studentId);
        if (errorFila) {
          return json({
            error: "Este alumno tiene progreso registrado y no se puede borrar. Desactívalo en lugar de borrarlo."
          }, 409);
        }
        const usuario = await buscarUsuarioAuth(correoDeNie(alumno.nie));
        if (usuario) await service.auth.admin.deleteUser(usuario.id);
        return json({ ok: true });
      }

      case "import_students": {
        const filas = validarFilasImportacion(cuerpo.rows);
        if (!filas.ok) return json({ error: filas.error }, 400);

        const resultados: Array<Record<string, unknown>> = [];
        for (const fila of filas.valor) {
          const base = { nie: fila.nie, nombre: fila.nombre, grupo: fila.grupo };
          const { data: existente } = await service.from("students")
            .select("id").eq("nie", fila.nie).maybeSingle();
          if (existente) { resultados.push({ ...base, estado: "omitido", detalle: "Ya existe" }); continue; }

          const password = generarClave();
          const { data, error } = await service.auth.admin.createUser({
            email: correoDeNie(fila.nie), password, email_confirm: true
          });
          if (error || !data.user) {
            const yaHay = /already|registered|exists/i.test(error?.message ?? "");
            resultados.push({ ...base, estado: yaHay ? "omitido" : "error", detalle: yaHay ? "Ya tiene cuenta de acceso" : "No se pudo crear la cuenta" });
            continue;
          }
          const { error: errorFila } = await service.from("students").insert({
            nie: fila.nie, name: fila.nombre, group_code: fila.grupo,
            active: true, enrollment_status: "approved", enrolled_at: new Date().toISOString()
          });
          if (errorFila) {
            await service.auth.admin.deleteUser(data.user.id);
            resultados.push({ ...base, estado: "error", detalle: "No se pudo guardar el alumno" });
            continue;
          }
          resultados.push({ ...base, estado: "creado", password });
        }
        return json({ results: resultados });
      }

      default:
        return json({ error: "Acción desconocida." }, 400);
    }
  } catch (error) {
    console.error("manage-students:", error);
    return json({ error: "No se pudo completar la operación." }, 500);
  }
});
