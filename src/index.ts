import sqlite3 from "sqlite3";
import { Uma } from "./models/uma";
import { Career } from "./career";
import * as readline from "readline";
import { MenuSystem } from "./utils/menu-system";

console.log("Hello Uma Musume Simulator!");

interface CharacterRow {
	id: number;
	data: string;
}

async function loadUmaFromDb(): Promise<Uma> {
    return new Promise((resolve, reject) => {
        const db: sqlite3.Database = new sqlite3.Database("characters.db");
        const sql: string = "SELECT id, data FROM characters LIMIT 1";

        db.get(sql, [], (err: Error | null, row: CharacterRow) => {
            if (err) {
                console.error(`Database query failed: ${err.message}`);
                db.close();
                reject(err);
            } else {
                try {
                    const characterData = JSON.parse(row.data);
                    const uma: Uma = new Uma(characterData.itemData);
                    db.close(() => {
                        resolve(uma);
                    });
                } catch (parseError) {
                    db.close();
                    reject(parseError);
                }
            }
        });
    });
}

function simulateCareer(uma: Uma): void {
	const career: Career = new Career(uma);

	const rl: readline.Interface = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	const menuSystem: MenuSystem = new MenuSystem(career);

	const gameLoop = (): void => {
		if (career.isComplete) {
			console.log("\nCareer simulation complete!");
			rl.close();
			return;
		}

		menuSystem.displayMenu();

		rl.question("\nSelect an action: ", (input) => {
			const shouldContinue: boolean = menuSystem.handleInput(input)

			if (shouldContinue) {
				gameLoop();
			} else {
				rl.close();
			}
		});
	};
	gameLoop();
}

async function main(): Promise<void> {
	const uma: Uma = await loadUmaFromDb();
	simulateCareer(uma);
}

main();
