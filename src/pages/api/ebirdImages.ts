import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { CookieJar } from 'tough-cookie'
import { wrapper } from 'axios-cookiejar-support';
import Redis from 'ioredis';

import { EBIRD_SPECIES_URL } from '../../components/SearchResults';

const redis = new Redis({
  port: Number(process.env.NEXT_PUBLIC_REDIS_PORT),
  host: process.env.NEXT_PUBLIC_REDIS_HOST,
  username: process.env.NEXT_PUBLIC_REDIS_USER,
  password: process.env.NEXT_PUBLIC_REDIS_PWD,
  db: 0,
});

const cookieJar = new CookieJar();
wrapper(axios);

const fetchEbirdSpeciesPage = async (initialUrl: string) => {
  let url = initialUrl;
  let response;
  let redirectCount = 0;
  const maxRedirects = 10;

  try {
    while (redirectCount < maxRedirects) {
      response = await axios.get(url, {
        jar: cookieJar,
        withCredentials: true,
        maxRedirects: 0,
        validateStatus: () => true,
      });

      if (response.status === 302 || response.status === 301) {
        const redirectUrl = response.headers.location;
        url = redirectUrl;
        redirectCount++;
      } else if (response.status === 200) {
        return response.data;
      } else {
        break;
      }
    }
  } catch (err) {
    console.error('Error:', err);
    return null;
  }
}

const fetchImageUrl = async (speciesCode: string): Promise<string | null> => {
    const cachedImageUrl = await redis.get(speciesCode);

    if (cachedImageUrl) {
        return JSON.parse(cachedImageUrl);
    }

    try {
       const url = `${EBIRD_SPECIES_URL}${speciesCode}`;
        const response = await fetchEbirdSpeciesPage(url);
        const $ = cheerio.load(response);

        const imageElement = $('.Species-media-image');
        if (imageElement.length === 0) {
            console.warn(`No image found for species code: ${speciesCode}`);
            return null;
        }

        const imageUrl = $(imageElement).attr('src');

        await redis.set(speciesCode, JSON.stringify(imageUrl), 'EX', 30 * 60 * 24);

        return imageUrl || null; 
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

        const resultsBatch = await Promise.allSettled(dataPromises);
        
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
     
            const batchConcSize = Number(process.env.NEXT_PUBLIC_BATCH_CONC_SIZE);
            const delayMs = Number(process.env.NEXT_PUBLIC_DELAY_BETWEEN_BATCHES_MS);

            const successfulResults = await fetchImagesInBatches(birds, batchConcSize, delayMs);
            console.log('Fetched image results:', successfulResults);

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