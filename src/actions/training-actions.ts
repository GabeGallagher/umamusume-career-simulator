import { ActionProvider, MenuAction } from "../interfaces/action-system";
import { TrainingAction } from "../interfaces/training-action";
import { FacilityType, Training } from "../training";

export class TrainingActions implements ActionProvider {
	private training: Training;
	private currentEnergy: number;

	constructor(training: Training, currentEnergy: number = 100) {
		this.training = training;
		this.currentEnergy = currentEnergy;
	}
	public getAvailableActions(energy?: number): MenuAction[] {
		const facilityActions: FacilityType[] = this.getFacilityActions();

		const actions: MenuAction[] = facilityActions.map((action, index) => {
			const gains = this.training.trainingGains(action);
			const failureRate = this.training.getFailureRate(action);

			console.log(
				`${action} training (${gains}) - ${failureRate.toFixed(
					0
				)}% failure rate`
			);
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
