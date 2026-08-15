import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ShieldAlert, ChevronLeft, Home } from 'lucide-react';
import { validateTeacherCredentials } from '../services/authService';

export const TeacherLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const isValid = await validateTeacherCredentials(username, password);
      
      if (isValid) {
        localStorage.setItem('teacherLoggedIn', 'true');
        navigate('/teacher');
      } else {
        setError('Acceso no autorizado');
      }
    } catch (err) {
      setError('Error en el sistema de autenticación');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-900 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-800">
        <div className="bg-zinc-900 p-8 text-white text-center relative">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F57C00] rounded-2xl mb-4 rotate-3">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-bold">Panel de Administración</h1>
          <p className="text-zinc-400 text-sm mt-1 uppercase tracking-widest font-mono">Restricted Access</p>
        </div>
        
        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 animate-shake">
              <ShieldAlert size={18} />
              <span className="font-bold">{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Usuario</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input
                  type="text"
                  required
                  placeholder="Administrador"
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-[#F57C00] outline-none transition-all"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-[#F57C00] outline-none transition-all"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-zinc-900 hover:bg-black text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-zinc-200 active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? 'Validando...' : 'Ingresar'}
          </button>
        </form>
        
        <div className="p-4 bg-zinc-50 border-t border-zinc-100 text-center">
          <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest">
            Authorized Personnel Only
          </p>
        </div>
      </div>

      <button 
        onClick={() => navigate('/')}
        className="mt-8 flex items-center gap-2 text-zinc-500 hover:text-white transition-colors font-bold text-sm"
      >
        <Home size={18} />
        <span>Volver al panel principal</span>
      </button>
    </div>
  );
};
