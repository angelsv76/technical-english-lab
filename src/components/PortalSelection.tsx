import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Settings, User, ShieldCheck } from 'lucide-react';

export const PortalSelection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Student Portal */}
        <div 
          onClick={() => navigate('/student/login')}
          className="group bg-white p-12 rounded-3xl border border-zinc-200 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer flex flex-col items-center text-center"
        >
          <div className="w-24 h-24 bg-orange-50 text-[#F57C00] rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
            <GraduationCap size={48} />
          </div>
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">Acceso Estudiante</h2>
          <p className="text-zinc-500 mb-8">Ingresa con tu NIE para realizar tus prácticas y evaluaciones semanales.</p>
          <div className="flex items-center gap-2 text-[#F57C00] font-bold">
            <User size={20} />
            <span>Entrar al Laboratorio</span>
          </div>
        </div>

        {/* Teacher Portal */}
        <div 
          onClick={() => navigate('/teacher/login')}
          className="group bg-zinc-900 p-12 rounded-3xl border border-zinc-800 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer flex flex-col items-center text-center text-white"
        >
          <div className="w-24 h-24 bg-white/10 text-[#F57C00] rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
            <Settings size={48} />
          </div>
          <h2 className="text-3xl font-bold mb-4">Acceso Docente</h2>
          <p className="text-zinc-400 mb-8">Gestión de contenidos, seguimiento de progreso y reportes administrativos.</p>
          <div className="flex items-center gap-2 text-[#F57C00] font-bold">
            <ShieldCheck size={20} />
            <span>Panel de Administración</span>
          </div>
        </div>
      </div>
    </div>
  );
};
