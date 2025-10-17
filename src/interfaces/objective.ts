import { RaceInterface } from "./race";

export interface ObjectiveInterface {
    Order: number;
    Turn: number;
    ConditionType: number;
    ConditionId: number;
    ConditionVal: number;
    ConditionVal2: number;
    RaceType: number;
    TargetType: number;
    RaceChoice: number;
    RaceChoiceDetails: number;
    Races?: RaceInterface[];
}