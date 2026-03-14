import { useState, useEffect } from 'react';
import { Student, WeekProgress, VocabularyEntry } from '../types';
import { weeks } from '../data/weeks/index';

export const useAppState = () => {
  const [student, setStudent] = useState<Student | null>(() => {
    const saved = localStorage.getItem('student');
    return saved ? JSON.parse(saved) : null;
  });

  const [progress, setProgress] = useState<WeekProgress[]>(() => {
    const saved = localStorage.getItem('progress');
    return saved ? JSON.parse(saved) : [];
  });

  const [glossary, setGlossary] = useState<VocabularyEntry[]>(() => {
    const saved = localStorage.getItem('glossary');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('student', JSON.stringify(student));
  }, [student]);

  useEffect(() => {
    localStorage.setItem('progress', JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem('glossary', JSON.stringify(glossary));
  }, [glossary]);

  const updateProgress = (week: number, score: number) => {
    setProgress(prev => {
      const existing = prev.find(p => p.week === week);
      if (existing) {
        return prev.map(p => p.week === week ? {
          ...p,
          lastScore: score,
          bestScore: Math.max(p.bestScore, score),
          attempts: p.attempts + 1,
          completed: p.completed || score >= 70
        } : p);
      }
      return [...prev, {
        week,
        lastScore: score,
        bestScore: score,
        attempts: 1,
        completed: score >= 70
      }];
    });
  };

  const addToGlossary = (weekNumber: number) => {
    const weekData = weeks.find(w => w.week === weekNumber);
    if (!weekData) return;

    setGlossary(prev => {
      const newEntries = weekData.vocabulary
        .filter(v => !prev.some(p => p.word === v.word))
        .map(v => ({
          ...v,
          mastered: false,
          reviewCount: 0,
          correctCount: 0,
          wrongCount: 0,
          weekIntroduced: weekNumber
        }));
      return [...prev, ...newEntries];
    });
  };

  const markWordCorrect = (word: string) => {
    setGlossary(prev => prev.map(entry => {
      if (entry.word === word) {
        const newCorrectCount = entry.correctCount + 1;
        return {
          ...entry,
          correctCount: newCorrectCount,
          reviewCount: entry.reviewCount + 1,
          mastered: newCorrectCount >= 3
        };
      }
      return entry;
    }));
  };

  const markWordIncorrect = (word: string) => {
    setGlossary(prev => prev.map(entry => {
      if (entry.word === word) {
        return {
          ...entry,
          wrongCount: entry.wrongCount + 1,
          reviewCount: entry.reviewCount + 1
        };
      }
      return entry;
    }));
  };

  const logout = () => {
    setStudent(null);
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
    logout
  };
};
