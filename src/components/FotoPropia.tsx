import React, { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { StudentAvatar } from './StudentAvatar';

interface Props {
  nombre: string;
  photoUrl?: string | null;
  /** Foto ya subida que espera la aprobación del docente. */
  enRevision?: boolean;
}

/** Avatar con botón para proponer una foto. El docente la aprueba antes de que se vea. */
export const FotoPropia: React.FC<Props> = ({ nombre, photoUrl, enRevision = false }) => {
  const entrada = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [revision, setRevision] = useState(enRevision);
  const [mensaje, setMensaje] = useState('');

  const elegir = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    e.target.value = '';
    if (!archivo) return;
    if (!/^image\/(png|jpe?g|webp)$/.test(archivo.type)) { setMensaje('Usa una imagen PNG, JPG o WebP.'); return; }
    if (archivo.size > 3 * 1024 * 1024) { setMensaje('La imagen no debe superar 3 MB.'); return; }
    setSubiendo(true); setMensaje('');
    try {
      const sesion = (await supabase.auth.getSession()).data.session;
      const r = await fetch('/api/foto-propuesta', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${sesion?.access_token ?? ''}`, 'Content-Type': archivo.type },
        body: archivo
      });
      const cuerpo = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(cuerpo.error ?? 'No se pudo enviar la foto.');
      setRevision(true);
      setMensaje('Foto enviada. Tu docente debe aprobarla.');
    } catch (err) {
      setMensaje((err as Error).message);
    } finally { setSubiendo(false); }
  };

  return (
    <div className="relative flex-shrink-0">
      <div className="w-10 h-10 rounded-xl overflow-hidden">
        <StudentAvatar name={nombre} photoUrl={photoUrl} size={40} className="w-full h-full object-cover" />
      </div>
      <button type="button" onClick={() => entrada.current?.click()} disabled={subiendo}
        aria-label={revision ? 'Cambiar la foto (la anterior espera aprobación)' : 'Subir mi foto'}
        title={revision ? 'Foto en revisión' : 'Subir mi foto'}
        className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white shadow ${revision ? 'bg-amber-500' : 'bg-orange-600'}`}>
        {subiendo ? <Loader2 size={11} className="animate-spin" /> : <Camera size={11} />}
      </button>
      <input ref={entrada} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={elegir} />
      {mensaje && <p role="status" className="absolute right-0 top-12 z-20 w-56 text-xs bg-white border border-zinc-200 rounded-lg p-2 shadow text-zinc-700">{mensaje}</p>}
    </div>
  );
};
