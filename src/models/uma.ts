import { Mood } from "../enums/mood";
import { Rarity } from "../enums/rarity";
import { AptitudeGrade, Aptitudes } from "../interfaces/aptitudes";
import { StatBonuses } from "../interfaces/stat-bonuses";
import { Stats } from "../interfaces/stats";
import { UmaInterface } from "../interfaces/uma";
import { Condition } from "../enums/condition";
import { TrainingType } from "../enums/training-types";
import { Support } from "./support";
import { EffectType } from "../enums/effect-types";

export class Uma {
	private _name: string;
	private _id: number;
	private _skills_unique: number[];
	private _skills_innate: number[];
	private _skills_awakening: number[];
	private _skills_event: number[];
	private _skills_event_en?: number[];
	private _stat_bonus: number[];
	private _talent_group: number;
	private _base_stats: Stats;
	private _current_stats: Stats;
	private _aptitude: Aptitudes;
	private haveSupportsModifiedStartingStats: boolean = false;

	get Name(): string {
		return this._name;
	}
	get Id(): number {
		return this._id;
	}
	get skills_unique(): number[] {
		return this._skills_unique;
	}
	get skills_innate(): number[] {
		return this._skills_innate;
	}
	get skills_awakening(): number[] {
		return this._skills_awakening;
	}
	get skills_event(): number[] {
		return this._skills_event;
	}
	get skills_event_en(): number[] | undefined {
		return this._skills_event_en;
	}
	get stat_bonus(): number[] {
		return this._stat_bonus;
	}
	get talent_group(): number {
		return this._talent_group;
	}
	get base_stats(): Stats {
		return this._base_stats;
	}
	get CurrentStats(): Stats {
		return this._current_stats;
	}
	get aptitude(): Aptitudes {
		return this._aptitude;
	}

	constructor(rawData: any, rarity?: Rarity) {
		this._name = this.requireField(rawData, "name_en");
		this._id = this.requireField(rawData, "card_id");
		this._skills_unique = this.requireField(rawData, "skills_unique");
		this._skills_innate = this.requireField(rawData, "skills_innate");
		this._skills_awakening = this.requireField(rawData, "skills_awakening");
		this._skills_event = this.requireField(rawData, "skills_event");
		this._skills_event_en = this.checkOptionalField(rawData, "skills_event_en");
		this._stat_bonus = this.requireField(rawData, "stat_bonus");
		this._talent_group = this.requireField(rawData, "talent_group");
		this._base_stats = this.requireField(rawData, "base_stats");
		this._current_stats = this.setCurrentStats(rawData, rarity);

		const rawAptitude = this.requireField(rawData, "aptitude");
		this._aptitude = this.setAptitudes(rawAptitude);
	}

	public StatBonus(stat: TrainingType): number {
		switch (stat) {
			case TrainingType.SPEED:
				return this._stat_bonus[0];
			case TrainingType.STAMINA:
				return this._stat_bonus[1];
			case TrainingType.POWER:
				return this._stat_bonus[2];
			case TrainingType.GUTS:
				return this._stat_bonus[3];
			case TrainingType.WISDOM:
				return this._stat_bonus[4];
			default:
				throw new Error(`Invalid growth stat type: ${stat}`);
		}
	}

	private checkOptionalField(obj: any, path: string): any {
		const val = path.split(".").reduce((o, p) => o?.[p], obj);
		if (val) this.requireField(obj, path);
	}

	private requireField(obj: any, path: string): any {
		const value = path.split(".").reduce((o, p) => o?.[p], obj);
		if (value === undefined) {
			throw new Error(`Required field missing: ${path} - schema may have changed`);
		}
		return value;
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

	private setCurrentStats(rawData: any, level?: Rarity): Stats {
		switch (level) {
			case Rarity.OneStar:
				return this.setStats(this._base_stats);
			case Rarity.TwoStar:
				if (rawData.two_star_stats) {
					return this.setStats(rawData.two_star_stats);
				} else {
					return this.setStats(this._base_stats);
				}
			case Rarity.ThreeStar:
				if (rawData.two_star_stats) {
					return this.setStats(rawData.three_star_stats);
				} else {
					return this.setStats(this._base_stats);
				}
			case Rarity.FourStar:
				return this.setStats(rawData.four_star_stats);
			case Rarity.FiveStar:
				return this.setStats(rawData.five_star_stats);
			default:
				return this.setStats(this._base_stats);
		}
	}

	public modifyStartingStatsWithSupports(supports: Support[]): void {
		if (!this.haveSupportsModifiedStartingStats) {
			for (const support of supports) {
				for (let statName of Object.keys(this._current_stats)) {
					const effectType = this.statToEffectMap[statName as keyof Stats];
					const bonusValue = support.Effects.get(effectType) || 0;
					(this._current_stats as any)[statName] += bonusValue;
				}
			}
		} else {
			console.log(
				"Uma's starting stats have already been modified by its supports. It cannot be modified in this way again"
			);
		}
		this.haveSupportsModifiedStartingStats = true;
	}

	private readonly statToEffectMap: Record<keyof Stats, EffectType> = {
		speed: EffectType.InitialSpeed,
		stamina: EffectType.InitialStamina,
		power: EffectType.InitialPower,
		guts: EffectType.InitialGuts,
		wisdom: EffectType.InitialWit,
	};
}
