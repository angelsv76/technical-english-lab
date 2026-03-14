import { Simulation } from '../../types';
import { simulation01, simulation02, simulation03, simulation04, simulation05, simulation06, simulation07, simulation08, simulation09, simulation10 } from './sims01-10';
import { simulation11, simulation12, simulation13, simulation14, simulation15, simulation16, simulation17, simulation18, simulation19, simulation20 } from './sims11-20';
import { simulation21, simulation22, simulation23, simulation24, simulation25, simulation26, simulation27, simulation28, simulation29, simulation30 } from './sims21-30';
import { simulation31, simulation32, simulation33, simulation34, simulation35, simulation36, simulation37, simulation38, simulation39, simulation40 } from './sims31-40';
import { sims41_60 } from './sims41-60';
import { sims61_80 } from './sims61-80';
import { sims81_100 } from './sims81-100';
import { sims101_120 } from './sims101-120';

// This file will export all simulations
export const simulations: Simulation[] = [
  simulation01, simulation02, simulation03, simulation04, simulation05, simulation06, simulation07, simulation08, simulation09, simulation10,
  simulation11, simulation12, simulation13, simulation14, simulation15, simulation16, simulation17, simulation18, simulation19, simulation20,
  simulation21, simulation22, simulation23, simulation24, simulation25, simulation26, simulation27, simulation28, simulation29, simulation30,
  simulation31, simulation32, simulation33, simulation34, simulation35, simulation36, simulation37, simulation38, simulation39, simulation40,
  ...sims41_60,
  ...sims61_80,
  ...sims81_100,
  ...sims101_120
];

// Helper to get simulation by ID
export const getSimulationById = (id: string): Simulation | undefined => {
  return simulations.find(s => s.simulationId === id);
};
