import { Stats } from './stats';

// This ensures TrainingType can only be Stats property names
export type TrainingType = keyof Stats;

export const TRAINING_TYPES: Record<string, TrainingType> = {
    SPEED: 'speed',
    STAMINA: 'stamina',
    POWER: 'power',
    GUTS: 'guts',
    WISDOM: 'wisdom'
} as const;

export interface TrainingOption {
    type: TrainingType;
    statGain: number;
    successRate: number;
    energyCost: number;
}