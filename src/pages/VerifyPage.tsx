import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, ShieldX, Loader2, Home } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface VerifiedRecord {
  studentName: string;
  nie: string;
  week: number;
  lastScore: number;
  bestScore: number;
  attempts: number;
  completed: boolean;
  updatedAt: string;
}

/**
 * Verificación pública de reportes: /verificar/<código>
 * El código lo genera la base de datos al guardar la nota. Un PDF fabricado
 * con IA tendrá un código que simplemente no existe aquí. La verdad siempre
 * se lee de la base, nunca del papel.
 */
export const VerifyPage: React.FC = () => {
  const { code } = useParams();
  const [state, setState] = useState<'loading' | 'valid' | 'invalid'>('loading');
  const [record, setRecord] = useState<VerifiedRecord | null>(null);

  useEffect(() => {
    const verify = async () => {
      const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!code || !uuidRe.test(code)) {
        setState('invalid');
        return;
      }

      const { data: row, error } = await supabase
        .from('weekly_progress')
        .select('student_id, week_number, last_score, best_score, attempts, completed, updated_at')
        .eq('verification_code', code)
        .maybeSingle();

      if (error || !row) {
        setState('invalid');
        return;
      }

      const { data: student } = await supabase
        .from('students')
        .select('name, nie')
        .eq('id', row.student_id)
        .maybeSingle();

      setRecord({
        studentName: student?.name ?? 'Desconocido',
        nie: student?.nie ?? '—',
        week: row.week_number,
        lastScore: row.last_score ?? 0,
        bestScore: row.best_score ?? 0,
        attempts: row.attempts ?? 1,
        completed: row.completed,
        updatedAt: row.updated_at
      });
      setState('valid');
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
                El documento que lo contiene <strong>no fue emitido por Technical English Lab</strong>.
              </p>
            </div>
          )}

          {state === 'valid' && record && (
            <div>
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck size={44} className="text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-emerald-600">REGISTRO AUTÉNTICO</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Datos leídos directamente de la base de datos oficial
                </p>
              </div>

              <div className="space-y-3 bg-zinc-50 rounded-2xl p-6 border border-zinc-100">
                <Row label="Estudiante" value={record.studentName} />
                <Row label="NIE" value={record.nie} />
                <Row label="Semana" value={`${record.week}`} />
                <Row label="Última nota" value={`${record.lastScore}%`} />
                <Row label="Mejor nota" value={`${record.bestScore}%`} />
                <Row label="Intentos" value={`${record.attempts}`} />
                <Row
                  label="Estado"
                  value={record.completed ? 'APROBADA' : 'NO APROBADA'}
                  valueClass={record.completed ? 'text-emerald-600' : 'text-red-600'}
                />
                <Row
                  label="Último registro"
                  value={new Date(record.updatedAt).toLocaleString('es-SV', {
                    day: 'numeric', month: 'long', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                />
              </div>

              <p className="text-[11px] text-zinc-400 text-center mt-4">
                Si la nota impresa en el PDF difiere de la mostrada aquí, la válida es esta.
              </p>
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

const Row = ({ label, value, valueClass = 'text-zinc-900' }: { label: string; value: string; valueClass?: string }) => (
  <div className="flex justify-between items-center">
    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{label}</span>
    <span className={`font-bold ${valueClass}`}>{value}</span>
  </div>
);
