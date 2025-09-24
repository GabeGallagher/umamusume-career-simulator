/**
 * values are based on below formulas. I refined these formulas by collecting
 * data during training, but I've learned that there is a bug with how failure
 * is calculated when max energy is increased, so I will need to recollect this
 * data and change these values
 * 
 * Failure Rate = max(0, min(100, Raw Number - Energy))
 */
export interface TrainingFailureFormula {
    rawNumber: number
}

export interface TrainingFailureConfig {
    [facility: string]: TrainingFailureFormula;
}

export const DEFAULT_TRAINING_FAILURE_CONFIG: TrainingFailureConfig = {
    speed: {
        rawNumber: 55
    },
    stamina: {
        rawNumber: 53
    },
    power: {
        rawNumber: 54
    },
    guts: {
        rawNumber: 56
    },
    wisdom: {
        rawNumber: 42
    }
};