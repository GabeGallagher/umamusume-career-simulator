import { Mood } from "../enums/mood";
import { Rarity } from "../enums/rarity";
import { AptitudeGrade, Aptitudes } from "../interfaces/aptitudes";
import { StatBonuses } from "../interfaces/stat-bonuses";
import { Stats } from "../interfaces/stats";
import { UmaInterface } from "../interfaces/uma";
import { ConditionsMap } from "../interfaces/conditions";
import { Condition } from "../enums/condition";

export class Uma implements UmaInterface {
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
	current_stats: Stats;
	conditions: ConditionsMap;
	aptitude: Aptitudes;
	two_star_stats?: Stats;
	three_star_stats?: Stats;
	four_star_stats: Stats;
	five_star_stats: Stats;

	constructor(rawData: any) {
		this.id = this.requireField(rawData, "card_id");
		this.name = this.requireField(rawData, "name_en");
		this.rarity = this.requireField(rawData, "rarity");
		this.skills_unique = this.requireField(rawData, "skills_unique");
		this.skills_innate = this.requireField(rawData, "skills_innate");
		this.skills_awakening = this.requireField(rawData, "skills_awakening");
		this.skills_event = this.requireField(rawData, "skills_event");
		this.skills_event_en = this.requireField(rawData, "skills_event_en");
		this.stat_bonus = this.requireField(rawData, "stat_bonus");
		this.talent_group = this.requireField(rawData, "talent_group");
		this.base_stats = this.requireField(rawData, "base_stats");
		this.current_stats = this.setStats(this.base_stats);
		this.conditions = this.initConditions();

		const rawAptitude = this.requireField(rawData, "aptitude");
		this.aptitude = this.setAptitudes(rawAptitude);

		if (rawData.two_star_stats) {
			this.two_star_stats = this.setStats(rawData.two_star_stats);
		}

		if (rawData.three_star_stats) {
			this.three_star_stats = this.setStats(rawData.three_star_stats);
		}

		const rawFourStarStats = this.requireField(rawData, "four_star_stats");
		this.four_star_stats = this.setStats(rawFourStarStats);

		const rawFiveStarStats = this.requireField(rawData, "five_star_stats");
		this.five_star_stats = this.setStats(rawFiveStarStats);
	}

	private initConditions(): ConditionsMap {
		const conditions: ConditionsMap = {} as ConditionsMap;

		Object.values(Condition).forEach((condition) => {
			conditions[condition] = false;
		});
		return conditions;
	}

	private requireField(obj: any, path: string): any {
		const value = path.split(".").reduce((o, p) => o?.[p], obj);
		if (value === undefined) {
			throw new Error(
				`Required field missing: ${path} - schema may have changed`
			);
		}
		return value;
	}

    public hasCondition(condition: Condition): boolean {
        return this.conditions[condition];
    }

    public addCondition(condition: Condition): void {
        this.conditions[condition] = true;
        if (condition === Condition.PRACTICE_PERFECT)
            this.removeCondition(Condition.PRACTICE_POOR);

        if (condition === Condition.PRACTICE_POOR)
            this.removeCondition(Condition.PRACTICE_PERFECT);
    }

    public removeCondition(condition: Condition): void {
        this.conditions[condition] = false;
    }

	private setAptitudes(aptArray: string[]): Aptitudes {
		return {
			surface: {
				turf: aptArray[0] as AptitudeGrade,
				dirt: aptArray[1] as AptitudeGrade,
			},
			distance: {
				sprint: aptArray[2] as AptitudeGrade,
				mile: aptArray[3] as AptitudeGrade,
				medium: aptArray[4] as AptitudeGrade,
				long: aptArray[5] as AptitudeGrade,
			},
			strategy: {
				frontRunner: aptArray[6] as AptitudeGrade,
				paceChaser: aptArray[7] as AptitudeGrade,
				lateSurger: aptArray[8] as AptitudeGrade,
				endCloser: aptArray[9] as AptitudeGrade,
			},
		};
	}

	private setStats(rawStats: any): Stats {
		return {
			speed: rawStats[0],
			stamina: rawStats[1],
			power: rawStats[2],
			guts: rawStats[3],
			wisdom: rawStats[4],
		};
	}
}
