import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  FileText, 
  LogOut, 
  Download, 
  TrendingUp, 
  CheckCircle,
  Clock,
  ChevronRight,
  Settings,
  ShieldCheck,
  Home
} from 'lucide-react';
import { useWeeks } from '../hooks/useWeeks';
import { TeacherPanel } from '../components/TeacherPanel';
import { simulations } from '../data/simulations';
import { supabase } from '../lib/supabase';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface StudentData {
  id: string;
  nie: string;
  name: string;
  last_login: string | null;
  created_at: string;
  progress: any[];
}

export const TeacherDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'content' | 'students' | 'reports' | 'simulations'>('content');
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const { weeks, updateWeek, toggleWeek } = useWeeks();
  const navigate = useNavigate();

  useEffect(() => {
    if (activeTab === 'students' || activeTab === 'reports') {
      loadStudents();
    }
  }, [activeTab]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const { data: studentsData } = await supabase
        .from('students')
        .select('*')
        .eq('group_code', 'ITSI1B')
        .eq('active', true)
        .order('name');

      const { data: progressData } = await supabase
        .from('weekly_progress')
        .select('*')
        .order('week_number');

      const studentsWithProgress = (studentsData || []).map(student => {
        const studentProgress = (progressData || []).filter(p => p.student_id === student.id);
        return { ...student, progress: studentProgress };
      });

      setStudents(studentsWithProgress);
    } catch (error) {
      console.error('Error cargando estudiantes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('teacherLoggedIn');
    navigate('/teacher/login');
  };

  const downloadReport = () => {
    const doc = new jsPDF() as any;
    doc.text('Reporte de Progreso - Inglés Técnico ITSI1B - INTI', 14, 15);
    
    const tableData = students.map(s => {
      const completed = s.progress.filter((p: any) => p.completed).length;
      const scores = s.progress.map((p: any) => p.last_score).filter((sc: number | null) => sc !== null);
      const avg = scores.length > 0 ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0;
      const lastLogin = s.last_login ? new Date(s.last_login).toLocaleDateString('es-SV') : 'Nunca';
      return [s.nie, s.name, 'ITSI1B', `${avg}%`, `${completed}/6`, lastLogin];
    });
    
    doc.autoTable({
      head: [['NIE', 'Nombre', 'Grupo', 'Promedio', 'Semanas', 'Última Actividad']],
      body: tableData,
      startY: 25,
    });
    
    doc.save(`reporte_itsi1b_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const calculateStats = () => {
    const totalStudents = students.length;
    const allScores = students.flatMap(s => 
      s.progress.map((p: any) => p.last_score).filter((sc: number | null) => sc !== null)
    );
    const averageScore = allScores.length > 0
      ? Math.round(allScores.reduce((a: number, b: number) => a + b, 0) / allScores.length)
      : 0;
    
    const totalWeeksCompleted = students.reduce((sum, s) => 
      sum + s.progress.filter((p: any) => p.completed).length, 0
    );

    return { totalStudents, averageScore, totalWeeksCompleted };
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 text-white flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#F57C00] rounded-xl flex items-center justify-center">
              <Settings size={24} />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Admin Lab</h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Technical English</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-zinc-800 rounded-xl">
            <p className="text-xs text-zinc-400">Rol:</p>
            <p className="text-sm font-bold">Administrador</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavButton 
            active={activeTab === 'content'} 
            onClick={() => setActiveTab('content')}
            icon={<BookOpen size={20} />}
            label="Gestión de Contenido"
          />
          <NavButton 
            active={activeTab === 'simulations'} 
            onClick={() => setActiveTab('simulations')}
            icon={<ShieldCheck size={20} />}
            label="Banco de Simulaciones"
          />
          <NavButton 
            active={activeTab === 'students'} 
            onClick={() => setActiveTab('students')}
            icon={<Users size={20} />}
            label="Progreso de Estudiantes"
          />
          <NavButton 
            active={activeTab === 'reports'} 
            onClick={() => setActiveTab('reports')}
            icon={<FileText size={20} />}
            label="Reportes y Descargas"
          />
        </nav>

        <div className="p-4 border-t border-zinc-800 space-y-2">
          <button 
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 p-3 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            <Home size={20} />
            <span className="font-bold text-sm">Panel Principal</span>
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 text-zinc-400 hover:text-white hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all"
          >
            <LogOut size={20} />
            <span className="font-bold text-sm">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-zinc-900">
              {activeTab === 'content' && 'Gestión de Contenido'}
              {activeTab === 'simulations' && 'Banco de Simulaciones'}
              {activeTab === 'students' && 'Progreso de Estudiantes'}
              {activeTab === 'reports' && 'Reportes y Descargas'}
            </h2>
            <p className="text-zinc-500">Panel de administración - ITSI1B - INTI</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-white p-2 rounded-xl border border-zinc-200 flex items-center gap-3 px-4 shadow-sm">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold text-zinc-600 uppercase tracking-wider">Sistema Activo</span>
            </div>
          </div>
        </header>

        {activeTab === 'content' && (
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
            <TeacherPanel 
              weeks={weeks}
              onUpdateWeek={updateWeek}
              onToggleWeek={toggleWeek}
              onClose={() => {}}
              isFullPage={true}
            />
          </div>
        )}

        {activeTab === 'simulations' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {simulations.slice(0, 12).map(sim => (
                <div key={sim.simulationId} className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-6 border-b border-zinc-100 flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-[#F57C00] uppercase tracking-widest">{sim.type}</span>
                      <h3 className="font-bold text-zinc-900">{sim.simulationId}</h3>
                    </div>
                    <div className="w-8 h-8 bg-zinc-50 rounded-lg flex items-center justify-center text-zinc-400">
                      <ShieldCheck size={18} />
                    </div>
                  </div>
                  <div className="p-6 flex-1 space-y-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase">Instrucción</p>
                      <p className="text-sm text-zinc-600 line-clamp-3">{sim.instruction}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase">Visual</p>
                      <p className="text-xs font-mono text-zinc-500 bg-zinc-50 p-2 rounded-lg line-clamp-2">{sim.visual}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F57C00] mx-auto"></div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard icon={<Users className="text-blue-500" />} label="Total Estudiantes" value={stats.totalStudents.toString()} />
                  <StatCard icon={<TrendingUp className="text-emerald-500" />} label="Promedio General" value={`${stats.averageScore}%`} />
                  <StatCard icon={<CheckCircle className="text-[#F57C00]" />} label="Semanas Completadas" value={stats.totalWeeksCompleted.toString()} />
                </div>

                <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-200">
                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">NIE</th>
                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Estudiante</th>
                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Grupo</th>
                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Progreso</th>
                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Última Actividad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map(student => {
                        const completed = student.progress.filter((p: any) => p.completed).length;
                        const scores = student.progress.map((p: any) => p.last_score).filter((s: number | null) => s !== null);
                        const avgProgress = scores.length > 0 
                          ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) 
                          : 0;
                        const lastLogin = student.last_login
                          ? new Date(student.last_login).toLocaleDateString('es-SV', { year: 'numeric', month: 'short', day: 'numeric' })
                          : 'Nunca';

                        return (
                          <tr key={student.id} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                            <td className="p-4 font-mono text-sm text-zinc-600">{student.nie}</td>
                            <td className="p-4 font-bold text-zinc-900">{student.name}</td>
                            <td className="p-4 text-sm text-zinc-500">ITSI1B</td>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-[#F57C00]" 
                                    style={{ width: `${avgProgress}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs font-bold text-zinc-900">{avgProgress}%</span>
                              </div>
                              <p className="text-[10px] text-zinc-400 mt-1">{completed} semanas completadas</p>
                            </td>
                            <td className="p-4 text-sm text-zinc-500">
                              <div className="flex items-center gap-2">
                                <Clock size={14} />
                                {lastLogin}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6">
                <FileText size={40} />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-2">Reporte de Calificaciones</h3>
              <p className="text-zinc-500 mb-8">Descarga un documento PDF detallado con el progreso y notas de todos los estudiantes de ITSI1B.</p>
              <button 
                onClick={downloadReport}
                disabled={loading || students.length === 0}
                className="w-full flex items-center justify-center gap-2 py-4 bg-zinc-900 text-white font-bold rounded-2xl hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={20} />
                Descargar PDF
              </button>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-6">
                <TrendingUp size={40} />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-2">Estadísticas de Uso</h3>
              <p className="text-zinc-500 mb-8">Analiza qué semanas tienen mayor dificultad y el tiempo promedio de estudio por estudiante.</p>
              <button className="w-full flex items-center justify-center gap-2 py-4 bg-zinc-100 text-zinc-400 font-bold rounded-2xl cursor-not-allowed">
                Próximamente
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`
      w-full flex items-center gap-3 p-3 rounded-xl transition-all font-bold text-sm
      ${active 
        ? 'bg-[#F57C00] text-white shadow-lg shadow-orange-900/20' 
        : 'text-zinc-400 hover:text-white hover:bg-white/5'}
    `}
  >
    {icon}
    {label}
  </button>
);

const StatCard = ({ icon, label, value }: any) => (
  <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm flex items-center gap-4">
    <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center">
      {icon}
    </div>
    <div>
      <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-zinc-900">{value}</p>
    </div>
  </div>
);
