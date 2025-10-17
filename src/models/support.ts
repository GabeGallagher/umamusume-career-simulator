import { EffectType } from "../enums/effect-types";
import * as EffectTypes from "../enums/effect-types";
import { TrainingType } from "../enums/training-types";
import { SupportInterface } from "../interfaces/support";

export interface Unique {
	level: number;
	effects: Effect[];
}

export interface Effect {
	type: EffectType;
	value: number;
}

export interface TrainingAppearanceWeights {
	[TrainingType.SPEED]: number;
	[TrainingType.STAMINA]: number;
	[TrainingType.POWER]: number;
	[TrainingType.GUTS]: number;
	[TrainingType.WISDOM]: number;
	noAppearance: number;
}

export class Support implements SupportInterface {
	id: number;
	private name: string;
	private type: TrainingType;
	level: number;
	private effects: Map<EffectType, number>;
	private unique?: Unique;
	private friendShipGauge: number;
	private appearanceWeights: TrainingAppearanceWeights;

	constructor(rawData: any, level: number) {
		const eventData: any = rawData.eventData;
		const itemData: any = rawData.itemData;
		this.id = this.requireField(itemData, "support_id");
		this.name = this.requireField(itemData, "char_name");
		this.type = itemData.type;
		this.level = level;
		this.effects = this.crunchEffects(
			this.requireField(itemData, "effects"),
			itemData.unique
		);
		this.friendShipGauge = this.effects.get(EffectType.InitialFriendshipGauge) || 0;
		this.appearanceWeights = this.calculateAppearanceWeights();
	}

	get Name(): string {
		return this.name;
	}

	get Effects(): Map<EffectType, number> {
		return this.effects;
	}

	get FriendshipGauge(): number {
		return this.friendShipGauge;
	}

	public AddFriendship(newFriendship: number): void {
		const update: number = this.friendShipGauge + newFriendship;
		if (update > 100) this.friendShipGauge = 100;
	}

	private requireField(obj: any, path: string): any {
		const value = path.split(".").reduce((o, p) => o?.[p], obj);
		if (value === undefined) {
			throw new Error(`Required field missing: ${path} - schema may have changed`);
		}
		return value;
	}
	
	private addUnique(unique: Unique, crunchedEffects: Map<EffectType, number>) {
		if (unique.level <= this.level) {
			for (const effect of unique.effects) {
				// Unique Specialty Priority is handled differently than the rest. See
				// calculateAppearanceWeights
				if (
					effect.type !== EffectType.SpecialtyPriority &&
					crunchedEffects.has(effect.type)
				) {
					const currentValue = crunchedEffects.get(effect.type) || 0;
					const addedVal: number = effect.value + currentValue;
					crunchedEffects.set(effect.type, addedVal);
				} else {
					crunchedEffects.set(effect.type, effect.value);
				}
			}
		}
	}

	private crunchEffects(rawEffects: number[][], unique?: any): Map<EffectType, number> {
		let effectMap: Map<EffectType, number> = new Map<EffectType, number>();

		for (const effectArray of rawEffects) {
			const effectId: number = effectArray[0];
			const effectValue: number = this.getEffectValue(effectArray);
			effectMap.set(effectId as EffectType, effectValue);
		}
		this.addUnique(unique, effectMap);
		return effectMap;
	}

	private getEffectValue(effectGrowthArray: number[]): number {
		let milestones: number[][] = [];
		for (let i = 1; i < effectGrowthArray.length; i++) {
			const breakpointLevel: number = i === 1 ? 1 : (i - 1) * 5;
			if (effectGrowthArray[i] !== -1)
				milestones.push([breakpointLevel, effectGrowthArray[i]]);
		}

		if (this.level >= milestones[milestones.length - 1][0])
			return milestones[milestones.length - 1][1];
		else if (this.level >= milestones[0][0]) {
			for (let i = 0; i < milestones.length; i++) {
				const [lowerLevel, lowerValue] = milestones[i];
				const [upperLevel, upperValue] = milestones[i - 1];
				const progress = (this.level - lowerLevel) / (upperLevel - lowerLevel);
				const interpolatedValue =
					lowerValue + (upperValue - lowerValue) * progress;
				return Math.floor(interpolatedValue);
			}
		}
		return 0;
	}

	get TrainingAppearanceWeights(): TrainingAppearanceWeights {
		if (!this.appearanceWeights) {
			this.appearanceWeights = this.calculateAppearanceWeights();
		}
		return this.appearanceWeights;
	}

	private calculateAppearanceWeights(): TrainingAppearanceWeights {
		const weights: TrainingAppearanceWeights = {
			[TrainingType.SPEED]: 100,
			[TrainingType.STAMINA]: 100,
			[TrainingType.POWER]: 100,
			[TrainingType.GUTS]: 100,
			[TrainingType.WISDOM]: 100,
			noAppearance: 50,
		};

		const specialtyPriority: number =
			this.effects.get(EffectType.SpecialtyPriority) || 0;
		let specialtyPriorityModifiedWeight = weights[this.type] + specialtyPriority;

		// For whatever reason, specialty priority from a unique effect is multiplicative
		// even though specialty priority from a regular effect is additive. Below logic
		// handles that
		if (this.unique && this.level >= this.unique.level) {
			let uniqueSpecialtyPriority = 1;
			for (const effect of this.unique.effects) {
				if (effect.type === EffectType.SpecialtyPriority)
					uniqueSpecialtyPriority += effect.value / 100;
			}
			specialtyPriorityModifiedWeight * uniqueSpecialtyPriority;
		}

		weights[this.type] = specialtyPriorityModifiedWeight;
		return weights;
	}

	get TrainingWeightSum(): number {
		let sum: number = 0;

		if (!this.appearanceWeights) {
			this.appearanceWeights = this.calculateAppearanceWeights();
		}

		for (const weight of Object.values(this.appearanceWeights)) {
			sum += weight;
		}
		return sum;
	}
}
