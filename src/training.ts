import { Career } from "./career";
import {
	DEFAULT_TRAINING_FAILURE_CONFIG,
	TrainingFailureConfig,
} from "./config/training-failure-config";
import { Stats } from "./interfaces/stats";
import { TrainingType } from "./enums/training-types";
import { Uma } from "./models/uma";
import { Condition } from "./enums/condition";
import { Support } from "./models/support";
import { EffectType } from "./enums/effect-types";
import { Mood } from "./enums/mood";

// Facility type is tightly coupled with training actions and stats because there should never be a facility without a stat to train
export type FacilityType = TrainingType;

export interface Facility {
	level: number;
	usageCount: number;
	energyCost: number;
	supports: Support[];
}

interface SupportBonuses {
	statBonus: number;
	moodEffect: number;
	trainingBonus: number;
	friendshipBonus: number;
}

export class Training {
	private uma: Uma;
	private career: Career;
	private failureConfig: TrainingFailureConfig;

	private facilities: Record<TrainingType, Facility> = {
		[TrainingType.SPEED]: { level: 1, usageCount: 0, energyCost: -21, supports: [] },
		[TrainingType.STAMINA]: {
			level: 1,
			usageCount: 0,
			energyCost: -19,
			supports: [],
		},
		[TrainingType.POWER]: { level: 1, usageCount: 0, energyCost: -20, supports: [] },
		[TrainingType.GUTS]: { level: 1, usageCount: 0, energyCost: -22, supports: [] },
		[TrainingType.WISDOM]: { level: 1, usageCount: 0, energyCost: 5, supports: [] },
	};

	private readonly trainingToStatBonusMap: Record<TrainingType, EffectType> = {
		[TrainingType.SPEED]: EffectType.SpeedBonus,
		[TrainingType.STAMINA]: EffectType.StaminaBonus,
		[TrainingType.POWER]: EffectType.PowerBonus,
		[TrainingType.GUTS]: EffectType.GutsBonus,
		[TrainingType.WISDOM]: EffectType.WitBonus,
	};

	constructor(uma: Uma, career: Career, failureConfig?: TrainingFailureConfig) {
		this.uma = uma;
		this.career = career;
		this.failureConfig = failureConfig || DEFAULT_TRAINING_FAILURE_CONFIG;
	}

	public placeSupports(supports: Support[]): void {
		for (const support of supports) {
			const placementFacility: TrainingType | null =
				this.getRandomTrainingAppearance(support);

			if (placementFacility !== null) {
				this.facilities[placementFacility].supports.push(support);
			}
		}
	}

	private getRandomTrainingAppearance(support: Support): TrainingType | null {
		const random = Math.random() * support.TrainingWeightSum;
		let currentWeight = 0;

		for (const trainingType of Object.values(TrainingType)) {
			currentWeight += support.TrainingAppearanceWeights[trainingType];
			if (random <= currentWeight) return trainingType;
		}

		return null;
	}

	public getFailureRate(facility: FacilityType): number {
		return this.calculateFailureRate(facility, this.career.State.energy);
	}

	public train(action: TrainingType): void {
		const facility: FacilityType = action as FacilityType;
		const failureRate = this.calculateFailureRate(facility, this.career.State.energy);
		const isSuccess = Math.random() * 100 > failureRate;

		if (isSuccess) {
			this.applyStatGains(this.trainingGains(facility));
			let energyCost = this.getEnergyCost(facility);
			// TODO: if uma has support that modifies energy for this specific training, modify here
			this.updateFacilityUsage(facility);
			this.career.addEnergy(energyCost);
		} else {
			console.log("Failed trainnig: handleFailure");
			this.handleTrainingFailure(failureRate, action);
		}
	}

