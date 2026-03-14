import { WeekData } from '../types';

export const courseScheduleService = {
  /**
   * Checks if a week is currently available for students.
   */
  isWeekAvailable: (week: WeekData): { available: boolean; status: 'active' | 'upcoming' | 'expired' } => {
    if (week.active === false) {
      return { available: false, status: 'upcoming' };
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (week.availableFrom) {
      const fromDate = new Date(week.availableFrom);
      fromDate.setHours(0, 0, 0, 0);
      if (now < fromDate) {
        return { available: false, status: 'upcoming' };
      }
    }

    if (week.availableUntil) {
      const untilDate = new Date(week.availableUntil);
      untilDate.setHours(23, 59, 59, 999);
      if (now > untilDate) {
        return { available: false, status: 'expired' };
      }
    }

    return { available: true, status: 'active' };
  },

  /**
   * Returns a user-friendly message based on the week's availability status.
   */
  getStatusMessage: (status: 'active' | 'upcoming' | 'expired'): string | null => {
    switch (status) {
      case 'upcoming':
        return 'Disponible próximamente';
      case 'expired':
        return 'Periodo finalizado';
      default:
        return null;
    }
  }
};
