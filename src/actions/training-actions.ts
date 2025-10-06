import { ActionProvider, MenuAction } from "../interfaces/action-system";
import { TrainingType } from "../enums/training-types";
import { FacilityType, Training, TrainingGains } from "../training";

export class TrainingActions implements ActionProvider {
	private training: Training;

	constructor(training: Training) {
		this.training = training;
	}
	
	public getAvailableActions(): MenuAction[] {
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
			case TrainingType.SPEED:
				out = `Speed: ${gains.speed}, Pow: ${gains.power}`;
				break;
			case TrainingType.STAMINA:
				out = `Stam: ${gains.stamina}, Guts: ${gains.guts}`;
				break;
			case TrainingType.POWER:
				out = `Pow: ${gains.power}, Stam: ${gains.stamina}`;
				break;
			case TrainingType.GUTS:
				out = `Guts: ${gains.guts}, Speed: ${gains.speed}, Pow: ${gains.power}`;
				break;
			case TrainingType.WISDOM:
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
			TrainingType.SPEED,
			TrainingType.STAMINA,
			TrainingType.POWER,
			TrainingType.GUTS,
			TrainingType.WISDOM,
		] as FacilityType[];
	}
}
