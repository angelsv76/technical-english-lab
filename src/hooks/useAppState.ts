import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Student, WeeklyProgress, GlossaryEntry } from '../lib/supabase';
import { weeks } from '../data/weeks/index';
import { nextReviewDate } from '../utils/srs';

export const useAppState = () => {
  const [student, setStudent] = useState<any | null>(null);
  const [progress, setProgress] = useState<any[]>([]);
  const [glossary, setGlossary] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Restaurar solo una sesión verificada, nunca un id editable en localStorage.
  useEffect(() => {
    let active = true;
    localStorage.removeItem('student');
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!active || !user?.email?.endsWith('@inti.edu.sv')) return;
      const nie = user.email.slice(0, -'@inti.edu.sv'.length);
      const { data } = await supabase.from('students')
        .select('id, nie, name, group_code, photo_url, active').eq('nie', nie).eq('active', true).maybeSingle();
      if (active && data) setStudent({ id: data.id, nie: data.nie, name: data.name, code: data.group_code, photo_url: data.photo_url });
    }).catch(error => console.error('Error restaurando sesión:', error))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (student) {
      loadStudentData();
    } else {
      setProgress([]);
      setGlossary([]);
    }
  }, [student?.id]);

  // Heartbeat — actualizar last_seen cada 60 segundos mientras el alumno está activo
  useEffect(() => {
    if (!student?.id) return;

    const updateLastSeen = async () => {
      const { data, error } = await supabase.rpc('touch_student', { p_event: 'seen' });
      if (!error && data === false) {
        await supabase.auth.signOut();
        setStudent(null);
      }
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

    if (!answers?.length) return { ok: false, score, verificationCode: null };
    try {
      const { data, error } = await supabase
        .functions.invoke('submit-evaluation', {
          body: { studentId: student.id, week, answers }
        });
      if (error || !data || typeof data.score !== 'number') {
        console.error('Error guardando progreso:', error || data?.error);
        return { ok: false, score, verificationCode: null };
      }
      applyLocal(data.score, data.bestScore ?? data.score, data.attempts ?? 1, !!data.completed);
      return { ok: true, score: data.score, verificationCode: data.verificationCode ?? null };
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
