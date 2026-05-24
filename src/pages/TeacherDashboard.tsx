import React, { useState, useEffect, useRef } from 'react';
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
  Home,
  X,
  Award,
  Activity,
  Star,
  Upload,
  Loader2,
  Camera
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
  group_code: string;
  last_login: string | null;
  last_seen: string | null;
  photo_url?: string | null;
  created_at: string;
  progress: any[];
}

interface StudentDetail {
  student: StudentData;
  activityLog: any[];
}

export const TeacherDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'content' | 'students' | 'reports' | 'simulations'>('content');
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const { weeks, updateWeek, toggleWeek } = useWeeks();
  const navigate = useNavigate();

  useEffect(() => {
    if (activeTab === 'students' || activeTab === 'reports') {
      loadStudents();
    }
  }, [activeTab]);

  // Auto-refresh cada 30 segundos en la pestaña de estudiantes
  useEffect(() => {
    if (activeTab !== 'students') return;
    const interval = setInterval(loadStudents, 30000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const loadStudents = async () => {
    try {
      setLoading(true);

      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('active', true)
        .order('name');

      if (studentsError) {
        console.error('Error al consultar estudiantes:', studentsError.message, studentsError.details);
        setStudents([]);
        return;
      }

      if (!studentsData || studentsData.length === 0) {
        console.warn('No se encontraron estudiantes activos. Verifica la tabla students en Supabase.');
        setStudents([]);
        return;
      }

      const studentIds = studentsData.map(s => s.id);

      const { data: progressData, error: progressError } = await supabase
        .from('weekly_progress')
        .select('*')
        .in('student_id', studentIds)
        .order('week_number');

      if (progressError) {
        console.error('Error al consultar progreso:', progressError.message, progressError.details);
      }

      const studentsWithProgress = studentsData.map(student => {
        const studentProgress = (progressData || []).filter(p => p.student_id === student.id);
        return { ...student, progress: studentProgress };
      });

      setStudents(studentsWithProgress);
    } catch (error) {
      console.error('Error inesperado cargando estudiantes:', error);
    } finally {
      setLoading(false);
    }
  };

  const openStudentDetail = async (student: StudentData) => {
    setLoadingDetail(true);
    try {
      const { data: activityData } = await supabase
        .from('activity_log')
        .select('*')
        .eq('student_id', student.id)
        .order('timestamp', { ascending: false });

      setSelectedStudent({
        student,
        activityLog: activityData || []
      });
    } catch (err) {
      console.error('Error cargando detalle:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('teacherLoggedIn');
    navigate('/teacher/login');
  };

  const downloadReport = () => {
    const doc = new jsPDF() as any;
    doc.text('Reporte de Progreso - Technical English Lab - INTI', 14, 15);
    
    const tableData = students.map(s => {
      const completed = s.progress.filter((p: any) => p.completed).length;
      const scores = s.progress.map((p: any) => p.last_score).filter((sc: number | null) => sc !== null);
      const avg = scores.length > 0 ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0;
      const lastLogin = s.last_login ? new Date(s.last_login).toLocaleDateString('es-SV') : 'Nunca';
      return [s.nie, s.name, s.group_code, `${avg}%`, `${completed}/6`, lastLogin];
    });
    
    doc.autoTable({
      head: [['NIE', 'Nombre', 'Grupo', 'Promedio', 'Semanas', 'Última Actividad']],
      body: tableData,
      startY: 25,
    });
    
    doc.save(`reporte_ds1b_${new Date().toISOString().split('T')[0]}.pdf`);
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

  const isOnline = (lastSeen: string | null) => {
    if (!lastSeen) return false;
    const diff = Date.now() - new Date(lastSeen).getTime();
    return diff < 5 * 60 * 1000; // activo en los últimos 5 minutos
  };

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
            <p className="text-zinc-500">Panel de administración - DS1B - INTI</p>
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
            <div className="flex justify-end">
              <button
                onClick={loadStudents}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm font-bold text-zinc-600 hover:bg-zinc-50 transition-all disabled:opacity-50 shadow-sm"
              >
                <TrendingUp size={16} className={loading ? 'animate-spin' : ''} />
                {loading ? 'Actualizando...' : 'Actualizar datos'}
              </button>
            </div>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F57C00] mx-auto"></div>
              </div>
            ) : students.length === 0 ? (
              <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-12 text-center">
                <Users size={40} className="text-zinc-300 mx-auto mb-4" />
                <h3 className="font-bold text-zinc-600 mb-2">No se encontraron estudiantes</h3>
                <p className="text-sm text-zinc-400">Verifica que existan registros activos en la tabla <span className="font-mono bg-zinc-100 px-1 rounded">students</span> de Supabase.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <StatCard icon={<Users className="text-blue-500" />} label="Total Estudiantes" value={stats.totalStudents.toString()} />
                  <StatCard icon={<TrendingUp className="text-emerald-500" />} label="Promedio General" value={`${stats.averageScore}%`} />
                  <StatCard icon={<CheckCircle className="text-[#F57C00]" />} label="Semanas Completadas" value={stats.totalWeeksCompleted.toString()} />
                  <StatCard icon={<div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />} label="En línea ahora" value={students.filter(s => isOnline(s.last_seen)).length.toString()} />
                </div>

                <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-200">
                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">NIE</th>
                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Estudiante</th>
                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Grupo</th>
                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Progreso</th>
                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">En línea</th>
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
                            <td className="p-4">
                              <button
                                onClick={() => openStudentDetail(student)}
                                className="font-bold text-zinc-900 hover:text-[#F57C00] transition-colors text-left flex items-center gap-2 group"
                              >
                                {student.name}
                                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#F57C00]" />
                              </button>
                            </td>
                            <td className="p-4 text-sm text-zinc-500">{student.group_code}</td>
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
                            <td className="p-4">
                              {isOnline(student.last_seen) ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                  <span className="text-xs font-bold text-emerald-600">Activo</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <div className="w-2.5 h-2.5 bg-zinc-300 rounded-full"></div>
                                  <span className="text-xs text-zinc-400">Fuera</span>
                                </div>
                              )}
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
              <p className="text-zinc-500 mb-8">Descarga un documento PDF detallado con el progreso y notas de todos los estudiantes de DS1B.</p>
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

      {/* Student Detail Modal */}
      {selectedStudent && (
        <StudentDetailModal
          detail={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
};

const TeacherPhotoUpload = ({ student, online }: { student: any; online: boolean }) => {
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(student.photo_url || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !student.id) return;
    if (!file.type.startsWith('image/')) { alert('Solo se permiten imágenes.'); return; }
    if (file.size > 3 * 1024 * 1024) { alert('La imagen no debe superar 3MB.'); return; }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${student.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('student-photos')
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('student-photos')
        .getPublicUrl(path);

      const url = `${data.publicUrl}?t=${Date.now()}`;

      await supabase
        .from('students')
        .update({ photo_url: url })
        .eq('id', student.id);

      setPhotoUrl(url);
      student.photo_url = url;
    } catch (err) {
      console.error('Error subiendo foto:', err);
      alert('No se pudo subir la foto. Intenta de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative group">
      <div className="w-16 h-16 bg-[#F57C00] rounded-2xl overflow-hidden flex items-center justify-center font-bold text-2xl shadow-lg">
        {photoUrl
          ? <img src={photoUrl} alt={student.name} className="w-full h-full object-cover" />
          : <span className="text-white">{student.name.charAt(0)}</span>
        }
      </div>
      {/* Upload overlay */}
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-0.5"
        title="Subir foto"
      >
        {uploading
          ? <Loader2 size={16} className="text-white animate-spin" />
          : <Camera size={16} className="text-white" />
        }
        {!uploading && <span className="text-[9px] text-white font-bold">SUBIR</span>}
      </button>
      {/* Online indicator */}
      {online && (
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-zinc-900 animate-pulse" />
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleUpload}
      />
    </div>
  );
};

const StudentDetailModal = ({ detail, onClose }: { detail: StudentDetail; onClose: () => void }) => {
  const { student, activityLog } = detail;

  // Raw Supabase column names: week_number, last_score, best_score, completed
  const completed = student.progress.filter((p: any) => p.completed).length;
  const scores = student.progress.map((p: any) => p.last_score).filter((s: any) => s !== null && s !== undefined);
  const avgScore = scores.length > 0
    ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length)
    : 0;
  const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const logins = activityLog.filter((a: any) => a.action_type === 'login').length;
  const evaluations = activityLog.filter((a: any) => a.action_type === 'evaluation_completed').length;
  const lastActivity = student.last_login
    ? new Date(student.last_login).toLocaleDateString('es-SV', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Nunca';

  const isOnline = (lastSeen: string | null) => {
    if (!lastSeen) return false;
    return Date.now() - new Date(lastSeen).getTime() < 5 * 60 * 1000;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-emerald-500';
    if (score >= 70) return 'bg-[#F57C00]';
    return 'bg-red-400';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 70) return 'text-orange-700 bg-orange-50 border-orange-200';
    return 'text-red-700 bg-red-50 border-red-200';
  };

  const online = isOnline(student.last_seen);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-zinc-900 to-zinc-800 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <TeacherPhotoUpload student={student} online={online} />
              <div>
                <h2 className="font-bold text-xl">{student.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-mono bg-white/10 px-2 py-0.5 rounded-lg">NIE {student.nie}</span>
                  <span className="text-xs bg-white/10 px-2 py-0.5 rounded-lg">{student.group_code}</span>
                  {online && (
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-lg flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                      En línea
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Mini stats row */}
          <div className="grid grid-cols-4 gap-3 mt-5">
            {[
              { label: 'Semanas', value: `${completed}`, sub: 'completadas', color: 'text-orange-400' },
              { label: 'Promedio', value: `${avgScore}%`, sub: 'general', color: 'text-emerald-400' },
              { label: 'Mejor nota', value: `${bestScore}%`, sub: 'obtenida', color: 'text-yellow-400' },
              { label: 'Ingresos', value: `${logins}`, sub: 'sesiones', color: 'text-blue-400' },
            ].map((s, i) => (
              <div key={i} className="bg-white/5 rounded-2xl p-3 text-center">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-zinc-400 uppercase tracking-wider mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6 bg-zinc-50">

          {/* Progress per week */}
          {student.progress.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                  <Award size={18} className="text-[#F57C00]" />
                  Semanas evaluadas
                </h3>
                <span className="text-xs text-zinc-400 font-mono">{completed} de {student.progress.length} aprobadas</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {student.progress
                  .sort((a: any, b: any) => a.week_number - b.week_number)
                  .map((p: any) => (
                    <div key={p.week_number} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
                      {/* Week number */}
                      <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center text-sm font-bold text-zinc-700 flex-shrink-0">
                        S{p.week_number}
                      </div>

                      {/* Progress bar */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-zinc-500">Semana {p.week_number}</span>
                          <span className="text-xs text-zinc-400">{p.attempts || 1} {(p.attempts || 1) === 1 ? 'intento' : 'intentos'}</span>
                        </div>
                        <div className="h-2.5 bg-zinc-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${getScoreColor(p.last_score)}`}
                            style={{ width: `${p.last_score || 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Score badge */}
                      <div className={`px-3 py-1 rounded-xl border text-sm font-bold flex-shrink-0 ${getScoreBadge(p.last_score)}`}>
                        {p.last_score ?? 0}%
                      </div>

                      {/* Status */}
                      {p.completed
                        ? <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />
                        : <div className="w-4.5 h-4.5 rounded-full border-2 border-red-300 flex-shrink-0" />
                      }
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-zinc-100 p-8 text-center">
              <BookOpen size={32} className="text-zinc-300 mx-auto mb-3" />
              <p className="text-zinc-500 font-medium">Sin semanas evaluadas aún</p>
              <p className="text-xs text-zinc-400 mt-1">El alumno aún no ha completado ninguna evaluación</p>
            </div>
          )}

          {/* Activity log */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                <Activity size={18} className="text-[#F57C00]" />
                Historial de actividad
              </h3>
              <div className="flex gap-2">
                <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-lg">{logins} ingresos</span>
                <span className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-lg">{evaluations} evaluaciones</span>
              </div>
            </div>
            {activityLog.length === 0 ? (
              <div className="bg-white rounded-2xl border border-zinc-100 p-8 text-center">
                <Activity size={32} className="text-zinc-300 mx-auto mb-3" />
                <p className="text-zinc-500 font-medium">Sin actividad registrada</p>
              </div>
            ) : (
              <div className="space-y-2">
                {activityLog.map((log: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      log.action_type === 'login' ? 'bg-blue-50' : 'bg-emerald-50'
                    }`}>
                      {log.action_type === 'login'
                        ? <Activity size={16} className="text-blue-500" />
                        : <CheckCircle size={16} className="text-emerald-500" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-zinc-800">
                        {log.action_type === 'login' && 'Inicio de sesión'}
                        {log.action_type === 'evaluation_completed' && `Evaluación — Semana ${log.week_number}`}
                      </p>
                      {log.action_type === 'evaluation_completed' && log.metadata?.score !== undefined && (
                        <p className="text-xs text-zinc-400 mt-0.5">
                          Puntaje obtenido: <span className="font-bold text-zinc-600">{log.metadata.score}%</span>
                          {log.metadata.completed ? ' · Aprobada' : ' · No aprobada'}
                        </p>
                      )}
                    </div>
                    <span className="text-[11px] text-zinc-400 font-mono flex-shrink-0">
                      {new Date(log.timestamp).toLocaleDateString('es-SV', {
                        day: 'numeric', month: 'short',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Last activity footer */}
          <div className="text-center text-xs text-zinc-400 pb-2">
            Último ingreso: {lastActivity}
          </div>
        </div>
      </div>
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
