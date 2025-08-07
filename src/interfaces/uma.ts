import { Rarity } from "../enums/rarity";
import { Aptitudes } from "./aptitudes";
import { StatBonuses } from "./stat-bonuses";
import { Stats } from "./stats";


export interface UmaInterface {
    id: number;
    name: string;
    rarity: Rarity;
    skills_unique: number[];
    skills_innate: number[];
    skills_awakening: number[];
    skills_event: number[];
    skills_event_en: number[];
    stat_bonus: StatBonuses;
    talent_group: number;
    base_stats: Stats;
    aptitude: Aptitudes;
    two_star_stats?: Stats;
    three_star_stats?: Stats;
    four_star_stats: Stats;
    five_star_stats: Stats;
}