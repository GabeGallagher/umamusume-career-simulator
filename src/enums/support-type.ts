import { TrainingType } from "./training-types";

export const SupportType = {
    ...TrainingType,
    FRIEND: "friend" as const,
} as const;

export type SupportType = typeof SupportType[keyof typeof SupportType];

// Utility types
export type TrainingSupportType = TrainingType;
export type NonTrainingSupportType = Exclude<SupportType, TrainingType>;
