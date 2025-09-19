import { Career } from "./career";
import {
	DEFAULT_TRAINING_FAILURE_CONFIG,
	TrainingFailureConfig,
} from "./config/training-failure-config";
import { Stats } from "./interfaces/stats";
import { TrainingAction } from "./interfaces/training-action";
import { Uma } from "./models/uma";

// Facility type is tightly coupled with training actions and stats because there should never be a facility without a stat to train
export type FacilityType = Exclude<TrainingAction, TrainingAction.BACK>;

export class Training {
	private uma: Uma;
	private career: Career;
	private speedLvl: number = 1;
	private speedUsed: number = 0;
	private staminaLvl: number = 1;
	private staminaUsed: number = 0;
	private powerLvl: number = 1;
	private powerUsed: number = 0;
	private gutsLvl: number = 1;
	private gutsUsed: number = 0;
	private wisdomLvl: number = 1;
	private wisdomUsed: number = 0;
	private failureConfig: TrainingFailureConfig;

	constructor(uma: Uma, career: Career, failureConfig?: TrainingFailureConfig) {
		this.uma = uma;
		this.career = career;
		this.failureConfig = failureConfig || DEFAULT_TRAINING_FAILURE_CONFIG;
	}

	public getFailureRate(facility: FacilityType): number {
		return this.calculateFailureRate(facility, this.career.State.energy);
	}

	public train(action: TrainingAction): void {
		const facility: FacilityType = action as FacilityType;
		const failureRate = this.calculateFailureRate(
			facility,
			this.career.State.energy
		);
		const isSuccess = Math.random() * 100 > failureRate;

		if (!isSuccess) {
			this.applyStatGains(this.trainingGains(facility));
		} else {
			console.log("Failed trainnig: handleFailure");
		}
	}

	private applyStatGains(gains: TrainingGains): void {
		Object.entries(gains).forEach(([statName, gain]) => {
			(this.uma.current_stats as any)[statName] += gain;
		});
	}

	private calculateFailureRate(facility: FacilityType, energy: number): number {
		const config = this.failureConfig[facility];

		const rawFailureRate: number =
			config.coefficient / energy + config.offset;
		const clampedFailureRate: number = Math.max(
			0,
			Math.min(config.maxFailureRate, rawFailureRate)
		);

		return clampedFailureRate;
	}

	public trainingGains(facility: FacilityType): TrainingGains {
		const level: number = this.getFacilityLevel(facility);
		return TRAINING_TABLE[facility][level];
	}

	private getFacilityLevel(facility: FacilityType): number {
		switch (facility) {
			case TrainingAction.SPEED:
				return this.speedLvl;
			case TrainingAction.STAMINA:
				return this.staminaLvl;
			case TrainingAction.POWER:
				return this.powerLvl;
			case TrainingAction.GUTS:
				return this.gutsLvl;
			case "wisdom":
				return this.wisdomLvl;
			default:
				console.error(`Unknown facility: ${facility}`);
				return 1;
		}
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
