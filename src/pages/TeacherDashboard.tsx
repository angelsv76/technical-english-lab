import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Users, TrendingUp, AlertTriangle, CheckCircle, Calendar, Download } from 'lucide-react';

interface DashboardStats {
  totalStudents: number;
  activeThisWeek: number;
  averageScore: number;
  studentsAtRisk: number;
}

interface StudentData {
  id: string;
  nie: string;
  name: string;
  last_login: string | null;
  created_at: string;
  progress: any[];
}

export const TeacherDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      // 1. Obtener todos los estudiantes
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('group_code', 'ITSI1B')
        .eq('active', true)
        .order('name');

      if (studentsError) throw studentsError;

      // 2. Obtener progreso de todos
      const { data: progressData } = await supabase
        .from('weekly_progress')
        .select('*')
        .order('week_number');

      // 3. Organizar datos por estudiante
      const studentsWithProgress = (studentsData || []).map(student => {
        const studentProgress = (progressData || []).filter(
          p => p.student_id === student.id
        );
        return {
          ...student,
          progress: studentProgress
        };
      });

      setStudents(studentsWithProgress);

      // 4. Calcular estadísticas
      const totalStudents = studentsWithProgress.length;

      // Actividad reciente (última semana)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const activeThisWeek = studentsWithProgress.filter(
        s => s.last_login && new Date(s.last_login) > weekAgo
      ).length;

      // Promedio de calificaciones
      const allScores = progressData?.map(p => p.last_score).filter(s => s !== null) || [];
      const averageScore = allScores.length > 0
        ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
        : 0;

      // Estudiantes en riesgo (< 70% promedio)
      const studentsAtRisk = studentsWithProgress.filter(student => {
        const scores = student.progress.map(p => p.last_score).filter(s => s !== null);
        if (scores.length === 0) return false;
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        return avg < 70;
      }).length;

      setStats({
        totalStudents,
        activeThisWeek,
        averageScore,
        studentsAtRisk
      });

    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['NIE', 'Nombre', 'Semanas Completadas', 'Promedio', 'Último Acceso'];
    const rows = students.map(student => {
      const completed = student.progress.filter(p => p.completed).length;
      const scores = student.progress.map(p => p.last_score).filter(s => s !== null);
      const avg = scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;
      const lastLogin = student.last_login
        ? new Date(student.last_login).toLocaleDateString('es-SV')
        : 'Nunca';

      return [student.nie, student.name, completed, avg + '%', lastLogin];
    });

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `progreso_itsi1b_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F57C00] mx-auto mb-4"></div>
          <p className="text-zinc-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">Panel del Profesor</h1>
            <p className="text-zinc-600 mt-1">Inglés Técnico - ITSI1B</p>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-[#F57C00] text-white px-4 py-2 rounded-lg hover:bg-[#E65100] transition-colors"
          >
            <Download size={18} />
            Exportar CSV
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Users />}
            label="Total Estudiantes"
            value={stats?.totalStudents || 0}
            color="blue"
          />
          <StatCard
            icon={<TrendingUp />}
            label="Activos (7 días)"
            value={stats?.activeThisWeek || 0}
            color="green"
          />
          <StatCard
            icon={<CheckCircle />}
            label="Promedio Grupo"
            value={`${stats?.averageScore || 0}%`}
            color="purple"
          />
          <StatCard
            icon={<AlertTriangle />}
            label="En Riesgo (<70%)"
            value={stats?.studentsAtRisk || 0}
            color="red"
          />
        </div>

        {/* Tabla de estudiantes */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-zinc-200 bg-zinc-50">
            <h2 className="text-xl font-bold text-zinc-900">Estudiantes ITSI1B</h2>
            <p className="text-sm text-zinc-600 mt-1">
              {students.length} estudiantes registrados
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-600 uppercase">
                    NIE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-600 uppercase">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-zinc-600 uppercase">
                    Semanas Completadas
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-zinc-600 uppercase">
                    Promedio
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-zinc-600 uppercase">
                    Último Acceso
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-zinc-600 uppercase">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {students.map(student => {
                  const completed = student.progress.filter(p => p.completed).length;
                  const scores = student.progress.map(p => p.last_score).filter(s => s !== null);
                  const avg = scores.length > 0
                    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
                    : 0;
                  const lastLogin = student.last_login
                    ? new Date(student.last_login).toLocaleDateString('es-SV', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })
                    : 'Nunca';

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-zinc-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedStudent(
                        selectedStudent === student.id ? null : student.id
                      )}
                    >
                      <td className="px-6 py-4 text-sm font-mono text-zinc-900">
                        {student.nie}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-zinc-900">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        <span className="inline-flex items-center gap-1">
                          <Calendar size={14} className="text-zinc-400" />
                          {completed} / 6
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-full font-medium ${
                            avg >= 90
                              ? 'bg-green-100 text-green-800'
                              : avg >= 70