	/**
	 * Method assumes player will always select top option when failing a training.
	 * The bottom option offers a small chance to improve the situation with a large
	 * rate of failure and making it worse. Failures from the "Failed trainings that
	 * consume energy" section in the global reference doc
	 * @param failureRate
	 */
	private handleTrainingFailure(failureRate: number, training: TrainingType): void {
		if (failureRate < 20) {
			this.rollNormalTrainingOutcome(training);
		} else if (failureRate >= 80) {
			this.rollWorstTrainingOutcome(training);
		} else {
			const roll: number = Math.random() * 100;
			if (roll > 30) this.rollNormalTrainingOutcome(training);
			else this.rollWorstTrainingOutcome(training);
		}
	}

	private rollNormalTrainingOutcome(training: TrainingType): void {
		const roll: number = Math.random() * 100;
		this.career.changeMood(-1);
		this.uma.current_stats[training] = Math.max(
			1,
			this.uma.current_stats[training] - 5
		);

		if (roll >= 92) {
			this.career.addCondition(Condition.PRACTICE_POOR);
			console.log("Acquired Practice Poor!");
		}
	}

	private rollWorstTrainingOutcome(training: TrainingType): void {
		const roll: number = Math.random() * 100;
		this.career.changeMood(-3);
		this.uma.current_stats[training] = Math.max(
			1,
			this.uma.current_stats[training] - 10
		);
		const statsToDrop: TrainingType[] = this.getRandomTrainingTypes(2);
		for (const stat of statsToDrop) {
			this.uma.current_stats[stat] = Math.max(
				1,
				this.uma.current_stats[training] - 10
			);
		}

		if (roll >= 50) {
			this.career.addCondition(Condition.PRACTICE_POOR);
			console.log("Acquired Practice Poor!");
		}
	}

	private getRandomTrainingTypes(count: number): TrainingType[] {
		const allTypes = Object.values(TrainingType);
		const shuffled = allTypes.sort(() => Math.random() - 0.5);
		return shuffled.slice(0, count);
	}

	private updateFacilityUsage(facility: FacilityType): void {
		if (!this.facilities[facility])
			throw new Error(`invalid training type: ${facility}`);

		this.facilities[facility].usageCount++;
		this.levelUpFacility(facility);
	}

	private levelUpFacility(facility: FacilityType): void {
		const facilityData = this.facilities[facility];
		if (facilityData.level < 5 && facilityData.usageCount === 4) {
			facilityData.level++;
			facilityData.usageCount = 0;
		}
	}

	// Energy values are pulled from 'Calculating Training Stat Gain' section of global reference doc
	private getEnergyCost(facility: FacilityType): number {
		if (!this.facilities[facility])
			throw new Error(`invalid training type: ${facility}`);

		return this.facilities[facility].energyCost;
	}

	private applyStatGains(gains: TrainingGains): void {
		Object.entries(gains).forEach(([statName, gain]) => {
			(this.uma.current_stats as any)[statName] += gain;
		});
	}

	private calculateFailureRate(facility: FacilityType, energy: number): number {
		const config = this.failureConfig[facility];

		return Math.max(0, Math.min(100, config.rawNumber - energy));
	}

	// NOTE: I am unsure if character growth bonuses are applied before or after support bonuses
	// will have to test, but for now it is possible we'll see results that differ from what's
	// in game
	public trainingGains(facility: FacilityType): TrainingGains {
		const level: number = this.getFacilityLevel(facility);
		let gains: TrainingGains = TRAINING_TABLE[facility][level];
		let supports: Support[] = this.facilities[facility].supports;

		for (let statName of Object.keys(gains)) {
			const trainingType: TrainingType = statName as TrainingType;
			const supportBonuses: SupportBonuses = this.getTotalStatBonus(
				supports,
				trainingType
			);
			const newGain: number =
				this.calculateGain(gains[statName], supportBonuses) *
				(1 + 0.05 * supports.length);
			gains[statName] = Math.floor(this.modifyGainsWithUmaGrowth(trainingType, newGain));
		}

		return gains;
	}

	private modifyGainsWithUmaGrowth(trainingType: TrainingType, value: number): number {
		return value * (1 + (this.uma.Growth(trainingType) / 100));
	}

