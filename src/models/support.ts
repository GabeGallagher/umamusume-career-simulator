import { EffectType } from "../enums/effect-types";
import * as EffectTypes from "../enums/effect-types";
import { SupportInterface } from "../interfaces/support";

export interface Unique {
	level: number;
	effects: Effect[];
}

export interface Effect {
	type: EffectType;
	value: number;
}

export class Support implements SupportInterface {
	id: number;
	level: number;
	effects: Map<EffectType, number>;
	unique?: any;
	friendShipGauge: number;

	constructor(rawData: any, level: number) {
		const eventData: any = rawData.eventData;
		const itemData: any = rawData.itemData;
		this.id = this.requireField(itemData, "support_id");
		this.level = level;
		this.effects = this.crunchEffects(this.requireField(itemData, "effects"), itemData.unique);
		this.friendShipGauge = this.effects.get(EffectType.InitialFriendshipGauge) || 0;
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
				if (crunchedEffects.has(effect.type)) {
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
}
