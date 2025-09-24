import { ActionProvider, MenuAction } from "../interfaces/action-system";
import { TrainingAction } from "../interfaces/training-action";
import { FacilityType, Training, TrainingGains } from "../training";

export class TrainingActions implements ActionProvider {
	private training: Training;
	private currentEnergy: number;

	constructor(training: Training, currentEnergy: number = 100) {
		this.training = training;
		this.currentEnergy = currentEnergy;
	}
	public getAvailableActions(energy?: number): MenuAction[] {
		const facilityActions: FacilityType[] = this.getFacilityActions();

		const actions: MenuAction[] = facilityActions.map((facility, index) => {
			const gains: TrainingGains = this.training.trainingGains(facility);
			const failureRate: number = this.training.getFailureRate(facility);
			const trainingInfo: string = this.getTrainingInfo(gains, facility);

			console.log(
				`${facility} training (${trainingInfo}) - ${failureRate.toFixed(
					0
				)}% failure rate`
			);
			return {
				action: facility,
				value: index,
			};
		});

		actions.push({
			action: "back",
			value: 0,
			isBack: true,
		});

		return actions;
	}

	private getTrainingInfo(
		gains: TrainingGains,
		facility: FacilityType
	): string {
		let out: string = "Invalid gains or facility";
		switch (facility) {
			case TrainingAction.SPEED:
				out = `Speed: ${gains.speed}, Pow: ${gains.power}`;
				break;
			case TrainingAction.STAMINA:
				out = `Stam: ${gains.stamina}, Guts: ${gains.guts}`;
				break;
			case TrainingAction.POWER:
				out = `Pow: ${gains.power}, Stam: ${gains.stamina}`;
				break;
			case TrainingAction.GUTS:
				out = `Guts: ${gains.guts}, Speed: ${gains.speed}, Pow: ${gains.power}`;
				break;
			case TrainingAction.WISDOM:
				out = `Wit: ${gains.wisdom}, Speed: ${gains.speed}`;
				break;
			default:
				console.log(`Unknown gains or facility`);
				break;
		}
		return out;
	}

	public getTrainingActionByChoice(choice: number): FacilityType | null {
		const facilityActions = this.getFacilityActions();

		if (choice >= 1 && choice <= facilityActions.length) {
			return facilityActions[choice - 1];
		}
		return null;
	}

	private getFacilityActions(): FacilityType[] {
		return [
			TrainingAction.SPEED,
			TrainingAction.STAMINA,
			TrainingAction.POWER,
			TrainingAction.GUTS,
			TrainingAction.WISDOM,
		] as FacilityType[];
	}
}
