import type { NextApiRequest, NextApiResponse } from 'next';
import { chromium } from 'playwright';
import { EBIRD_SPECIES_URL } from '../../components/SearchResults';

let browser: any;
let context: any;

const initBrowserContext = async () => {
    if (!browser || !context) {
        browser = await chromium.launch();
        context = await browser.newContext();
    }
};

const closeBrowserContext = async () => {
    if (context && browser) {
        await context.close();
        await browser.close();
    }
};

const fetchImageUrl = async (speciesCode: string): Promise<string | null> => {
    try {
        if (!context) throw new Error('Browser context not initialized');

        const url = `${EBIRD_SPECIES_URL}${speciesCode}`;
        const page = await context.newPage();
        await page.goto(url);

        await page.waitForSelector('.Species-media-image');
        const imageUrl = await page.$eval('.Species-media-image', (el: HTMLImageElement) => el.src);

        await page.close();

        return imageUrl;
    } catch (error) {
        console.error(`Error fetching image for species code ${speciesCode}:`, error);
        return null;
    }
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchImagesInBatches = async (birds: Record<string, string>, batchSize: number, delayMs: number): Promise<Array<{ name: string; imageUrl: string }>> => {
    const birdEntries = Object.entries(birds);
    let results: Array<{ name: string; imageUrl: string }> = [];

    for (let i = 0; i < birdEntries.length; i += batchSize) {
        const batch = birdEntries.slice(i, i + batchSize);

        const dataPromises = batch.map(async ([name, speciesCode]) => {
            const imageUrl = await fetchImageUrl(speciesCode);
            return { name, imageUrl };
        });

        const resultsBatch = await Promise.allSettled(dataPromises)

        const successfulResults = resultsBatch
          .filter((result): result is PromiseFulfilledResult<{ name: string; imageUrl: string }> => result.status === 'fulfilled')
          .map(result => ({
            name: result.value.name,
            imageUrl: result.value.imageUrl
          }));

        results = results.concat(successfulResults);

        await delay(delayMs);
    }

    return results;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method === 'POST') {
            const birds = req.body;

            await initBrowserContext();

            const batchSize = 2;
            const delayMs = 120;

            const successfulResults = await fetchImagesInBatches(birds, batchSize, delayMs);
            console.log('Fetched image results:', successfulResults);
            //await closeBrowserContext();

            res.status(200).json(successfulResults);
        } else {
            res.setHeader('Allow', ['POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error('Error in /api/ebirdImages:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}