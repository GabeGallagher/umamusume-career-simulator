import { ActionProvider, MenuAction } from "../interfaces/action-system";

export class MainMenuActions implements ActionProvider {
	getAvailableActions(): MenuAction[] {
		return [
			{ label: "Rest", value: "rest" },
			{ label: "Training", value: "training" },
			{ label: "Skills", value: "skills" },
			{ label: "Recreation", value: "recreation" },
			{ label: "Races", value: "races" },
			{ label: "Quit", value: "quit", isQuit: true },
		];
	}
}
