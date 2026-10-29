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
import { StudentAvatar } from '../components/StudentAvatar';
import { logoutTeacher } from '../services/authService';
import { supabase } from '../lib/supabase';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface StudentData {
  id: string;
  nie: string;
  name: string;
  group_code: string;
  last_login: string | null;
  last_seen: string | null;
  photo_url?: string | null;
  created_at: string;
  active: boolean;
  progress: any[];
  // Señales de estudio real (glosario): distinguen "solo entró" de "estudió"
  wordsInGlossary: number;
  lastWeekStudied: number | null;
  reviewAttempts: number;
}

interface StudentDetail {
  student: StudentData;
  activityLog: any[];
}

export const TeacherDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'content' | 'students' | 'reports'>('students');
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const loadInFlightRef = useRef(false);
  const hasLoadedRef = useRef(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('active');
  const [reportScope, setReportScope] = useState<'active' | 'all'>('active');
  const [dataError, setDataError] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);
  const [busyStudentId, setBusyStudentId] = useState<string | null>(null);
  // Canario de integridad: fecha del último guardado real en todo el sistema
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const { weeks, toggleWeek } = useWeeks();
  const navigate = useNavigate();

  useEffect(() => {
    if (activeTab === 'students' || activeTab === 'reports') {
      loadStudents();
    }
  }, [activeTab]);

  // Actualizar ambas vistas cuando están visibles, sin acumular consultas al
  // volver a una pestaña que estuvo en segundo plano.
  useEffect(() => {
    if (activeTab === 'content') return;
    const refreshIfVisible = () => {
      if (document.visibilityState === 'visible') void loadStudents();
    };
    const interval = window.setInterval(refreshIfVisible, 30000);
    document.addEventListener('visibilitychange', refreshIfVisible);
    window.addEventListener('focus', refreshIfVisible);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', refreshIfVisible);
      window.removeEventListener('focus', refreshIfVisible);
    };
  }, [activeTab]);

  const loadStudents = async () => {
    if (loadInFlightRef.current) return;
    loadInFlightRef.current = true;
    try {
      if (hasLoadedRef.current) setRefreshing(true);
      else setLoading(true);

      const studentsData: any[] = [];
      const pageSize = 1000;
      for (let offset = 0; ; offset += pageSize) {
        const { data, error } = await supabase.from('students')
          .select('id, nie, name, group_code, last_login, last_seen, photo_url, created_at, active')
          .order('id').range(offset, offset + pageSize - 1);
        if (error) throw error;
        studentsData.push(...(data || []));
        if (!data || data.length < pageSize) break;
      }

      if (studentsData.length === 0) {
        console.warn('No se encontraron estudiantes en Supabase.');
        setStudents([]);
        setLastSavedAt(null);
        setLastUpdatedAt(new Date());
        setDataError(null);
        hasLoadedRef.current = true;
        return;
      }

      const studentIds = studentsData.map(s => s.id);
      const loadAllRows = async (table: 'weekly_progress' | 'glossary_entries', columns: string) => {
        const rows: any[] = [];
        for (let start = 0; start < studentIds.length; start += 100) {
          const ids = studentIds.slice(start, start + 100);
          for (let offset = 0; ; offset += pageSize) {
            const { data, error } = await supabase.from(table).select(columns)
              .in('student_id', ids).order('id').range(offset, offset + pageSize - 1);
            if (error) throw error;
            rows.push(...(data || []));
            if (!data || data.length < pageSize) break;
          }
        }
        return rows;
      };

      const [progressData, glossaryData] = await Promise.all([
        loadAllRows('weekly_progress', 'student_id, week_number, last_score, best_score, attempts, completed, updated_at'),
        // Glosario: la señal de que el alumno abrió/estudió una semana.
        loadAllRows('glossary_entries', 'student_id, week_introduced, review_count')
      ]);

      const progressByStudent = new Map<string, any[]>();
      const glossaryByStudent = new Map<string, any[]>();
      for (const row of progressData) {
        const rows = progressByStudent.get(row.student_id) || [];
        rows.push(row);
        progressByStudent.set(row.student_id, rows);
      }
      for (const row of glossaryData) {
        const rows = glossaryByStudent.get(row.student_id) || [];
        rows.push(row);
        glossaryByStudent.set(row.student_id, rows);
      }

      const studentsWithProgress = studentsData.map(student => {
        const studentProgress = progressByStudent.get(student.id) || [];
        const studentGlossary = glossaryByStudent.get(student.id) || [];
        return {
          ...student,
          progress: studentProgress,
          wordsInGlossary: studentGlossary.length,
          lastWeekStudied: studentGlossary.length > 0
            ? Math.max(...studentGlossary.map(g => g.week_introduced))
            : null,
          reviewAttempts: studentGlossary.reduce((sum, g) => sum + (g.review_count || 0), 0)
        };
      });

      // Canario: última escritura real de una nota en todo el sistema
      const timestamps = (progressData || [])
        .map(p => p.updated_at)
        .filter(Boolean)
        .sort();
      setLastSavedAt(timestamps.length > 0 ? timestamps[timestamps.length - 1] : null);

      // Sort by first apellido (second-to-last word for 3+ word names, last word for 2-word names)
      studentsWithProgress.sort((a, b) => {
        const wordsA = a.name.split(' ');
        const wordsB = b.name.split(' ');
        const apellidoA = (wordsA.length >= 3 ? wordsA[wordsA.length - 2] : wordsA[wordsA.length - 1]).toLowerCase();
        const apellidoB = (wordsB.length >= 3 ? wordsB[wordsB.length - 2] : wordsB[wordsB.length - 1]).toLowerCase();
        return apellidoA.localeCompare(apellidoB, 'es');
      });

      setStudents(studentsWithProgress);
      setLastUpdatedAt(new Date());
      setDataError(null);
      hasLoadedRef.current = true;
    } catch (error) {
      console.error('Error inesperado cargando estudiantes:', error);
      setDataError('No se pudieron cargar todos los datos. Las descargas están deshabilitadas hasta actualizar.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      loadInFlightRef.current = false;
    }
  };

  const toggleStudentActive = async (student: StudentData) => {
    const nextActive = !student.active;
    if (!nextActive && !window.confirm(`¿Deshabilitar a ${student.name}? No podrá iniciar sesión ni guardar evaluaciones.`)) return;
    setBusyStudentId(student.id);
    setDataError(null);
    try {
      const { data, error } = await supabase.from('students')
        .update({ active: nextActive }).eq('id', student.id).select('id, active').single();
      if (error || !data || data.active !== nextActive) throw error || new Error('No se confirmó el cambio');
      setStudents(previous => previous.map(item => item.id === student.id ? { ...item, active: nextActive } : item));
      setSelectedStudent(previous => previous?.student.id === student.id
        ? { ...previous, student: { ...previous.student, active: nextActive } } : previous);
    } catch (error) {
      console.error('Error cambiando estado del alumno:', error);
      setDataError('No se pudo cambiar el estado del alumno. Comprueba los permisos e intenta de nuevo.');
    } finally {
      setBusyStudentId(null);
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

  const handleLogout = async () => {
    await logoutTeacher();
    navigate('/teacher/login');
  };

  const downloadReport = () => {
    if (loading || refreshing || dataError || reportStudents.length === 0) return;
    setReportError(null);
    try {
      const doc = new jsPDF();
      doc.text('Reporte de Progreso - Technical English Lab - INTI', 14, 15);

      const tableData = reportStudents.map(s => {
        const completed = s.progress.filter((p: any) => p.completed).length;
        const scores = s.progress.map((p: any) => p.last_score).filter((sc: number | null) => sc !== null);
        const avg = scores.length > 0 ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0;
        const lastLogin = s.last_login ? new Date(s.last_login).toLocaleDateString('es-SV') : 'Nunca';
        return [s.nie, s.name, s.group_code, s.active ? 'Activo' : 'Inactivo', `${avg}%`, `${completed}/40`, lastLogin];
      });

      autoTable(doc, {
        head: [['NIE', 'Nombre', 'Grupo', 'Estado', 'Promedio', 'Semanas', 'Último acceso']],
        body: tableData,
        startY: 25,
      });

      doc.save(`reporte_ds1b_${reportScope}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generando el PDF docente:', error);
      setReportError('No se pudo generar el PDF. Intenta de nuevo o descarga el CSV.');
    }
  };

  const downloadCsv = () => {
    if (loading || refreshing || dataError || reportStudents.length === 0) return;
    const rows = [
      ['NIE', 'Nombre', 'Grupo', 'Estado', 'Semana', 'Última nota', 'Mejor nota', 'Intentos', 'Completada', 'Último acceso'],
      ...reportStudents.flatMap(student => {
        const base = [student.nie, student.name, student.group_code, student.active ? 'Activo' : 'Inactivo'];
        const lastLogin = student.last_login || '';
        return student.progress.length > 0
          ? student.progress.map(progress => [...base, progress.week_number, progress.last_score ?? '', progress.best_score ?? '', progress.attempts ?? '', progress.completed ? 'Sí' : 'No', lastLogin])
          : [[...base, '', '', '', '', '', lastLogin]];
      })
    ];
    const safeCell = (value: unknown) => {
      const text = String(value);
      const neutralized = /^[\s\u0000-\u001f]*[=+@-]/.test(text) ? `'${text}` : text;
      return `"${neutralized.replace(/"/g, '""')}"`;
    };
    const csv = '\uFEFF' + rows.map(row => row.map(safeCell).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `calificaciones_ds1b_${reportScope}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
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
  const visibleStudents = students.filter(student => statusFilter === 'all' || student.active === (statusFilter === 'active'));
  const reportStudents = students.filter(student => reportScope === 'all' || student.active);

  const isOnline = (lastSeen: string | null) => {
    if (!lastSeen) return false;
    const diff = Date.now() - new Date(lastSeen).getTime();
    return diff < 5 * 60 * 1000; // activo en los últimos 5 minutos
  };

  // Canario de integridad: si nadie guarda una nota en 48h de días lectivos,
  // probablemente algo está roto (así se habrían detectado los 2 meses del RLS).
  const hoursSinceLastSave = lastSavedAt
    ? (Date.now() - new Date(lastSavedAt).getTime()) / 3600000
    : Infinity;
  const canaryAlert = hoursSinceLastSave > 48;
  const lastSavedLabel = lastSavedAt
    ? hoursSinceLastSave < 1
      ? 'hace menos de 1 hora'
      : hoursSinceLastSave < 24
        ? `hace ${Math.round(hoursSinceLastSave)} h`
        : `hace ${Math.round(hoursSinceLastSave / 24)} día(s)`
    : 'nunca';

  // Clasificación honesta de actividad: evaluó > estudió > solo entró
  const studyStatus = (s: StudentData): 'evaluated' | 'studied' | 'idle' => {
    if (s.progress.length > 0) return 'evaluated';
    if (s.wordsInGlossary > 0) return 'studied';
    return 'idle';
  };
  const idleCount = students.filter(s => s.active && studyStatus(s) === 'idle').length;

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
              onToggleWeek={toggleWeek}
              isFullPage={true}
            />
          </div>
        )}

        {activeTab === 'students' && (
          <div className="space-y-6">
            {dataError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{dataError}</p>}
            {/* Canario de integridad de datos */}
            {!loading && students.length > 0 && (
              <div className={`p-4 rounded-2xl border flex flex-wrap items-center gap-x-6 gap-y-2 ${
                canaryAlert ? 'bg-red-50 border-red-300' : 'bg-white border-zinc-200'
              }`}>
                <div className={`text-sm font-bold ${canaryAlert ? 'text-red-700' : 'text-zinc-600'}`}>
                  {canaryAlert ? '⚠ NINGUNA NOTA GUARDADA EN MÁS DE 48 HORAS — posible fallo del sistema de guardado' : '✓ Sistema de guardado con actividad reciente'}
                </div>
                <div className="text-xs text-zinc-500">
                  Última nota guardada: <strong className="text-zinc-800">{lastSavedLabel}</strong>
                </div>
                {idleCount > 0 && (
                  <div className="text-xs text-orange-700 font-bold">
                    {idleCount} alumno{idleCount !== 1 ? 's' : ''} sin actividad real (solo login)
                  </div>
                )}
              </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="text-sm font-medium text-zinc-700" htmlFor="student-status-filter">
                Mostrar alumnos
                <select id="student-status-filter" value={statusFilter} onChange={event => setStatusFilter(event.target.value as typeof statusFilter)}
                  className="ml-3 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-600">
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                  <option value="all">Todos</option>
                </select>
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-xs text-zinc-500" aria-live="polite">
                  {lastUpdatedAt ? `Última actualización: ${lastUpdatedAt.toLocaleTimeString('es-SV')}` : 'Esperando datos'} · cada 30 s
                </p>
                <button
                  onClick={loadStudents}
                  disabled={loading || refreshing}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm font-bold text-zinc-600 hover:bg-zinc-50 transition-all disabled:opacity-50 shadow-sm"
                >
                  <TrendingUp size={16} className={loading || refreshing ? 'animate-spin' : ''} />
                  {loading || refreshing ? 'Actualizando...' : 'Actualizar datos'}
                </button>
              </div>
            </div>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F57C00] mx-auto"></div>
              </div>
            ) : students.length === 0 ? (
              <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-12 text-center">
                <Users size={40} className="text-zinc-300 mx-auto mb-4" />
                <h3 className="font-bold text-zinc-600 mb-2">No se encontraron estudiantes</h3>
                <p className="text-sm text-zinc-500">Verifica que existan registros en la tabla <span className="font-mono bg-zinc-100 px-1 rounded">students</span> de Supabase.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <StatCard icon={<Users className="text-blue-500" />} label="Total Estudiantes" value={stats.totalStudents.toString()} />
                  <StatCard icon={<TrendingUp className="text-emerald-500" />} label="Promedio General" value={`${stats.averageScore}%`} />
                  <StatCard icon={<CheckCircle className="text-[#F57C00]" />} label="Semanas Completadas" value={stats.totalWeeksCompleted.toString()} />
                  <StatCard icon={<div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />} label="En línea ahora" value={students.filter(s => s.active && isOnline(s.last_seen)).length.toString()} />
                </div>

                <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-x-auto">
                  {visibleStudents.length === 0 && <p className="p-6 text-sm text-zinc-600">No hay alumnos con este estado.</p>}
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-200">
                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider w-16">Foto</th>
                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider w-28">NIE</th>
                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Estudiante</th>
                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider w-24">Grupo</th>
                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider w-32">Estudio</th>
                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider w-48">Progreso</th>
                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider w-28">En línea</th>
                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider w-36">Última Actividad</th>
                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider w-36">Acceso</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleStudents.map(student => {
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
                            <td className="p-4 w-16">
                              <button
                                type="button"
                                onClick={() => openStudentDetail(student)}
                                aria-label={`Ver detalles de ${student.name}`}
                                className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-[#F57C00] hover:ring-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 flex-shrink-0"
                              >
                                <StudentAvatar name={student.name} photoUrl={student.photo_url} size={40} className="w-full h-full object-cover" />
                              </button>
                            </td>
                            <td className="p-4 w-28 whitespace-nowrap font-mono text-sm text-zinc-600">{student.nie}</td>
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
                              {studyStatus(student) === 'evaluated' ? (
                                <span className="inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Evaluó
                                </span>
                              ) : studyStatus(student) === 'studied' ? (
                                <span className="inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                                  Estudió S{student.lastWeekStudied}
                                </span>
                              ) : (
                                <span className="inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-zinc-100 text-zinc-500 border border-zinc-200">
                                  Solo entró
                                </span>
                              )}
                            </td>
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
                              {!student.active ? (
                                <span className="text-xs font-bold text-zinc-600">Deshabilitado</span>
                              ) : isOnline(student.last_seen) ? (
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
                            <td className="p-4">
                              <button type="button" onClick={() => toggleStudentActive(student)}
                                disabled={busyStudentId === student.id}
                                aria-label={`${student.active ? 'Deshabilitar' : 'Habilitar'} a ${student.name}`}
                                className={`min-h-11 rounded-lg px-3 py-2 text-xs font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:opacity-50 ${student.active ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'}`}>
                                {busyStudentId === student.id ? 'Guardando…' : student.active ? 'Deshabilitar' : 'Habilitar'}
                              </button>
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
          <div className="max-w-2xl space-y-4">
            {dataError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{dataError}</p>}
            {reportError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{reportError}</p>}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500">
              <span>{lastUpdatedAt ? `Última actualización: ${lastUpdatedAt.toLocaleTimeString('es-SV')}` : 'Esperando datos'} · cada 30 s</span>
              <button type="button" onClick={loadStudents} disabled={loading || refreshing}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 font-bold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50">
                {loading || refreshing ? 'Actualizando...' : 'Actualizar datos'}
              </button>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6">
                <FileText size={40} />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-2">Reporte de Calificaciones</h3>
              <p className="text-zinc-600 mb-6">El PDF resume el progreso. El CSV incluye una fila por evaluación y se puede abrir en una hoja de cálculo.</p>
              <label htmlFor="report-scope" className="w-full text-left text-sm font-medium text-zinc-700 mb-6">
                Participantes incluidos
                <select id="report-scope" value={reportScope} onChange={event => setReportScope(event.target.value as typeof reportScope)}
                  className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-600">
                  <option value="active">Solo activos</option>
                  <option value="all">Todos, incluidos deshabilitados</option>
                </select>
              </label>
              <p className="mb-4 text-sm text-zinc-600" aria-live="polite">{loading ? 'Cargando datos…' : `${reportStudents.length} participantes incluidos`}</p>
              <div className="grid w-full gap-3 sm:grid-cols-2">
                <button onClick={downloadReport} disabled={loading || refreshing || !!dataError || reportStudents.length === 0}
                  className="flex items-center justify-center gap-2 py-4 bg-zinc-900 text-white font-bold rounded-2xl hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:opacity-50 disabled:cursor-not-allowed">
                  <Download size={20} aria-hidden="true" /> Descargar PDF
                </button>
                <button onClick={downloadCsv} disabled={loading || refreshing || !!dataError || reportStudents.length === 0}
                  className="flex items-center justify-center gap-2 py-4 bg-orange-600 text-white font-bold rounded-2xl hover:bg-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:opacity-50 disabled:cursor-not-allowed">
                  <Download size={20} aria-hidden="true" /> Descargar CSV
                </button>
              </div>
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

      const { error: updateError } = await supabase
        .from('students')
        .update({ photo_url: url })
        .eq('id', student.id);
      if (updateError) throw updateError;

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
      <div className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center shadow-lg">
        <StudentAvatar name={student.name} photoUrl={photoUrl} size={64} className="w-full h-full object-cover" />
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
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { onCloseRef.current(); return; }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), a[href], select:not([disabled])'));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => { document.removeEventListener('keydown', onKeyDown); previousFocus?.focus(); };
  }, []);

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
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="student-detail-title"
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-zinc-900 to-zinc-800 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <TeacherPhotoUpload student={student} online={online} />
              <div>
                <h2 id="student-detail-title" className="font-bold text-xl">{student.name}</h2>
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
            <button ref={closeRef} onClick={onClose} aria-label="Cerrar detalle del alumno" className="p-2 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white rounded-xl transition-colors">
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
