/**
 * Service to manage course configuration persistence.
 */
export const courseConfigService = {
  getConfigs: () => {
    const saved = localStorage.getItem('courseConfig');
    return saved ? JSON.parse(saved) : {};
  },

  saveConfig: (weekNumber: number, config: { active: boolean }) => {
    const configs = courseConfigService.getConfigs();
    configs[`week${weekNumber.toString().padStart(2, '0')}`] = config;
    localStorage.setItem('courseConfig', JSON.stringify(configs));
  },

  getWeekConfig: (weekNumber: number) => {
    const configs = courseConfigService.getConfigs();
    return configs[`week${weekNumber.toString().padStart(2, '0')}`] || { active: true };
  }
};
