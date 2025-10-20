import { SkillActivationCondition } from "../enums/skill-activation-condition";

export interface Skill {
    id: number;
    name: string;
    activationCondition: SkillActivationCondition;
    cost: number;
    
}