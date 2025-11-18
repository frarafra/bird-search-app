import { parse } from 'papaparse';
import type { NextApiRequest, NextApiResponse } from 'next';

import { getRedisClient } from '../../../client/redis';

const redis = getRedisClient();

const EBIRD_TAXONOMY_API_URL = 'https://api.ebird.org/v2/ref/taxonomy/ebird?version=2019&species=';

interface TaxonomyResponse {
    data: string[][];
}

async function parseCSVAsync(url: string): Promise<TaxonomyResponse> {
    const response = await fetch(url); 
    const csvString = await response.text();

    return parse(csvString);
}

async function ebirdTaxonomySearch(speciesCodes: string[]) {
    const parsePromises = speciesCodes.map(async(speciesCode) => {
        const cachedBirdFamily = await redis.get(`${speciesCode}-family`);

        if (cachedBirdFamily) {
            return JSON.parse(cachedBirdFamily); 
        }

        const parsedData: TaxonomyResponse = await parseCSVAsync(`${EBIRD_TAXONOMY_API_URL}${speciesCode}`);
    
        return parsedData?.data?.[1]?.[parsedData?.data?.[0]?.indexOf('FAMILY_COM_NAME')];
    });

    const results = await Promise.allSettled(parsePromises);

    let taxonomies: Record<string, string> = {};    
    results.forEach(async (result, index) => {
        if (result.status === 'fulfilled') {
            const birdFamily = result.value as string;

            taxonomies[speciesCodes[index]] = birdFamily;
            await redis.set(`${speciesCodes[index]}-family`, JSON.stringify(taxonomies[speciesCodes[index]]), 
                    'EX', 30 * 24 * 60 * 60);

        } else if (result.status === 'rejected') {
            console.error(`Failed to fetch taxonomy for species code ${speciesCodes[index]}:`, result.reason);
        }
    });

    return taxonomies;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { speciesCodes } = req.query;

    if (!speciesCodes || Array.isArray(speciesCodes)) {
      throw new Error('Invalid speciesCodes provided');
    }

    const taxonomies = await ebirdTaxonomySearch(speciesCodes.split(','));
    res.status(200).json(taxonomies);
  } catch (error) {
    console.error('Error in /api/taxonomy/speciesr:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}