import { RaceInterface } from "../interfaces/race";

export class Race implements RaceInterface{
    private id: number;
    private name: string;
    private group: number;
    private grade: number;
    private track: number;
    private distance: number;
    private terrain: number;
    private fansNeeded: number;
    private fansGained: number;

    get Id(): number {
        return this.id;
    }
    get Name(): string {
        return this.name;
    }
    get Group(): number {
        return this.group;
    }
    get Grade(): number {
        return this.grade;
    }
    get Track(): number {
        return this.track;
    }
    get Distance(): number {
        return this.distance;
    }
    get Terrain(): number {
        return this.terrain;
    }
    get FansNeeded(): number {
        return this.fansNeeded;
    }
    get FansGained(): number {
        return this.fansGained;
    }

    constructor(rawData: any) {
        this.id = this.requireField(rawData, "id");
        this.name = this.requireField(rawData, "name_en");
        this.group = this.requireField(rawData, "group");
        this.grade = this.requireField(rawData, "grade");
        this.track = this.requireField(rawData, "track");
        this.distance = this.requireField(rawData, "distance");
        this.terrain = this.requireField(rawData, "terrain");
        this.fansNeeded = this.requireField(rawData, "fans_needed");
        this.fansGained = this.requireField(rawData, "fans_gained");
    }

	private requireField(obj: any, path: string): any {
		const value = path.split(".").reduce((o, p) => o?.[p], obj);
		if (value === undefined) {
			throw new Error(`Required field missing: ${path} - schema may have changed`);
		}
		return value;
	}
}