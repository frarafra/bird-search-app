import { parse } from 'papaparse';

const EBIRD_API_URL = 'https://api.ebird.org/v2/data/nearest/geo/recent';
const EBIRD_OBS_API_URL = 'https://api.ebird.org/v2/data/obs/geo/recent';
const EBIRD_TAXONOMY_API_URL = 'https://api.ebird.org/v2/ref/taxonomy/ebird?version=2019&species=';

interface TaxonomyResponse {
    data: string[][];
}

const eBirdFetch = async (url: string) => {
    try {
        const response = await fetch(url, {
            headers: {
                'X-eBirdApiToken': process.env.NEXT_PUBLIC_EBIRD_API_TOKEN || '',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch data from eBird API');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error(errorMessage);

        return [];
    }
};

export async function ebirdObservationSearch(newLat?: string, newLng?: string) {
    return eBirdFetch(`${EBIRD_OBS_API_URL}/?lat=${newLat || process.env.NEXT_PUBLIC_LAT}&lng=${newLng || process.env.NEXT_PUBLIC_LNG}`);
}

export async function ebirdSearch(bird: string, newLat?: string, newLng?: string) {
    if (!bird) {
      throw new Error('Missing species or location parameters');
    }

    return eBirdFetch(`${EBIRD_API_URL}/${bird}/?lat=${newLat || process.env.NEXT_PUBLIC_LAT}&lng=${newLng || process.env.NEXT_PUBLIC_LNG}`);
}

export function ebirdTaxonomySearch(speciesCodes: string[]) {
    let newTaxonomies: Record<string, string> = {};

    for (const speciesCode of speciesCodes) {
        try {
            parse(`${EBIRD_TAXONOMY_API_URL}${speciesCode}`, {
                download: true,
                complete: function(results: TaxonomyResponse) {
                    if (results.data && results.data.length > 0) {
                        newTaxonomies[speciesCode] = results.data[1][results.data[0].indexOf('FAMILY_CODE')];
                    }                        
                }
            });
        } catch (error) {
            console.error(`Failed to fetch taxonomy for species code ${speciesCode}:`, error);
        }
    }
    return newTaxonomies;
}