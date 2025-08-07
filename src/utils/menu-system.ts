import * as readline from "readline";
import { Career, CareerAction } from "../career";

export enum MenuType {
	MAIN = "main",
	TRAINING = "training",
}

export class MenuSystem {
	private rl: readline.Interface;
	private career: Career;
	private currentMenu: MenuType = MenuType.MAIN;

	constructor(career: Career, rl: readline.Interface) {
		this.career = career;
		this.rl = rl;
	}

	displayCurrentMenu(): void {
		switch (this.currentMenu) {
			case MenuType.MAIN:
				this.displayMainMenu();
				break;

			case MenuType.TRAINING:
				this.displayTrainingMenu();
				break;

			default:
				console.error(`Invalid menu type: ${this.currentMenu}`);
		}
	}

	private displayMainMenu(): void {
		const state = this.career.State;
		const actions = this.career.AvailableActions;

		console.log(`Turn: ${state.turn}`);
		console.log(`Energy: ${state.energy}`);
		console.log(`Mood: ${state.uma.Mood}`);
		console.log(`\nCurrent States: `);
		console.log(`    Speed: ${state.uma.current_stats.speed}`);
		console.log(`    Staimna: ${state.uma.current_stats.stamina}`);
		console.log(`    Power: ${state.uma.current_stats.strength}`);
		console.log(`    Guts: ${state.uma.current_stats.guts}`);
		console.log(`    Wisdom: ${state.uma.current_stats.wisdom}`);
		console.log("\nAvailable Actions:");

		actions.forEach((action, index) => {
			console.log(`${index + 1}. ${action.toUpperCase()}`);
		});

		console.log("0. Quit");
	}

    handleMainMenuInput(choice: number): boolean {
        const actions = this.career.AvailableActions;

        if (choice === 0) {
            console.log("Goodbye!");
            return false;
        }

        if (choice >= 1 && choice <= actions.length) {
            const selectedAction = actions[choice - 1];

            if (selectedAction === CareerAction.TRAINING) {
                this.currentMenu = MenuType.TRAINING;
                return true;
            } else {
                this.career.executeAction(selectedAction);
                return true;
            }
        } else {
            console.error("Invalid choice");
            return true;
        }
    }

	private displayTrainingMenu(): void {
		"place holder training menu";
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
