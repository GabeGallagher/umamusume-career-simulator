import { SupportInterface } from "../interfaces/support";

export class Support implements SupportInterface {
    id: number;
	level: number;
	friendShip: number;

    constructor(rawData: any, level: number) {
        this.id = this.requireField(rawData, "card_id");
		this.level = level;
		this.friendShip = this.requireField(rawData, "")
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
}