import React, { useState } from 'react';
import { User, Hash, GraduationCap, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Props {
  onLogin: (student: any) => void;
}

export const StudentForm: React.FC<Props> = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    nie: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Buscar estudiante en la tabla
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('nie', formData.nie)
        .eq('active', true)
        .single();

      if (studentError || !student) {
        setError('NIE no registrado en el sistema. Contacta a tu profesor.');
        setLoading(false);
        return;
      }

      // 2. Intentar login con Supabase Auth
      const email = `${formData.nie}@estudiantes.inti.edu.sv`;
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: formData.password,
      });

      if (authError) {
        setError('Contraseña incorrecta. Si es tu primera vez, usa los primeros 4 dígitos de tu NIE.');
        setLoading(false);
        return;
      }

      // 3. Actualizar último login
      await supabase
        .from('students')
        .update({ last_login: new Date().toISOString() })
        .eq('id', student.id);

      // 4. Registrar actividad
      await supabase.from('activity_log').insert({
        student_id: student.id,
        action_type: 'login',
        metadata: { nie: student.nie, timestamp: new Date().toISOString() }
      });

      // 5. Login exitoso
      onLogin({
        id: student.id,
        nie: student.nie,
        name: student.name,
        code: student.group_code
      });

    } catch (err) {
      console.error('Error en login:', err);
      setError('Error al iniciar sesión. Verifica tu conexión e intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden">
        <div className="bg-[#F57C00] p-8 text-white text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
            <GraduationCap size={32} />
          </div>
          <h1 className="text-2xl font-bold">Inglés Técnico</h1>
          <p className="opacity-90">Especialidad Desarrollo de Software</p>
          <p className="text-sm mt-2 opacity-75">Grupo ITSI1B</p>
        </div>
        
        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                NIE
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input
                  type="text"
                  required
                  placeholder="Ej: 202600123"
                  className="w-full pl-10 pr-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#F57C00] focus:border-transparent outline-none transition-all"
                  value={formData.nie}
                  onChange={e => setFormData({ ...formData, nie: e.target.value })}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input
                  type="password"
                  required
                  placeholder="Tu contraseña"
                  className="w-full pl-10 pr-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#F57C00] focus:border-transparent outline-none transition-all"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Primera vez: usa los primeros 4 dígitos de tu NIE
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F57C00] hover:bg-[#E65100] text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Verificando...
              </>
            ) : (
              'Ingresar al laboratorio'
            )}
          </button>
        </form>
        
        <div className="p-4 bg-zinc-50 border-t border-zinc-100 text-center">
          <p className="text-xs text-zinc-500 font-mono uppercase">
            Software Development Program - INTI
          </p>
        </div>
      </div>
    </div>
  );
};
