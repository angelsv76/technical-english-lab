import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle, Check, Copy, Download, KeyRound, Loader2, RefreshCw, Trash2, Upload, UserCheck, UserX
} from 'lucide-react';
import { supabase, MODO_LOCAL } from '../lib/supabase';
import { gestionar } from '../services/enrollmentService';

interface Alumno {
  id: string;
  nie: string;
  name: string;
  group_code: string;
  active: boolean;
  enrollment_status: 'pending' | 'approved' | 'rejected';
  enrolled_at: string | null;
  last_login: string | null;
  photo_pending?: string | null;
}

interface CodigoGrupo {
  group_code: string;
  code: string;
  expires_at: string;
  active: boolean;
}

interface ResultadoImportacion {
  nie: string; nombre: string; grupo: string;
  estado: 'creado' | 'omitido' | 'error'; detalle?: string; password?: string;
}

type Estado = 'pendiente' | 'activo' | 'desactivado' | 'rechazado';

const estadoDe = (a: Alumno): Estado =>
  a.enrollment_status === 'pending' ? 'pendiente'
    : a.enrollment_status === 'rejected' ? 'rechazado'
      : a.active ? 'activo' : 'desactivado';

const COLOR_ESTADO: Record<Estado, string> = {
  pendiente: 'bg-amber-50 text-amber-700 border-amber-200',
  activo: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  desactivado: 'bg-zinc-100 text-zinc-500 border-zinc-200',
  rechazado: 'bg-red-50 text-red-700 border-red-200'
};

const fechaCorta = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('es-SV', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const descargarCsv = (nombre: string, filas: string[][]) => {
  const csv = filas.map(f => f.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  enlace.click();
  URL.revokeObjectURL(url);
};

/** CSV nie,nombre,grupo (con o sin encabezado) -> filas. */
const leerCsv = (texto: string) =>
  texto.replace(/^﻿/, '').split(/\r?\n/).map(l => l.trim()).filter(Boolean)
    .filter((l, i) => !(i === 0 && /^nie\b/i.test(l)))
    .map(l => {
      const [nie, nombre, grupo] = l.split(/[,;]/).map(s => s.trim().replace(/^"|"$/g, ''));
      return { nie, nombre, grupo };
    });

/** Muestra la foto pendiente: necesita la sesión del docente, así que se baja con fetch. */
const FotoPendiente: React.FC<{ id: string; nombre: string }> = ({ id, nombre }) => {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let vivo = true;
    let objeto = '';
    (async () => {
      const sesion = (await supabase.auth.getSession()).data.session;
      const r = await fetch(`/api/fotos-pendientes/${id}`, { headers: { Authorization: `Bearer ${sesion?.access_token ?? ''}` } });
      if (!r.ok || !vivo) return;
      objeto = URL.createObjectURL(await r.blob());
      setUrl(objeto);
    })().catch(() => { /* sin vista previa: el docente aún puede decidir */ });
    return () => { vivo = false; if (objeto) URL.revokeObjectURL(objeto); };
  }, [id]);
  return url
    ? <img src={url} alt={`Foto propuesta por ${nombre}`} className="w-20 h-20 rounded-xl object-cover border border-zinc-200" />
    : <div className="w-20 h-20 rounded-xl bg-zinc-100 flex items-center justify-center"><Loader2 size={18} className="animate-spin text-zinc-400" /></div>;
};

const boton = 'px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

