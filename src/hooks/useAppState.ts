import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Student, WeeklyProgress, GlossaryEntry } from '../lib/supabase';
import { weeks } from '../data/weeks/index';
import { nextReviewDate } from '../utils/srs';

export const useAppState = () => {
  const [student, setStudent] = useState<any | null>(() => {
    const saved = localStorage.getItem('student');
    return saved ? JSON.parse(saved) : null;
  });
  const [progress, setProgress] = useState<any[]>([]);
  const [glossary, setGlossary] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Guardar estudiante en localStorage
  useEffect(() => {
    if (student) {
      localStorage.setItem('student', JSON.stringify(student));
      loadStudentData();
    } else {
      localStorage.removeItem('student');
      setProgress([]);
      setGlossary([]);
    }
  }, [student?.id]);

  // Heartbeat — actualizar last_seen cada 60 segundos mientras el alumno está activo
  useEffect(() => {
    if (!student?.id) return;

    const updateLastSeen = async () => {
      await supabase
        .from('students')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', student.id);
    };

    updateLastSeen(); // inmediato al cargar
    const interval = setInterval(updateLastSeen, 60000); // cada 60s
    return () => clearInterval(interval);
  }, [student?.id]);

  // Cargar datos del estudiante desde Supabase
  const loadStudentData = async () => {
    if (!student?.id) {
      setLoading(false);
      return;
    }

    try {
      // Cargar progreso
      const { data: progressData } = await supabase
        .from('weekly_progress')
        .select('*')
        .eq('student_id', student.id)
        .order('week_number', { ascending: true });

      if (progressData) {
        // Convertir a formato antiguo para compatibilidad
        const formattedProgress = progressData.map((p: WeeklyProgress) => ({
          week: p.week_number,
          lastScore: p.last_score || 0,
          bestScore: p.best_score || 0,
          attempts: p.attempts,
          completed: p.completed
        }));
        setProgress(formattedProgress);
      }

      // Cargar glosario
      const { data: glossaryData } = await supabase
        .from('glossary_entries')
        .select('*')
        .eq('student_id', student.id)
        .order('week_introduced', { ascending: true });

      if (glossaryData) {
        // Convertir a formato antiguo para compatibilidad
        const formattedGlossary = glossaryData.map((g: any) => ({
          word: g.word,
          meaning: g.meaning,
          example: g.example,
          context: g.context,
          mastered: g.mastered,
          reviewCount: g.review_count,
          correctCount: g.correct_count,
          wrongCount: g.wrong_count,
          weekIntroduced: g.week_introduced,
          srsLevel: g.srs_level ?? 0,
          nextReviewAt: g.next_review_at ?? null
        }));
        setGlossary(formattedGlossary);
      }

    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Resultado del guardado de una evaluación. La nota autoritativa es la que
  // calcula el servidor (Edge Function); el navegador solo la muestra.
  // Un guardado fallido silencioso ya costó 2 meses de datos (RLS, jul 2026).
  const updateProgress = async (
    week: number,
    score: number,
    answers?: { question: string; answer: string }[]
  ): Promise<{ ok: boolean; score: number; verificationCode: string | null }> => {
    if (!student?.id) return { ok: false, score, verificationCode: null };

    const applyLocal = (finalScore: number, bestScore: number, attempts: number, completed: boolean) => {
      setProgress(prev => {
        const filtered = prev.filter(p => p.week !== week);
        return [...filtered, { week, lastScore: finalScore, bestScore, attempts, completed }]
          .sort((a, b) => a.week - b.week);
      });
    };

    // 1) Vía preferida: la Edge Function califica en el servidor y guarda
    //    con la clave secreta — el navegador no puede inventarse la nota.
    if (answers && answers.length > 0) {
      try {
        const { data, error } = await supabase.functions.invoke('submit-evaluation', {
          body: { studentId: student.id, week, answers }
        });
        if (!error && data && typeof data.score === 'number') {
          applyLocal(data.score, data.bestScore ?? data.score, data.attempts ?? 1, !!data.completed);
          return { ok: true, score: data.score, verificationCode: data.verificationCode ?? null };
        }
        console.warn('Edge function no disponible, usando guardado directo:', error?.message || data?.error);
      } catch (err) {
        console.warn('Edge function falló, usando guardado directo:', err);
      }
    }

    // 2) Respaldo: escritura directa (funciona mientras las políticas de
    //    escritura de weekly_progress sigan abiertas; ver supabase-verificacion.sql)
    const existing = progress.find(p => p.week === week);
    const newData = {
      student_id: student.id,
      week_number: week,
      last_score: score,
      best_score: existing ? Math.max(existing.bestScore || 0, score) : score,
      attempts: (existing?.attempts || 0) + 1,
      completed: score >= 70 || existing?.completed || false,
      completed_at: score >= 70 ? new Date().toISOString() : existing?.completed_at,
      updated_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('weekly_progress')
        .upsert(newData, { onConflict: 'student_id,week_number' })
        .select()
        .single();

      if (error) {
        console.error('Error guardando progreso:', error);
        return { ok: false, score, verificationCode: null };
      }

      applyLocal(score, newData.best_score, newData.attempts, newData.completed);

      // Registrar actividad (best-effort: no invalida el guardado de la nota)
      await supabase.from('activity_log').insert({
        student_id: student.id,
        action_type: 'evaluation_completed',
        week_number: week,
        metadata: { score, completed: score >= 70 }
      });

      return { ok: true, score, verificationCode: data?.verification_code ?? null };
    } catch (err) {
      console.error('Error en updateProgress:', err);
      return { ok: false, score, verificationCode: null };
    }
  };

  const addToGlossary = async (weekNumber: number) => {
    if (!student?.id) return;

    const weekData = weeks.find(w => w.week === weekNumber);
    if (!weekData) return;

    const newEntries = weekData.vocabulary.map(v => ({
      student_id: student.id,
      word: v.word,
      meaning: v.meaning,
      example: v.example,
      context: v.context,
      mastered: false,
      review_count: 0,
      correct_count: 0,
      wrong_count: 0,
      week_introduced: weekNumber
    }));

    try {
      const { data, error } = await supabase
        .from('glossary_entries')
        .upsert(newEntries, { onConflict: 'student_id,word', ignoreDuplicates: true })
        .select();

      if (!error && data) {
        // Actualizar estado local
        const formattedNew = data.map((g: any) => ({
          word: g.word,
          meaning: g.meaning,
          example: g.example,
          context: g.context,
          mastered: g.mastered,
          reviewCount: g.review_count,
          correctCount: g.correct_count,
          wrongCount: g.wrong_count,
          weekIntroduced: g.week_introduced,
          srsLevel: g.srs_level ?? 0,
          nextReviewAt: g.next_review_at ?? null
        }));

        setGlossary(prev => {
          const existing = prev.filter(e => 
            !formattedNew.some((n: any) => n.word === e.word)
          );
          return [...existing, ...formattedNew];
        });
      }
    } catch (err) {
      console.error('Error en addToGlossary:', err);
    }
  };

  const markWordCorrect = async (word: string) => {
    if (!student?.id) return;

    const entry = glossary.find(e => e.word === word);
    if (!entry) return;

    const newCorrectCount = entry.correctCount + 1;
    // SRS: cada acierto sube de nivel y aleja el próximo repaso (1d → 3d → 7d → 21d).
    // "Dominada" = sobrevivió al menos 3 repasos, y aun así sigue en rotación.
    const newLevel = (entry.srsLevel ?? 0) + 1;
    const newNextReview = nextReviewDate(newLevel);

    try {
      const { data } = await supabase
        .from('glossary_entries')
        .update({
          correct_count: newCorrectCount,
          review_count: entry.reviewCount + 1,
          srs_level: newLevel,
          next_review_at: newNextReview,
          mastered: newLevel >= 3,
          last_reviewed_at: new Date().toISOString()
        })
        .eq('student_id', student.id)
        .eq('word', word)
        .select()
        .single();

      if (data) {
        setGlossary(prev =>
          prev.map(e => e.word === word ? {
            ...e,
            correctCount: newCorrectCount,
            reviewCount: e.reviewCount + 1,
            srsLevel: newLevel,
            nextReviewAt: newNextReview,
            mastered: newLevel >= 3
          } : e)
        );
      }
    } catch (err) {
      console.error('Error en markWordCorrect:', err);
    }
  };

  const markWordIncorrect = async (word: string) => {
    if (!student?.id) return;

    const entry = glossary.find(e => e.word === word);
    if (!entry) return;

    // SRS: fallar reinicia el nivel y quita el estado "dominada" — la palabra
    // vuelve a la cola de repaso de hoy. Honestidad ante todo.
    const failedReview = new Date().toISOString();

    try {
      const { data } = await supabase
        .from('glossary_entries')
        .update({
          wrong_count: entry.wrongCount + 1,
          review_count: entry.reviewCount + 1,
          srs_level: 0,
          next_review_at: failedReview,
          mastered: false,
          last_reviewed_at: failedReview
        })
        .eq('student_id', student.id)
        .eq('word', word)
        .select()
        .single();

      if (data) {
        setGlossary(prev =>
          prev.map(e => e.word === word ? {
            ...e,
            wrongCount: e.wrongCount + 1,
            reviewCount: e.reviewCount + 1,
            srsLevel: 0,
            nextReviewAt: failedReview,
            mastered: false
          } : e)
        );
      }
    } catch (err) {
      console.error('Error en markWordIncorrect:', err);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setStudent(null);
    setProgress([]);
    setGlossary([]);
    localStorage.removeItem('student');
  };

  return {
    student,
    setStudent,
    progress,
    updateProgress,
    glossary,
    addToGlossary,
    markWordCorrect,
    markWordIncorrect,
    logout,
    loading
  };
};
