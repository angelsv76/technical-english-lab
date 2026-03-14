import { useState, useEffect } from 'react';
import { WeekData } from '../types';
import { weeks as defaultWeeks } from '../data/weeks/index';
import { courseConfigService } from '../services/courseConfigService';

export const useWeeks = () => {
  const [weeks, setWeeks] = useState<WeekData[]>(() => {
    const saved = localStorage.getItem('weeks_overrides');
    const configs = courseConfigService.getConfigs();
    
    let baseWeeks = defaultWeeks;
    if (saved) {
      const overrides = JSON.parse(saved);
      baseWeeks = defaultWeeks.map(dw => {
        const override = overrides.find((o: any) => o.week === dw.week);
        return override ? { ...dw, ...override } : dw;
      });
    }

    // Apply active state from courseConfig
    return baseWeeks.map(w => {
      const config = configs[`week${w.week.toString().padStart(2, '0')}`];
      return config ? { ...w, active: config.active } : { ...w, active: w.active ?? true };
    });
  });

  useEffect(() => {
    const overrides = weeks.map(({ week, title, objective, introText, vocabulary, simulation, practice, evaluation, active, availableFrom, availableUntil }) => ({
      week, title, objective, introText, vocabulary, simulation, practice, evaluation, active, availableFrom, availableUntil
    }));
    localStorage.setItem('weeks_overrides', JSON.stringify(overrides));
    
    // Also sync to courseConfig for Problem 1 requirements
    weeks.forEach(w => {
      courseConfigService.saveConfig(w.week, { active: !!w.active });
    });
  }, [weeks]);

  const updateWeek = (weekNumber: number, data: Partial<WeekData>) => {
    setWeeks(prev => prev.map(w => w.week === weekNumber ? { ...w, ...data } : w));
  };

  const toggleWeek = (weekNumber: number) => {
    setWeeks(prev => {
      const newWeeks = prev.map(w => w.week === weekNumber ? { ...w, active: !w.active } : w);
      const targetWeek = newWeeks.find(w => w.week === weekNumber);
      if (targetWeek) {
        courseConfigService.saveConfig(weekNumber, { active: !!targetWeek.active });
      }
      return newWeeks;
    });
  };

  return {
    weeks,
    updateWeek,
    toggleWeek
  };
};
