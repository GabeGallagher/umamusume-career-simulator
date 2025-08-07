import sqlite3 from "sqlite3";
import { Uma } from "./models/uma";
import { Career } from "./career";
import * as readline from "readline";

console.log("Hello Uma Musume Simulator!");

interface CharacterRow {
	id: number;
	data: string;
}

async function fixedLoadCharacterFromDB(): Promise<Uma> {
	const db = new sqlite3.Database("characters.db");
	let sql = "SELECT id, data FROM characters LIMIT 1";

	const charData: any = await new Promise((resolve, reject) => {
		db.get(sql, [], (err, row: CharacterRow) => {
			if (err) {
				console.error(`Database query failed: ${err.message}`);
				reject(err);
			} else {
				const characterData = JSON.parse(row.data);
				resolve(characterData);
			}
		});
	});
	const uma = new Uma(charData.itemData);
	return uma;
}

function simulateCareer(uma: Uma): void {
	const career = new Career(uma);

	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	const gameLoop = (): void => {
		if (career.isComplete) {
			console.log("\nCareer simulation complete!");
			rl.close();
			return;
		}

		displayMenu(career);

		rl.question("\nSelect an action (0-5): ", (input) => {
			const choice = parseInt(input);
			const actions = career.AvailableActions;

			if (choice === 0) {
				console.log("Goodbye!");
				rl.close();
				return;
			}

			if (choice >= 1 && choice <= actions.length) {
				const selectedAction = actions[choice - 1];
				career.executeAction(selectedAction);
			} else {
				console.log("Invalid choice. Please try again.");
			}
			gameLoop();
		});
	};
	gameLoop();
}

function displayMenu(career: Career): void {
	const state = career.State;
	const actions = career.AvailableActions;

	console.log("\n=== Uma Musume Career Simulator ===");
	console.log(`Turn: ${state.turn}`);
	console.log(`Energy: ${state.energy}`);
	console.log(`Trainee: ${state.uma.name}`);
	console.log("\nAvailable Actions:");

	actions.forEach((action, index) => {
		console.log(`${index + 1}. ${action.toUpperCase()}`);
	});

	console.log("0. Quit");
}

async function main(): Promise<void> {
	const uma = await fixedLoadCharacterFromDB();
	simulateCareer(uma);
}

main();
