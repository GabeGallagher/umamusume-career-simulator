import { ActionProvider, MenuAction } from "../interfaces/action-system";
import { TrainingAction } from "../interfaces/training-action";
import { FacilityType } from "../training";

export class TrainingActions implements ActionProvider {
	getAvailableActions(): MenuAction[] {
		const facilityActions = this.getFacilityActions();

		const actions: MenuAction[] = facilityActions.map((action, index) => {
			return {
				action: action,
				value: index,
			};
		});

		return actions;
	}

	private getFacilityActions(): FacilityType[] {
		return [
            TrainingAction.BACK,
			TrainingAction.SPEED,
			TrainingAction.STAMINA,
			TrainingAction.POWER,
			TrainingAction.GUTS,
			TrainingAction.WISDOM,
		] as FacilityType[];
	}

	private formatGains(gains: Record<string, number>): string {
		return Object.entries(gains)
			.map(([stat, value]) => `${stat}+${value}`)
			.join(", ");
	}
}
