import { ObjectiveInterface } from "../interfaces/objective";
import { RaceInterface } from "../interfaces/race";

export class Objective implements ObjectiveInterface {
	private order: number;
	private turn: number;
	private conditionType: number;
	private conditionId: number;
	private conditionVal: number;
	private conditionVal2: number;
	private raceType: number;
	private targetType: number;
	private raceChoice: number;
	private raceChoiceDetails: number;
	private races?: RaceInterface[];

	get Order(): number {
		return this.order;
	}
	get Turn(): number {
		return this.turn;
	}
	get ConditionType(): number {
		return this.conditionType;
	}
	get ConditionId(): number {
		return this.conditionId;
	}
	get ConditionVal(): number {
		return this.conditionVal;
	}
	get ConditionVal2(): number {
		return this.conditionVal2;
	}
	get RaceType(): number {
		return this.raceType;
	}
	get TargetType(): number {
		return this.targetType;
	}
	get RaceChoice(): number {
		return this.raceChoice;
	}
	get RaceChoiceDetails(): number {
		return this.raceChoiceDetails;
	}
	get Races(): RaceInterface[] | undefined {
		return this.races;
	}

	constructor(rawData: any) {
		this.order = this.requireField(rawData, "order");
		this.turn = this.requireField(rawData, "turn");
		this.conditionType = this.requireField(rawData, "cond_type");
		// TODO: Currently have only conditions 1 (Race) and 3 (Fan gain). The other condition types might behave differently
		if (this.conditionType !== 1 && this.conditionType !== 3) {
			throw new Error(`New condition type ${this.conditionType} found. Must handle`);
		}
		this.conditionId = this.requireField(rawData, "cond_id");
		this.conditionVal = this.requireField(rawData, "cond_value");
		this.conditionVal2 = this.requireField(rawData, "cond_value_2");
		this.raceType = this.requireField(rawData, "race_type");
		this.targetType = this.requireField(rawData, "target_type");
		this.raceChoice = this.requireField(rawData, "race_choice");
		this.raceChoiceDetails = this.requireField(rawData, "race_choice_details");
		this.races = this.setRaces(rawData);
	}

	private requireField(obj: any, path: string): any {
		const value = path.split(".").reduce((o, p) => o?.[p], obj);
		if (value === undefined) {
			throw new Error(`Required field missing: ${path} - schema may have changed`);
		}
		return value;
	}

	private setRaces(rawData: any): RaceInterface[] | undefined {
		const races: RaceInterface[] = [];
		const data = rawData.races;

		if (data === undefined) return;
		for (const rawRace of data) {
			const race: RaceInterface = {
				Id: this.requireField(rawRace, "id"),
				Name: this.requireField(rawRace, "name_en"),
				Group: this.requireField(rawRace, "group"),
				Grade: this.requireField(rawRace, "grade"),
				Track: this.requireField(rawRace, "track"),
				Distance: this.requireField(rawRace, "distance"),
				Terrain: this.requireField(rawRace, "terrain"),
				FansNeeded: this.requireField(rawRace, "fans_needed"),
				FansGained: this.requireField(rawRace, "fans_gained"),
			};
			races.push(race);
		}
		return races;
	}
}
