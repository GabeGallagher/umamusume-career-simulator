import { resolve } from "path";
import puppeteer, { Browser, Page } from "puppeteer";
import sqlite3 from "sqlite3";

async function insertIntoDatabase(dataArray: any[], tableName: string) {
	const db = new sqlite3.Database(`career-sim.db`, (err) => {
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

			for (const data of dataArray) {
				if (tableName === 'characters') {
					db.run(
						`INSERT OR REPLACE INTO ${tableName} (id, data) VALUES (?, ?)`,
						[data.itemData.card_id, JSON.stringify(data)],
						(err) => {
							if (err) {
								console.error("Error inserting data: ", err);
							}
						}
					);
					// TODO: Check support card data structure for unique identifier since I'll be adding more tables/ data types
				} else if (tableName === 'supports') {
					db.run(
						`INSERT OR REPLACE INTO ${tableName} (id, data) VALUES (?, ?)`,
						[data.itemData.support_id, JSON.stringify(data)],
						(err) => {
							if (err) {
								console.error("Error inserting data: ", err);
							}
						}
					);
				}
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

async function scrapeGameTora(
	target: string,
	parentClass: string
): Promise<any> {
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
						const scriptElement =
							document.getElementById("__NEXT_DATA__");
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
					console.error(
						`Error loading page ${element.href}: `,
						error
					);
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

// test function. Delete when fixed
async function verifyDatabase() {
    const db = new sqlite3.Database(`career-sim.db`, (err) => {
        if (err) {
            console.error("Error opening database: ", err);
        }
    });

    // Check table counts
    db.get("SELECT COUNT(*) as count FROM characters", (err, row: any) => {
        if (err) {
            console.error("Error querying characters: ", err);
        } else {
            console.log(`Characters table has ${row.count} rows`);
        }
    });

    db.get("SELECT COUNT(*) as count FROM supports", (err, row: any) => {
        if (err) {
            console.error("Error querying supports: ", err);
        } else {
            console.log(`Supports table has ${row.count} rows`);
        }
    });

    // Show a sample record from each table
    db.get("SELECT id, JSON_EXTRACT(data, '$.itemData.name_en') as name FROM characters LIMIT 1", (err, row: any) => {
        if (err) {
            console.error("Error getting sample character: ", err);
        } else if (row) {
            console.log(`Sample character: ID ${row.id}, Name: ${row.name}`);
        }
    });

    db.get("SELECT id, JSON_EXTRACT(data, '$.itemData.char_name') as name FROM supports LIMIT 1", (err, row: any) => {
        if (err) {
            console.error("Error getting sample support: ", err);
        } else if (row) {
            console.log(`Sample support: ID ${row.id}, Name: ${row.name}`);
        }
    });

    db.close();
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

	await verifyDatabase();
}

main();
