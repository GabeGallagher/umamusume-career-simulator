import { SupportInterface } from "../interfaces/support";

export class Support implements SupportInterface {
    id: number;

    constructor(rawData: any) {
        this.id = this.requireField(rawData, "card_id");
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