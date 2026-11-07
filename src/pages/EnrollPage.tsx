import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, ClipboardSignature, Loader2 } from 'lucide-react';
import { gruposAbiertos, inscribirse } from '../services/enrollmentService';

const campo =
  'w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#F57C00] focus:border-transparent outline-none transition-all';

/**
 * Inscripción de alumnos: NIE, nombre, grupo, contraseña propia y el código
 * que el docente da en clase. La cuenta queda pendiente hasta que el docente
 * la apruebe en Gestión de usuarios.
 */
export const EnrollPage: React.FC = () => {
  const [grupos, setGrupos] = useState<string[] | null>(null);
  const [errorGrupos, setErrorGrupos] = useState('');
  const [form, setForm] = useState({ nie: '', nombre: '', grupo: '', password: '', repetir: '', codigo: '' });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [listo, setListo] = useState(false);

  useEffect(() => {
    gruposAbiertos()
      .then(lista => {
        setGrupos(lista);
        if (lista.length === 1) setForm(f => ({ ...f, grupo: lista[0] }));
      })
      .catch(e => { setErrorGrupos(e.message); setGrupos([]); });
  }, []);

  const cambiar = (clave: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [clave]: e.target.value }));

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!/^\d{4,12}$/.test(form.nie.trim())) return setError('El NIE debe tener solo números (entre 4 y 12).');
    if (form.password.length < 8) return setError('La contraseña debe tener al menos 8 caracteres.');
    if (form.password !== form.repetir) return setError('Las contraseñas no coinciden.');

    setEnviando(true);
    try {
      await inscribirse({
        nie: form.nie.trim(),
        nombre: form.nombre,
        grupo: form.grupo,
        password: form.password,
        codigo: form.codigo
      });
      setListo(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setEnviando(false);
    }
  };

  const cabecera = (
    <div className="bg-[#F57C00] p-8 text-white text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
        <ClipboardSignature size={32} />
      </div>
      <h1 className="text-2xl font-bold">Inscripción</h1>
      <p className="opacity-90">Inglés Técnico — Desarrollo de Software</p>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden">
        {cabecera}

        {listo ? (
          <div className="p-8 text-center space-y-4" role="status">
            <CheckCircle2 size={48} className="mx-auto text-emerald-500" />
            <h2 className="text-xl font-bold text-zinc-900">Solicitud enviada</h2>
            <p className="text-sm text-zinc-600">
              Tu docente debe aprobarla antes de que puedas entrar. Cuando te avise, inicia sesión con tu
              NIE y la contraseña que acabas de elegir.
            </p>
            <Link to="/student/login" className="inline-block font-bold text-[#F57C00] hover:underline">
              Ir a iniciar sesión
            </Link>
          </div>
        ) : grupos === null ? (
          <div className="p-12 flex justify-center" role="status" aria-label="Cargando">
            <Loader2 className="animate-spin text-[#F57C00]" size={28} />
          </div>
        ) : grupos.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <p className="text-zinc-700 font-medium">Por ahora no hay inscripciones abiertas.</p>
            <p className="text-sm text-zinc-500">
              {errorGrupos || 'Pídele a tu docente que abra la inscripción de tu grupo y te dé el código.'}
            </p>
            <Link to="/student/login" className="inline-block font-bold text-[#F57C00] hover:underline">
              Volver a iniciar sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={enviar} className="p-8 space-y-5">
            {error && (
              <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="enroll-nie" className="block text-sm font-medium text-zinc-700 mb-1">NIE</label>
              <input id="enroll-nie" className={campo} required inputMode="numeric" autoComplete="username"
                spellCheck={false} placeholder="Ej: 20269123" value={form.nie} onChange={cambiar('nie')} disabled={enviando} />
            </div>

            <div>
              <label htmlFor="enroll-nombre" className="block text-sm font-medium text-zinc-700 mb-1">Nombre completo</label>
              <input id="enroll-nombre" className={campo} required autoComplete="name"
                placeholder="Nombres y apellidos" value={form.nombre} onChange={cambiar('nombre')} disabled={enviando} />
            </div>

            <div>
              <label htmlFor="enroll-grupo" className="block text-sm font-medium text-zinc-700 mb-1">Grupo</label>
              <select id="enroll-grupo" className={campo} required value={form.grupo}
                onChange={cambiar('grupo')} disabled={enviando}>
                <option value="">Selecciona tu grupo</option>
                {grupos.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="enroll-codigo" className="block text-sm font-medium text-zinc-700 mb-1">Código de inscripción</label>
              <input id="enroll-codigo" className={`${campo} font-mono uppercase tracking-widest`} required
                autoComplete="off" spellCheck={false} placeholder="XXXX-XXXX" value={form.codigo}
                onChange={cambiar('codigo')} disabled={enviando} />
              <p className="text-xs text-zinc-500 mt-1">Te lo da tu docente en clase.</p>
            </div>

            <div>
              <label htmlFor="enroll-password" className="block text-sm font-medium text-zinc-700 mb-1">Contraseña</label>
              <input id="enroll-password" type="password" className={campo} required minLength={8}
                autoComplete="new-password" value={form.password} onChange={cambiar('password')} disabled={enviando} />
              <p className="text-xs text-zinc-500 mt-1">Mínimo 8 caracteres. No uses tu NIE.</p>
            </div>

            <div>
              <label htmlFor="enroll-repetir" className="block text-sm font-medium text-zinc-700 mb-1">Repite la contraseña</label>
              <input id="enroll-repetir" type="password" className={campo} required minLength={8}
                autoComplete="new-password" value={form.repetir} onChange={cambiar('repetir')} disabled={enviando} />
            </div>

            <button type="submit" disabled={enviando}
              className="w-full bg-[#F57C00] hover:bg-[#E65100] text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {enviando ? (<><Loader2 className="animate-spin" size={20} />Enviando...</>) : 'Enviar inscripción'}
            </button>

            <p className="text-center text-sm text-zinc-500">
              ¿Ya tienes cuenta? <Link to="/student/login" className="font-bold text-[#F57C00] hover:underline">Inicia sesión</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};
