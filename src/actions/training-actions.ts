import { ActionProvider, MenuAction } from "../interfaces/action-system";
import { TrainingAction } from "../interfaces/training-action";
import { FacilityType } from "../training";

export class TrainingActions implements ActionProvider {
	public getAvailableActions(): MenuAction[] {
		const facilityActions: FacilityType[] = this.getFacilityActions();

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
}
