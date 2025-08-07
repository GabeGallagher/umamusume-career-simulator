import { Condition } from "../enums/condition";

export type ConditionsMap = {
    [key in Condition]: boolean;
};

export type PartialConditionsMap = Partial<ConditionsMap>;