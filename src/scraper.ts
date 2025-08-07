import puppeteer, { Browser, Page } from 'puppeteer';
import sqlite3 from 'sqlite3';

async function scrapeGameTora() {
    const browser: Browser = await puppeteer.launch({
        headless: false,
        devtools: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page: Page = await browser.newPage();

    try {
        await page.goto('https://gametora.com/umamusume/characters', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        const testCharacter = await page.evaluate(() => {
            const characterElements = document.querySelectorAll('a[href*="matikanefukukitaru"]');
            const firstElement = characterElements[1] as HTMLAnchorElement;

            return {
                href: firstElement.href,
                text: firstElement.textContent?.trim() || '',
                innerHTML: firstElement.innerHTML
            };
        });
        
        await page.goto(testCharacter.href, { waitUntil: 'networkidle2' });
        
        const nextData = await page.evaluate(() => {
            const scriptElement = document.getElementById('__NEXT_DATA__');
            return scriptElement ? JSON.parse(scriptElement.textContent || '{}') : null;
        });
        let characterData;
        if (nextData && nextData.props && nextData.props.pageProps && nextData.props.pageProps.itemData) {
            characterData = nextData.props.pageProps;
        } else {
            throw new Error('Character data not found in __NEXT_DATA__');
        }

        const db = new sqlite3.Database('characters.db', (err) => {
            if (err) {
                console.error('Error opening database: ', err);
            }
        });

        db.run(`CREATE TABLE IF NOT EXISTS characters (
            id INTEGER PRIMARY KEY,
            data JSON
        )`, (err) => {
            if (err) {
                console.error('Error creating table: ', err);
            }
        });
        
        db.run(`INSERT OR REPLACE INTO characters (id, data) VALUES (?, ?)`,
            [characterData.itemData.card_id, JSON.stringify(characterData)],
            (err) => {  
                if (err)
                    console.error('Error inserting data: ', err);
            }
        );
        db.close((err) => {
            if (err) {
                console.error('Error closing database: ', err);
            } else {
                console.log('Database closed successfully');
            }
        });
    } catch (error) {
        console.error('Error occurred: ', error);
    } finally {
        await browser.close();
        console.log('Browser closed');
    }
}

// Run the debug function
scrapeGameTora().catch(console.error);
