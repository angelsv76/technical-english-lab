import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Student, WeeklyProgress, GlossaryEntry } from '../lib/supabase';
import { weeks } from '../data/weeks/index';

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
        const formattedGlossary = glossaryData.map((g: GlossaryEntry) => ({
          word: g.word,
          meaning: g.meaning,
          example: g.example,
          context: g.context,
          mastered: g.mastered,
          reviewCount: g.review_count,
          correctCount: g.correct_count,
          wrongCount: g.wrong_count,
          weekIntroduced: g.week_introduced
        }));
        setGlossary(formattedGlossary);
      }

    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (week: number, score: number) => {
    if (!student?.id) return;

    const existing = progress.find(p => p.week === week);
    const newData = {
      student_id: student.id,
      week_number: week,
      last_score: score,
      best_score: existing ? Math.max(existing.bestScore || 0, score) : score,
      attempts: (existing?.attempts || 0) + 1,
      completed: score >= 70,
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
        return;
      }

      // Actualizar estado local
      setProgress(prev => {
        const filtered = prev.filter(p => p.week !== week);
        const newProgress = {
          week: week,
          lastScore: score,
          bestScore: newData.best_score,
          attempts: newData.attempts,
          completed: newData.completed
        };
        return [...filtered, newProgress].sort((a, b) => a.week - b.week);
      });

      // Registrar actividad
      await supabase.from('activity_log').insert({
        student_id: student.id,
        action_type: 'evaluation_completed',
        week_number: week,
        metadata: { score, completed: score >= 70 }
      });

    } catch (err) {
      console.error('Error en updateProgress:', err);
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
        const formattedNew = data.map((g: GlossaryEntry) => ({
          word: g.word,
          meaning: g.meaning,
          example: g.example,
          context: g.context,
          mastered: g.mastered,
          reviewCount: g.review_count,
          correctCount: g.correct_count,
          wrongCount: g.wrong_count,
          weekIntroduced: g.week_introduced
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

    try {
      const { data } = await