	private calculateGain(gain: number, supportBonuses: SupportBonuses): number {
		return (
			(gain + supportBonuses.statBonus) *
			(1 + (this.moodMultiplier() * (1 + supportBonuses.moodEffect))) *
			(1 + supportBonuses.trainingBonus) * 
			supportBonuses.friendshipBonus
		);
	}

	private moodMultiplier(): number {
		switch (this.career.State.mood) {
			case Mood.Great:
				return 0.2;
			case Mood.Good:
				return 0.1;
			case Mood.Normal:
				return 0;
			case Mood.Bad:
				return -0.1;
			case Mood.Awful:
				return -0.2;
			default:
				throw new Error(`Unhandled Mood: ${this.career.State.mood}`);
		}
	}

	private getTotalStatBonus(
		supports: Support[],
		statName: FacilityType
	): SupportBonuses {
		let totalStatBonus = 0;
		let totalMoodEffect = 0;
		let totalTrainingBonus = 0;
		let totalFriendshipBonus = 1;

		for (const support of supports) {
			const statBonusEffectType = this.trainingToStatBonusMap[statName];
			totalStatBonus += support.Effects.get(statBonusEffectType) || 0;
			totalMoodEffect += support.Effects.get(EffectType.MoodEffect) || 0;
			totalTrainingBonus +=
				support.Effects.get(EffectType.TrainingEffectiveness) || 0;
			totalFriendshipBonus *= this.getFriendshipBonus(support);
		}

		return {
			statBonus: totalStatBonus,
			moodEffect: totalMoodEffect / 100,
			trainingBonus: totalTrainingBonus / 100,
			friendshipBonus: totalFriendshipBonus,
		};
	}

	private getFriendshipBonus(support: Support): number {
		let friendshipBonus = 100;
		if (support.FriendshipGauge >= 80)
			friendshipBonus += support.Effects.get(EffectType.FriendshipBonus) || 0;
		
		return friendshipBonus / 100;
	}

	private getFacilityLevel(facility: FacilityType): number {
		if (!this.facilities[facility])
			throw new Error(`invalid training type: ${facility}`);

		if (!this.facilities[facility].level)
			throw new Error(`facility level is unassigned or undefined: ${facility}`);

		return this.facilities[facility].level;
	}
}

export type StateType = keyof Stats;

export interface TrainingGains {
	[key: string]: number;
}

export type TrainingTable = {
	[facility in FacilityType]: {
		[level: number]: TrainingGains;
	};
};

export const TRAINING_TABLE: TrainingTable = {
	speed: {
		1: { speed: 10, power: 5 },
		2: { speed: 11, power: 5 },
		3: { speed: 12, power: 5 },
		4: { speed: 13, power: 6 },
		5: { speed: 14, power: 7 },
	},
	stamina: {
		1: { stamina: 9, guts: 5 },
		2: { stamina: 10, guts: 5 },
		3: { stamina: 11, guts: 5 },
		4: { stamina: 12, guts: 6 },
		5: { stamina: 13, guts: 7 },
	},
	power: {
		1: { power: 8, stamina: 5 },
		2: { power: 9, stamina: 5 },
		3: { power: 10, stamina: 5 },
		4: { power: 11, stamina: 6 },
		5: { power: 12, stamina: 7 },
	},
	guts: {
		1: { guts: 8, speed: 4, power: 4 },
		2: { guts: 9, speed: 4, power: 4 },
		3: { guts: 10, speed: 4, power: 4 },
		4: { guts: 11, speed: 5, power: 4 },
		5: { guts: 12, speed: 6, power: 5 },
	},
	wisdom: {
		1: { wisdom: 9, speed: 2 },
		2: { wisdom: 10, speed: 2 },
		3: { wisdom: 11, speed: 2 },
		4: { wisdom: 12, speed: 3 },
		5: { wisdom: 13, speed: 4 },
	},
};
