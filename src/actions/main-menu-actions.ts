import { CareerAction } from "../career";
import { ActionProvider, MenuAction } from "../interfaces/action-system";

export class MainMenuActions implements ActionProvider {
	getAvailableActions(): MenuAction[] {
		return [
			{ action: CareerAction.QUIT, value: 0, isQuit: true },
			{ action: CareerAction.REST, value: 1 },
			{ action: CareerAction.TRAINING, value: 2 },
			{ action: CareerAction.SKILLS, value: 3 },
			{ action: CareerAction.RECREATION, value: 4 },
			{ action: CareerAction.RACES, value: 5 },
		];
	}
}
