import sqlite3 from "sqlite3";
import { Uma } from "./models/uma";
import { Career } from "./career";
import * as readline from "readline";
import { MenuSystem } from "./utils/menu-system";
import { Support } from "./models/support";
import { SupportInterface } from "./interfaces/support";
import { Rarity } from "./enums/rarity";

console.log("Hello Uma Musume Simulator!");

interface DataRow {
	id: number;
	data: string;
}

async function loadUmaFromDb(charId: number, stars?: number): Promise<Uma> {
	return new Promise((resolve, reject) => {
		const db: sqlite3.Database = new sqlite3.Database("career-sim.db");
		const sql: string = `SELECT data FROM characters WHERE id = ${charId}`;

		db.get(sql, [], (err: Error | null, row: DataRow) => {
			if (err) {
				console.error(`Database query failed: ${err.message}`);
				db.close();
				reject(err);
			} else {
				try {
					const characterData = JSON.parse(row.data);
					const uma: Uma = new Uma(characterData.itemData, stars);
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

async function loadSupportCardsFromDb(
	supportsList: SupportInterface[]
): Promise<Support[]> {
	return new Promise((resolve, reject) => {
		const db: sqlite3.Database = new sqlite3.Database("career-sim.db");
		const supportCardArray: Support[] = [];

		for (const supportCard of supportsList) {
			const sql: string = `SELECT data FROM supports WHERE id = ${supportCard.id}`;
			db.get(sql, [], (err: Error | null, row: DataRow) => {
				if (err) {
					console.error(`Database query failed: ${err.message}`);
					db.close();
					reject(err);
				} else {
					try {
						const supportData = JSON.parse(row.data);
						supportCardArray.push(
							new Support(supportData, supportCard.level)
						);
					} catch (parseError) {
						db.close();
						reject(parseError);
					}
				}
			});
		}
		db.close(() => {
			resolve(supportCardArray);
		});
	});
}

function simulateCareer(uma: Uma, supports: Support[]): void {
	const career: Career = new Career(uma, supports);

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
			const shouldContinue: boolean = menuSystem.handleInput(input);

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
	const uma: Uma = await loadUmaFromDb(101301, Rarity.FourStar); // 101301-mejiro-mcqueen base
	// TODO: Refactor to accept card ID and level
	const supportIdArray: SupportInterface[] = [
		{ id: 20023, level: 45 }, // Sweep Tosho speed SR
		{ id: 30028, level: 50 }, // Kitasan Black
		{ id: 20020, level: 45 }, // King Halo speed SR
		{ id: 30021, level: 50 }, // Tazuna SSR Pal
		{ id: 20024, level: 45 }, // Daitaku Helios Strength SR
		{ id: 20006, level: 45 }, // biwa-hayahide strength SR
	];
	const supports: Support[] = await loadSupportCardsFromDb(supportIdArray);
	simulateCareer(uma, supports);
}

main();
