/**
 * values are based on below formulas. I refined these formulas by collecting
 * data during training, but I've learned that there is a bug with how failure
 * is calculated when max energy is increased, so I will need to recollect this
 * data and change these values
 * 
 * Speed = max(0, min(89, 1960/Energy - 18.5))
 * Stamina = max(0, min(86, 1860/Energy - 18))  
 * Power = max(0, min(85, 1890/Energy - 18))
 * Guts = max(0, min(89, 1980/Energy - 18.5))
 * Wit = max(0, min(41, 1320/Energy - 42))
 */
export interface TrainingFailureFormula {
    coefficient: number;
    offset: number;
    maxFailureRate: number;
}

export interface TrainingFailureConfig {
    [facility: string]: TrainingFailureFormula;
}

export const DEFAULT_TRAINING_FAILURE_CONFIG: TrainingFailureConfig = {
    speed: {
        coefficient: 1960,
        offset: -18.5,
        maxFailureRate: 89
    },
    stamina: {
        coefficient: 1860,
        offset: -18,
        maxFailureRate: 86
    },
    power: {
        coefficient: 1890,
        offset: -18,
        maxFailureRate: 85
    },
    guts: {
        coefficient: 1980,
        offset: -18.5,
        maxFailureRate: 89
    },
    wisdom: {
        coefficient: 1320,
        offset: -42,
        maxFailureRate: 41
    }
};