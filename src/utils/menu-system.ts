import { Career, CareerAction, CareerState } from "../career";
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
	private career: Career;
	private currentMenu: MenuType = MenuType.MAIN;
	private prevMenu: MenuType = MenuType.MAIN;
	private actionProviders: Map<MenuType, ActionProvider>;

	constructor(career: Career) {
		this.career = career;
		this.actionProviders = new Map([
			[MenuType.MAIN, new MainMenuActions()],
			[
				MenuType.TRAINING,
				new TrainingActions(career.Training, career.CurrentEnergy),
			],
		]);
	}

	set CurrentMenu(menu: MenuType) {
		this.prevMenu = this.currentMenu;
		this.currentMenu = menu;
	}

	get PreviousMenu(): MenuType {
		return this.prevMenu;
	}

	get AvailableActions(): MenuAction[] {
		const provider: ActionProvider | undefined = this.actionProviders.get(
			this.currentMenu
		);
		if (this.currentMenu === MenuType.TRAINING) {
			return provider
				? provider.getAvailableActions(this.career.CurrentEnergy)
				: [];
		} else {
			return provider ? provider.getAvailableActions() : [];
		}
	}

	public displayMenu(): void {
		this.displayStateInfo();
		console.log("\nAvailable Actions:");

		this.AvailableActions.forEach((action, index) => {
			console.log(`${index}. ${action.action}`);
		});
	}

	private displayStateInfo(): void {
		const state: CareerState = this.career.State;

		console.log(`Turn: ${state.turn}`);
		console.log(`Energy: ${state.energy}`);
		console.log(`Mood: ${state.mood}`);
		console.log(`\nCurrent Stats: `);
		console.log(`    Speed: ${state.uma.current_stats.speed}`);
		console.log(`    Staimna: ${state.uma.current_stats.stamina}`);
		console.log(`    Power: ${state.uma.current_stats.strength}`);
		console.log(`    Guts: ${state.uma.current_stats.guts}`);
		console.log(`    Wisdom: ${state.uma.current_stats.wisdom}`);
	}

	handleInput(input: string): boolean {
		const choice: number = parseInt(input);
		const isQuitAction: MenuAction | undefined = this.AvailableActions.find(
			(action) => action.isQuit
		);
		if (choice === 0 && isQuitAction) {
			console.log("Goodbye!");
			return false;
		}

		if (choice < this.AvailableActions.length) {
			const selectedAction: MenuAction = this.AvailableActions[choice];

			if (selectedAction.action === CareerAction.TRAINING) {
				this.CurrentMenu = MenuType.TRAINING;
				return true;
			} else {
				this.career.executeAction(selectedAction.action as any);
				return true;
			}
		} else {
			console.error("Invalid choice");
			return true;
		}
	}
}
