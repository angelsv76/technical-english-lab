import React, { useState } from 'react';
import { User, Hash, Code, GraduationCap } from 'lucide-react';
import { Student } from '../types';

interface Props {
  onLogin: (student: Student) => void;
}

export const StudentForm: React.FC<Props> = ({ onLogin }) => {
  const [formData, setFormData] = useState<Student>({
    nie: '',
    name: '',
    code: 'DS1B'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.nie && formData.name && formData.code) {
      onLogin(formData);
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
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">NIE</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input
                  type="text"
                  required
                  placeholder="Ej: 202600123"
                  className="w-full pl-10 pr-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#F57C00] focus:border-transparent outline-none transition-all"
                  value={formData.nie}
                  onChange={e => setFormData({ ...formData, nie: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Nombre Completo</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input
                  type="text"
                  required
                  placeholder="Ej: Carlos Martínez López"
                  className="w-full pl-10 pr-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#F57C00] focus:border-transparent outline-none transition-all"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Código de Grupo</label>
              <div className="relative">
                <Code className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input
                  type="text"
                  required
                  placeholder="Ej: DS1B"
                  className="w-full pl-10 pr-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#F57C00] focus:border-transparent outline-none transition-all"
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#F57C00] hover:bg-[#E65100] text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-orange-200"
          >
            Ingresar al laboratorio
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
