import { resolve } from "path";
import puppeteer, { Browser, Page } from "puppeteer";
import sqlite3 from "sqlite3";

async function insertIntoDatabase(dataArray: any[], tableName: string) {
	const db: sqlite3.Database = new sqlite3.Database(`career-sim.db`, (err) => {
		if (err) {
			console.error("Error opening database: ", err);
		}
	});

	db.run(
		`CREATE TABLE IF NOT EXISTS ${tableName} (
        id INTEGER PRIMARY KEY,
        data JSON
    )`,
		(err) => {
			if (err) {
				console.error("Error creating table: ", err);
			}

			if (dataArray.length === 0) {
				console.log(`No data in dataArray ${tableName}`);
				db.close();
				resolve();
				return;
			}

			console.log(`Inserting ${dataArray.length} ${tableName}`);
			let count = 1;

			for (const data of dataArray) {
				switch (tableName) {
					case "characters":
						runDbInsert(db, tableName, data, data.itemData.card_id);
						break;
					case "supports":
						runDbInsert(db, tableName, data, data.itemData.support_id);
						break;
					case "skills":
						runDbInsert(db, tableName, data, data.id);
						break;
					default:
						throw new Error(`tableName: ${tableName} does not have an implemented primary key`);
				}
				console.log(`Successfully inserted ${tableName} ${count}/${dataArray.length}`);
				count++;
			}
		}
	);

	db.close((err) => {
		if (err) {
			console.error("Error closing database: ", err);
		} else {
			console.log("Database closed successfully");
		}
	});
}

async function runDbInsert(db: sqlite3.Database, tableName: string, data: any, primaryKey: number) {
	db.run(
		`INSERT OR REPLACE INTO ${tableName} (id, data) VALUES (?, ?)`,
		[primaryKey, JSON.stringify(data)],
		(err) => {
			if (err) console.error("Error inserting data: ", err);
		}
	);
}

async function scrapeGameTora(target: string, parentClass: string): Promise<any> {
	const browser: Browser = await puppeteer.launch({
		headless: true,
		devtools: false,
		args: ["--no-sandbox", "--disable-setuid-sandbox"],
		protocolTimeout: 0,
	});
	const url: string = `https://gametora.com/umamusume/${target}`;
	const page: Page = await browser.newPage();
	page.setDefaultTimeout(0);
	page.setDefaultNavigationTimeout(0);

	try {
		await page.goto(url, { waitUntil: "networkidle2", timeout: 0 });

		const elementList = await page.evaluate((selector) => {
			const parentElement = document.querySelector(selector);
			return parentElement
				? Array.from(parentElement.children).map((child) => {
						const childElement = child as HTMLAnchorElement;
						return {
							href: childElement.href,
							text: childElement.textContent?.trim() || "",
							innerHTML: childElement.innerHTML,
						};
				  })
				: [];
		}, parentClass);

		const elementDataArray = [];
		let count = 1;

		for (const element of elementList) {
			if (element.href) {
				try {
					await page.goto(element.href, {
						waitUntil: "networkidle2",
						timeout: 45000,
					});

					const nextData = await page.evaluate(() => {
						const scriptElement = document.getElementById("__NEXT_DATA__");
						return scriptElement
							? JSON.parse(scriptElement.textContent || "{}")
							: null;
					});

					if (
						nextData &&
						nextData.props &&
						nextData.props.pageProps &&
						nextData.props.pageProps.itemData
					) {
						elementDataArray.push(nextData.props.pageProps);
						console.log(
							`Pushed: ${nextData.props.pageProps.itemData.url_name}, ${count}/${elementList.length}`
						);
						count++;
					} else {
						throw new Error(
							`Data for ${element.text} not found in __NEXT_DATA__`
						);
					}
				} catch (error) {
					console.error(`Error loading page ${element.href}: `, error);
					continue;
				}
			}
		}
		return elementDataArray;
	} catch (error) {
		console.error(`Error occurred scraping ${target}: `, error);
	} finally {
		await browser.close();
		console.log("Browser closed");
	}
}

async function scrapeSkillsData(): Promise<any[]> {
	const browser: Browser = await puppeteer.launch({
		headless: true,
		devtools: false,
		args: ["--no-sandbox", "--disable-setuid-sandbox"],
		protocolTimeout: 0,
	});
	const page: Page = await browser.newPage();
	page.setDefaultTimeout(0);
	page.setDefaultNavigationTimeout(0);

	let skillsDataUrl: string | null = null;

	page.on("request", (request) => {
		const url = request.url();
		if (url.includes("/data/umamusume/skills.") && url.endsWith(".json")) {
			skillsDataUrl = url;
			console.log(`Found skill data URL: ${url}`);
		}
	});
	try {
		await page.goto("https://gametora.com/umamusume/skills", {
			waitUntil: "networkidle2",
			timeout: 0,
		});

		// Give it a moment to ensure all network requests are captured
		await page.waitForSelector("body", { timeout: 30000 });

		if (!skillsDataUrl) {
			throw new Error("Skills data URL not found in network requests");
		}

		const skillsResponse = await page.goto(skillsDataUrl, {
			waitUntil: "networkidle2",
			timeout: 45000,
		});

		if (!skillsResponse) {
			throw new Error("Failed to fetch skills data");
		}

		const skillsData = await skillsResponse.json();
		return skillsData;
	} catch (error) {
		console.error("Error occurred scraping skills:", error);
		return [];
	} finally {
		await browser.close();
		console.log("Browser closed");
	}
}

async function main() {
	try {
		const scrapedCharacterData = await scrapeGameTora(
			"characters",
			".sc-70f2d7f-0.jaayLK"
		);
		if (scrapedCharacterData) {
			await insertIntoDatabase(scrapedCharacterData, "characters");
		}
	} catch (error) {
		console.error("Error scraping characters in main:", error);
	}

	try {
		const scrapedSupportData = await scrapeGameTora(
			"supports",
			".sc-70f2d7f-0.jaayLK"
		);
		if (scrapedSupportData) {
			await insertIntoDatabase(scrapedSupportData, "supports");
		}
	} catch (error) {
		console.error("Error scraping support cards in main:", error);
	}

	try {
		const scrapedSkillsData = await scrapeSkillsData();
		if (scrapedSkillsData && scrapedSkillsData.length > 0)
			await insertIntoDatabase(scrapedSkillsData, "skills");
	} catch (error) {
		console.error("Error scraping skills in main: ", error);
	}
}

main();
