import { ActionProvider, MenuAction } from "../interfaces/action-system";
import { TrainingType } from "../enums/training-types";
import { FacilityType, Training, TrainingGains } from "../training";
import { Support } from "../models/support";

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
				)}% failure rate.${this.printSupprts(facility)}`
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

	private printSupprts(facility: FacilityType): string {
		let output: string = "";
		const supportList: Support[] = this.training.getFacilityType(facility).supports;
		if (supportList.length === 0) return output;

		output = " Available supports: ";
		for (const support of supportList) {
			const hasHint: boolean = support.HasHint;
			const hintString: string = hasHint ? "[HINT]" : "";
			output += ` ${support.Name}${hintString},`;
		}
		return output;
	}

	private getTrainingInfo(gains: TrainingGains, facility: FacilityType): string {
		let out: string = "Invalid gains or facility";
		switch (facility) {
			case TrainingType.SPEED:
				out = `Speed: ${gains.speed}, Pow: ${
					gains.power
				}, Cost: ${this.training.getEnergyCost(facility)}`;
				break;
			case TrainingType.STAMINA:
				out = `Stam: ${gains.stamina}, Guts: ${
					gains.guts
				}, Cost: ${this.training.getEnergyCost(facility)}`;
				break;
			case TrainingType.POWER:
				out = `Pow: ${gains.power}, Stam: ${
					gains.stamina
				}, Cost: ${this.training.getEnergyCost(facility)}`;
				break;
			case TrainingType.GUTS:
				out = `Guts: ${gains.guts}, Speed: ${gains.speed}, Pow: ${
					gains.power
				}, Cost: ${this.training.getEnergyCost(facility)}`;
				break;
			case TrainingType.WISDOM:
				out = `Wit: ${gains.wisdom}, Speed: ${
					gains.speed
				}, Cost: ${this.training.getEnergyCost(facility)}`;
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