export const UserManagement: React.FC = () => {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [codigos, setCodigos] = useState<CodigoGrupo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [ocupado, setOcupado] = useState<string | null>(null);

  const [filtroGrupo, setFiltroGrupo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [busqueda, setBusqueda] = useState('');

  const [nuevoGrupo, setNuevoGrupo] = useState('');
  const [dias, setDias] = useState(14);
  const [copiado, setCopiado] = useState<string | null>(null);

  const [credencial, setCredencial] = useState<{ nombre: string; nie: string; password: string } | null>(null);
  const [filasCsv, setFilasCsv] = useState<{ nie: string; nombre: string; grupo: string }[]>([]);
  const [resultados, setResultados] = useState<ResultadoImportacion[] | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const { data, error: e } = await supabase.from('students')
        .select((MODO_LOCAL
          ? 'id, nie, name, group_code, active, enrollment_status, enrolled_at, last_login, photo_pending'
          : 'id, nie, name, group_code, active, enrollment_status, enrolled_at, last_login') as '*')
        .order('name').range(0, 999);
      if (e) {
        throw new Error(e.code === '42703'
          ? 'Falta ejecutar supabase-inscripcion.sql en Supabase.'
          : 'No se pudo cargar la lista de alumnos.');
      }
      setAlumnos((data ?? []) as Alumno[]);
      try {
        const r = await gestionar<{ codes: CodigoGrupo[] }>('list_codes');
        setCodigos(r.codes ?? []);
      } catch (ec) {
        setError((ec as Error).message + ' (códigos de inscripción)');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const grupos = useMemo(
    () => [...new Set([...alumnos.map(a => a.group_code), ...codigos.map(c => c.group_code)])].sort(),
    [alumnos, codigos]
  );
  const pendientes = alumnos.filter(a => estadoDe(a) === 'pendiente');
  const fotosPendientes = alumnos.filter(a => !!a.photo_pending);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return alumnos.filter(a =>
      (!filtroGrupo || a.group_code === filtroGrupo) &&
      (!filtroEstado || estadoDe(a) === filtroEstado) &&
      (!q || a.name.toLowerCase().includes(q) || a.nie.includes(q)));
  }, [alumnos, filtroGrupo, filtroEstado, busqueda]);

  /** Ejecuta una acción mostrando el estado de ocupado y cualquier error. */
  const ejecutar = async (clave: string, accion: () => Promise<void>) => {
    setOcupado(clave);
    setError('');
    try { await accion(); } catch (err) { setError((err as Error).message); } finally { setOcupado(null); }
  };

  const cambiarEstado = (a: Alumno, cambios: Partial<Alumno>, confirmacion?: string) => {
    if (confirmacion && !window.confirm(confirmacion)) return;
    return ejecutar(a.id, async () => {
      const { data, error: e } = await supabase.from('students')
        .update(cambios).eq('id', a.id).select('id, active, enrollment_status').single();
      if (e || !data) throw new Error('No se pudo guardar el cambio. Comprueba tu sesión de docente.');
      setAlumnos(prev => prev.map(x => x.id === a.id ? { ...x, ...data } : x));
    });
  };

  const resolverFoto = (a: Alumno, aprobarla: boolean) => ejecutar(`foto-${a.id}`, async () => {
    await gestionar(aprobarla ? 'approve_photo' : 'reject_photo', { studentId: a.id });
    setAlumnos(prev => prev.map(x => x.id === a.id ? { ...x, photo_pending: null } : x));
  });

  const aprobar = (a: Alumno) => cambiarEstado(a, { active: true, enrollment_status: 'approved' });
  const rechazar = (a: Alumno) =>
    cambiarEstado(a, { active: false, enrollment_status: 'rejected' }, `¿Rechazar la inscripción de ${a.name}?`);
  const alternarActivo = (a: Alumno) =>
    cambiarEstado(a, { active: !a.active },
      a.active ? `¿Desactivar a ${a.name}? No podrá iniciar sesión ni guardar evaluaciones.` : undefined);

  const restablecer = (a: Alumno) => {
    if (!window.confirm(`¿Generar una contraseña nueva para ${a.name}? La anterior dejará de funcionar.`)) return;
    return ejecutar(a.id, async () => {
      const r = await gestionar<{ password: string }>('reset_password', { studentId: a.id });
      setCredencial({ nombre: a.name, nie: a.nie, password: r.password });
    });
  };

  const eliminar = (a: Alumno) => {
    if (!window.confirm(`¿Borrar a ${a.name} (NIE ${a.nie})? Esta acción no se puede deshacer.`)) return;
    return ejecutar(a.id, async () => {
      await gestionar('delete_student', { studentId: a.id });
      setAlumnos(prev => prev.filter(x => x.id !== a.id));
    });
  };

  const generarCodigo = (grupo: string) => {
    if (!grupo.trim()) { setError('Escribe el grupo para el que quieres abrir la inscripción.'); return; }
    return ejecutar(`codigo-${grupo}`, async () => {
      const nuevo = await gestionar<CodigoGrupo>('create_code', { group: grupo.trim(), days: dias });
      setCodigos(prev => [...prev.filter(c => c.group_code !== nuevo.group_code), nuevo]
        .sort((x, y) => x.group_code.localeCompare(y.group_code)));
      setNuevoGrupo('');
    });
  };

  const desactivarCodigo = (grupo: string) =>
    ejecutar(`codigo-${grupo}`, async () => {
      await gestionar('disable_code', { group: grupo });
      setCodigos(prev => prev.map(c => c.group_code === grupo ? { ...c, active: false } : c));
    });

  const copiar = async (texto: string, clave: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(clave);
      setTimeout(() => setCopiado(null), 1500);
    } catch { setError('No se pudo copiar. Selecciona el texto y cópialo a mano.'); }
  };

  const elegirArchivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    setResultados(null);
    setFilasCsv(archivo ? leerCsv(await archivo.text()) : []);
  };

  const importar = () => ejecutar('importar', async () => {
    const r = await gestionar<{ results: ResultadoImportacion[] }>('import_students', { rows: filasCsv });
    setResultados(r.results);
    setFilasCsv([]);
    await cargar();
  });

  const vigente = (c: CodigoGrupo) => c.active && new Date(c.expires_at) > new Date();

  return (
    <div className="space-y-8">
      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" /><span>{error}</span>
        </div>
      )}

      {credencial && (
        <div role="status" className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[16rem]">
            <p className="text-sm font-bold text-emerald-900">Contraseña nueva de {credencial.nombre}</p>
            <p className="text-xs text-emerald-800 mb-2">NIE {credencial.nie}. Entrégasela ahora: no se vuelve a mostrar.</p>
            <code className="text-xl font-mono font-bold tracking-wider text-emerald-900">{credencial.password}</code>
          </div>
          <button className={`${boton} bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1`}
            onClick={() => copiar(credencial.password, 'cred')}>
            {copiado === 'cred' ? <Check size={14} /> : <Copy size={14} />} Copiar
          </button>
          <button className={`${boton} bg-white border border-emerald-300 text-emerald-800`} onClick={() => setCredencial(null)}>
            Ya la anoté
          </button>
        </div>
      )}

      {/* Códigos de inscripción */}
      <section className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6" aria-labelledby="t-codigos">
        <h3 id="t-codigos" className="text-lg font-bold text-zinc-900">Códigos de inscripción</h3>
        <p className="text-sm text-zinc-500 mb-4">
          Un código por grupo. Díselo a tus alumnos en clase: sin él no pueden inscribirse. Genera uno nuevo para renovarlo.
        </p>

        <div className="grid gap-3 mb-5">
          {codigos.length === 0 && !cargando && (
            <p className="text-sm text-zinc-500">Todavía no hay códigos: la inscripción está cerrada para todos los grupos.</p>
          )}
          {codigos.map(c => (
            <div key={c.group_code} className="flex flex-wrap items-center gap-4 p-4 rounded-2xl border border-zinc-100 bg-zinc-50">
              <span className="font-bold text-zinc-900 w-20">{c.group_code}</span>
              <code className={`text-xl font-mono font-bold tracking-widest ${vigente(c) ? 'text-zinc-900' : 'text-zinc-400 line-through'}`}>
                {c.code}
              </code>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${vigente(c)
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-zinc-100 text-zinc-500 border-zinc-200'}`}>
                {!c.active ? 'Desactivado' : vigente(c) ? `Vence ${fechaCorta(c.expires_at)}` : `Venció ${fechaCorta(c.expires_at)}`}
              </span>
              <div className="ml-auto flex gap-2">
                <button className={`${boton} bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100 flex items-center gap-1`}
                  onClick={() => copiar(c.code, c.group_code)}>
                  {copiado === c.group_code ? <Check size={14} /> : <Copy size={14} />} Copiar
                </button>
                <button className={`${boton} bg-zinc-900 text-white hover:bg-black`} disabled={ocupado === `codigo-${c.group_code}`}
                  onClick={() => generarCodigo(c.group_code)}>Renovar</button>
                {vigente(c) && (
                  <button className={`${boton} bg-red-50 text-red-700 hover:bg-red-100`} disabled={ocupado === `codigo-${c.group_code}`}
                    onClick={() => desactivarCodigo(c.group_code)}>Cerrar</button>
                )}
              </div>
            </div>
          ))}
        </div>

        <form className="flex flex-wrap items-end gap-3" onSubmit={e => { e.preventDefault(); generarCodigo(nuevoGrupo); }}>
          <div>
            <label htmlFor="nuevo-grupo" className="block text-xs font-bold text-zinc-500 uppercase mb-1">Grupo</label>
            <input id="nuevo-grupo" list="lista-grupos" value={nuevoGrupo} onChange={e => setNuevoGrupo(e.target.value)}
              placeholder="Ej: DS1B" className="px-3 py-2 border border-zinc-300 rounded-lg text-sm w-36 uppercase" />
            <datalist id="lista-grupos">{grupos.map(g => <option key={g} value={g} />)}</datalist>
          </div>
          <div>
            <label htmlFor="dias-codigo" className="block text-xs font-bold text-zinc-500 uppercase mb-1">Vigencia</label>
            <select id="dias-codigo" value={dias} onChange={e => setDias(Number(e.target.value))}
              className="px-3 py-2 border border-zinc-300 rounded-lg text-sm">
              <option value={7}>7 días</option><option value={14}>14 días</option><option value={30}>30 días</option>
            </select>
          </div>
          <button type="submit" className="px-4 py-2 rounded-lg bg-[#F57C00] hover:bg-[#E65100] text-white text-sm font-bold">
            Generar código
          </button>
        </form>
      </section>

      {/* Pendientes */}
      <section className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6" aria-labelledby="t-pendientes">
        <h3 id="t-pendientes" className="text-lg font-bold text-zinc-900 mb-1">
          Inscripciones pendientes {pendientes.length > 0 && (
            <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-lg align-middle">{pendientes.length}</span>
          )}
        </h3>
        {pendientes.length === 0 ? (
          <p className="text-sm text-zinc-500">No hay solicitudes por aprobar.</p>
        ) : (
          <ul className="mt-3 grid gap-3">
            {pendientes.map(a => (
              <li key={a.id} className="flex flex-wrap items-center gap-4 p-4 rounded-2xl border border-amber-200 bg-amber-50/50">
                <div className="flex-1 min-w-[14rem]">
                  <p className="font-bold text-zinc-900">{a.name}</p>
                  <p className="text-xs text-zinc-500">NIE {a.nie} · Grupo {a.group_code} · Solicitó el {fechaCorta(a.enrolled_at)}</p>
                </div>
                <button className={`${boton} bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1`}
                  disabled={ocupado === a.id} onClick={() => aprobar(a)}><UserCheck size={14} /> Aprobar</button>
                <button className={`${boton} bg-white border border-red-200 text-red-700 hover:bg-red-50 flex items-center gap-1`}
                  disabled={ocupado === a.id} onClick={() => rechazar(a)}><UserX size={14} /> Rechazar</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Fotos por aprobar (solo versión local) */}
      {MODO_LOCAL && (
        <section className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6" aria-labelledby="t-fotos">
          <h3 id="t-fotos" className="text-lg font-bold text-zinc-900 mb-1">
            Fotos por aprobar {fotosPendientes.length > 0 && (
              <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-lg align-middle">{fotosPendientes.length}</span>
            )}
          </h3>
          {fotosPendientes.length === 0 ? (
            <p className="text-sm text-zinc-500">No hay fotos por revisar.</p>
          ) : (
            <ul className="mt-3 grid gap-3">
              {fotosPendientes.map(a => (
                <li key={a.id} className="flex flex-wrap items-center gap-4 p-4 rounded-2xl border border-amber-200 bg-amber-50/50">
                  <FotoPendiente id={a.id} nombre={a.name} />
                  <div className="flex-1 min-w-[12rem]">
                    <p className="font-bold text-zinc-900">{a.name}</p>
                    <p className="text-xs text-zinc-500">NIE {a.nie} · Grupo {a.group_code}</p>
                  </div>
                  <button className={`${boton} bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1`}
                    disabled={ocupado === `foto-${a.id}`} onClick={() => resolverFoto(a, true)}><Check size={14} /> Aprobar</button>
                  <button className={`${boton} bg-white border border-red-200 text-red-700 hover:bg-red-50 flex items-center gap-1`}
                    disabled={ocupado === `foto-${a.id}`} onClick={() => resolverFoto(a, false)}><Trash2 size={14} /> Rechazar</button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Directorio */}
      <section className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6" aria-labelledby="t-alumnos">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <h3 id="t-alumnos" className="text-lg font-bold text-zinc-900 mr-auto">Alumnos ({filtrados.length})</h3>
          <input aria-label="Buscar por nombre o NIE" placeholder="Buscar nombre o NIE" value={busqueda}
            onChange={e => setBusqueda(e.target.value)} className="px-3 py-2 border border-zinc-300 rounded-lg text-sm w-48" />
          <select aria-label="Filtrar por grupo" value={filtroGrupo} onChange={e => setFiltroGrupo(e.target.value)}
            className="px-3 py-2 border border-zinc-300 rounded-lg text-sm">
            <option value="">Todos los grupos</option>{grupos.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <select aria-label="Filtrar por estado" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
            className="px-3 py-2 border border-zinc-300 rounded-lg text-sm">
            <option value="">Todos los estados</option><option value="pendiente">Pendientes</option>
            <option value="activo">Activos</option><option value="desactivado">Desactivados</option>
            <option value="rechazado">Rechazados</option>
          </select>
          <button className={`${boton} bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 flex items-center gap-1`}
            onClick={cargar} disabled={cargando}>
            <RefreshCw size={14} className={cargando ? 'animate-spin' : ''} /> Actualizar
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-xs uppercase text-zinc-500">
                <th className="p-3">Alumno</th><th className="p-3">NIE</th><th className="p-3">Grupo</th>
                <th className="p-3">Estado</th><th className="p-3">Último ingreso</th><th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(a => {
                const estado = estadoDe(a);
                return (
                  <tr key={a.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                    <td className="p-3 font-bold text-zinc-900">{a.name}</td>
                    <td className="p-3 font-mono text-zinc-600">{a.nie}</td>
                    <td className="p-3 text-zinc-600">{a.group_code}</td>
                    <td className="p-3">
                      <span className={`text-[11px] font-bold uppercase px-2 py-1 rounded-lg border ${COLOR_ESTADO[estado]}`}>{estado}</span>
                    </td>
                    <td className="p-3 text-zinc-500">{fechaCorta(a.last_login)}</td>
                    <td className="p-3">
                      <div className="flex justify-end gap-2">
                        {estado === 'pendiente' || estado === 'rechazado' ? (
                          <button className={`${boton} bg-emerald-600 text-white hover:bg-emerald-700`}
                            disabled={ocupado === a.id} onClick={() => aprobar(a)}>Aprobar</button>
                        ) : (
                          <button className={`${boton} bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100`}
                            disabled={ocupado === a.id} onClick={() => alternarActivo(a)}>
                            {a.active ? 'Desactivar' : 'Activar'}
                          </button>
                        )}
                        <button title="Restablecer contraseña" aria-label={`Restablecer contraseña de ${a.name}`}
                          className={`${boton} bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100`}
                          disabled={ocupado === a.id} onClick={() => restablecer(a)}><KeyRound size={14} /></button>
                        <button title="Borrar alumno" aria-label={`Borrar a ${a.name}`}
                          className={`${boton} bg-white border border-red-200 text-red-600 hover:bg-red-50`}
                          disabled={ocupado === a.id} onClick={() => eliminar(a)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!cargando && filtrados.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-zinc-500">No hay alumnos con esos filtros.</td></tr>
              )}
            </tbody>
          </table>
          {cargando && <div className="p-6 flex justify-center"><Loader2 className="animate-spin text-[#F57C00]" /></div>}
        </div>
      </section>

      {/* Importación */}
      <section className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6" aria-labelledby="t-importar">
        <h3 id="t-importar" className="text-lg font-bold text-zinc-900">Importar alumnos desde CSV</h3>
        <p className="text-sm text-zinc-500 mb-4">
          Archivo con las columnas <code className="bg-zinc-100 px-1 rounded">nie,nombre,grupo</code> (hasta 100 por vez).
          Quedan aprobados y se les genera una contraseña inicial que podrás descargar una sola vez.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <label className={`${boton} bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-50 cursor-pointer flex items-center gap-1`}>
            <Upload size={14} /> Elegir archivo CSV
            <input type="file" accept=".csv,text/csv" className="sr-only" onChange={elegirArchivo} />
          </label>
          {filasCsv.length > 0 && (
            <>
              <span className="text-sm text-zinc-600">{filasCsv.length} alumno(s) listos para importar</span>
              <button className="px-4 py-2 rounded-lg bg-[#F57C00] hover:bg-[#E65100] text-white text-sm font-bold disabled:opacity-50"
                disabled={ocupado === 'importar'} onClick={importar}>
                {ocupado === 'importar' ? 'Importando...' : 'Importar'}
              </button>
            </>
          )}
        </div>

        {resultados && (
          <div className="mt-5">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <p className="text-sm font-bold text-zinc-900">
                {resultados.filter(r => r.estado === 'creado').length} creados ·{' '}
                {resultados.filter(r => r.estado === 'omitido').length} omitidos ·{' '}
                {resultados.filter(r => r.estado === 'error').length} con error
              </p>
              {resultados.some(r => r.password) && (
                <button className={`${boton} bg-zinc-900 text-white hover:bg-black flex items-center gap-1`}
                  onClick={() => descargarCsv(`credenciales-${new Date().toISOString().slice(0, 10)}.csv`,
                    [['nie', 'nombre', 'grupo', 'contraseña'],
                      ...resultados.filter(r => r.password).map(r => [r.nie, r.nombre, r.grupo, r.password!])])}>
                  <Download size={14} /> Descargar contraseñas
                </button>
              )}
            </div>
            <p className="text-xs text-amber-700 mb-2">Descarga las contraseñas ahora: al salir de esta pantalla no se vuelven a mostrar.</p>
            <ul className="text-sm divide-y divide-zinc-100 border border-zinc-100 rounded-xl max-h-64 overflow-y-auto">
              {resultados.map(r => (
                <li key={r.nie} className="px-3 py-2 flex gap-3">
                  <span className="font-mono text-zinc-500 w-24">{r.nie}</span>
                  <span className="flex-1">{r.nombre}</span>
                  <span className={r.estado === 'creado' ? 'text-emerald-600' : r.estado === 'error' ? 'text-red-600' : 'text-zinc-500'}>
                    {r.estado === 'creado' ? 'Creado' : r.detalle}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
};
