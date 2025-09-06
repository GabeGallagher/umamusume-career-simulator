import * as readline from "readline";
import { Career, CareerAction } from "../career";
import { ActionProvider, MenuAction } from "../interfaces/action-system";
import { MainMenuActions } from "../actions/main-menu-actions";
import { TrainingActions } from "../actions/training-actions";

export enum MenuType {
	MAIN = "main",
	TRAINING = "training",
	SKILLS = "skills",
	RACES = "races",
}

export class MenuSystem {
	private rl: readline.Interface;
	private career: Career;
	private currentMenu: MenuType = MenuType.MAIN;
	private prevMenu: MenuType = MenuType.MAIN;
	private actionProviders: Map<MenuType, ActionProvider>;

	constructor(career: Career, rl: readline.Interface) {
		this.career = career;
		this.rl = rl;
		this.actionProviders = new Map([
			[MenuType.MAIN, new MainMenuActions()],
			[MenuType.TRAINING, new TrainingActions(career.Training)],
		]);
	}

	get PreviousMenu(): MenuType {
		return this.prevMenu;
	}

	get AvailableActions(): MenuAction[] {
		const provider = this.actionProviders.get(this.currentMenu);
		return provider ? provider.getAvailableActions() : [];
	}

	public displayMenu(): void {
		this.displayStateInfo();
		console.log("\nAvailable Actions:");

		this.AvailableActions.forEach((action, index) => {
			console.log(`${index + 1}. ${action.label}`);
		});
	}

	private displayStateInfo(): void {
		const state = this.career.State;

		console.log(`Turn: ${state.turn}`);
		console.log(`Energy: ${state.energy}`);
		console.log(`Mood: ${state.uma.Mood}`);
		console.log(`\nCurrent Stats: `);
		console.log(`    Speed: ${state.uma.current_stats.speed}`);
		console.log(`    Staimna: ${state.uma.current_stats.stamina}`);
		console.log(`    Power: ${state.uma.current_stats.strength}`);
		console.log(`    Guts: ${state.uma.current_stats.guts}`);
		console.log(`    Wisdom: ${state.uma.current_stats.wisdom}`);
	}

	handleMainMenuInput(choice: number): boolean {
		const actions = this.AvailableActions;

		if (choice === 0) {
			console.log("Goodbye!");
			return false;
		}

		if (choice >= 1 && choice <= actions.length) {
			const selectedAction: MenuAction = actions[choice - 1];

			if (selectedAction.value === CareerAction.TRAINING) {
				this.currentMenu = MenuType.TRAINING;
				return true;
			} else {
				this.career.executeAction(selectedAction.value as any);
				return true;
			}
		} else {
			console.error("Invalid choice");
			return true;
		}
	}

	handleInput(input: string): boolean {
		const choice = parseInt(input);

		switch (this.currentMenu) {
			case MenuType.MAIN:
				return this.handleMainMenuInput(choice);

			default:
				return false;
		}
	}
}
