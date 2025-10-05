import { Career } from "./career";
import {
	DEFAULT_TRAINING_FAILURE_CONFIG,
	TrainingFailureConfig,
} from "./config/training-failure-config";
import { Stats } from "./interfaces/stats";
import { TrainingType } from "./enums/training-types";
import { Uma } from "./models/uma";
import { Condition } from "./enums/condition";

// Facility type is tightly coupled with training actions and stats because there should never be a facility without a stat to train
export type FacilityType = TrainingType;

export class Training {
	private uma: Uma;
	private career: Career;
	private failureConfig: TrainingFailureConfig;

	private facilities = {
		[TrainingType.SPEED]: { level: 1, usageCount: 0, energyCost: -21 },
		[TrainingType.STAMINA]: { level: 1, usageCount: 0, energyCost: -19 },
		[TrainingType.POWER]: { level: 1, usageCount: 0, energyCost: -20 },
		[TrainingType.GUTS]: { level: 1, usageCount: 0, energyCost: -22 },
		[TrainingType.WISDOM]: { level: 1, usageCount: 0, energyCost: 5 },
	};

	constructor(uma: Uma, career: Career, failureConfig?: TrainingFailureConfig) {
		this.uma = uma;
		this.career = career;
		this.failureConfig = failureConfig || DEFAULT_TRAINING_FAILURE_CONFIG;
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

	public trainingGains(facility: FacilityType): TrainingGains {
		const level: number = this.getFacilityLevel(facility);
		return TRAINING_TABLE[facility][level];
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
