import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, ShieldX, Loader2, Home } from 'lucide-react';
import { supabase } from '../lib/supabase';

/**
 * Verificación pública de reportes: /verificar/<código>
 * El código lo genera la base al guardar la nota. La consulta pública
 * confirma su existencia sin revelar datos del alumno ni calificaciones.
 */
export const VerifyPage: React.FC = () => {
  const { code } = useParams();
  const [state, setState] = useState<'loading' | 'valid' | 'invalid' | 'error'>('loading');

  useEffect(() => {
    const verify = async () => {
      const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!code || !uuidRe.test(code)) {
        setState('invalid');
        return;
      }

      const { data, error } = await supabase.functions.invoke('verify-report', { body: { code } });
      if (error) { setState('error'); return; }
      setState(data?.valid === true ? 'valid' : 'invalid');
    };

    verify();
  }, [code]);

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-[#F57C00] p-6 text-white text-center">
          <h1 className="text-xl font-bold">Technical English Lab — INTI</h1>
          <p className="text-xs uppercase tracking-widest opacity-80 mt-1">Verificación de reporte</p>
        </div>

        <div className="p-8">
          {state === 'loading' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 size={40} className="animate-spin text-[#F57C00]" />
              <p className="text-zinc-500 font-medium">Consultando el registro oficial...</p>
            </div>
          )}

          {state === 'invalid' && (
            <div className="text-center py-4">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldX size={44} className="text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-red-600 mb-2">CÓDIGO NO VÁLIDO</h2>
              <p className="text-zinc-500">
                Este código no corresponde a ningún registro del sistema.
                Revisa el código e intenta de nuevo.
              </p>
            </div>
          )}

          {state === 'error' && (
            <p role="alert" className="rounded-xl bg-orange-50 p-4 text-center text-orange-800">
              No se pudo consultar el registro. Intenta de nuevo más tarde.
            </p>
          )}

          {state === 'valid' && (
            <div>
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck size={44} className="text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-emerald-600">CÓDIGO REGISTRADO</h2>
                <p className="text-sm text-zinc-600 mt-3">
                  El código corresponde a un reporte registrado en Technical English Lab.
                </p>
              </div>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-[#F57C00] transition-colors"
            >
              <Home size={16} />
              Ir al portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
