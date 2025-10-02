import puppeteer, { Browser, Page } from "puppeteer";
import sqlite3 from "sqlite3";

async function insertIntoDatabase(
	dataArray: any[],
	dbName: string,
	tableName: string
) {
	const db = new sqlite3.Database(`${dbName}.db`, (err) => {
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
		}
	);

	for (const data of dataArray) {
		db.run(
			`INSERT OR REPLACE INTO characters (id, data) VALUES (?, ?)`,
			[data.itemData.card_id, JSON.stringify(data)],
			(err) => {
				if (err) console.error("Error inserting data: ", err);
			}
		);
	}

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
	});
	const url: string = `https://gametora.com/umamusume/${target}`;
	const page: Page = await browser.newPage();

	try {
		await page.goto(url, {
			waitUntil: "networkidle2",
			timeout: 30000,
		});

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

		for (const element of elementList) {
			let count = 1;
			if (element.href) {
				await page.goto(element.href, { waitUntil: "networkidle2" });

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

async function main() {
	try {
		const scrapedCharacterData = await scrapeGameTora(
			"characters",
			".sc-70f2d7f-0.jaayLK"
		);
		if (scrapedCharacterData) {
			await insertIntoDatabase(
				scrapedCharacterData,
				"characters",
				"characters"
			);
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
			await insertIntoDatabase(
				scrapedSupportData,
				"supports",
				"supports"
			);
		}
	} catch (error) {
		console.error("Error scraping support cards in main:", error);
	}
}

main();
