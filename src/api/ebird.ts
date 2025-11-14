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

function parseCSVAsync(csvString: string, options = {}) {
  return new Promise((resolve, reject) => {
    parse(csvString, {
        ...options,
        complete: resolve,
        error: reject,
    });
  });
}

export async function ebirdTaxonomySearch(speciesCodes: string[]) {
    const parsePromises = speciesCodes.map((speciesCode) => parseCSVAsync(`${EBIRD_TAXONOMY_API_URL}${speciesCode}`, { download: true }));

    const results = await Promise.allSettled(parsePromises);

    let taxonomies: Record<string, string> = {};
    results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
            const res = result.value as TaxonomyResponse;
            const data = res.data;
            if (data && data.length > 0) {
                taxonomies[speciesCodes[index]] = data[1][data[0].indexOf('FAMILY_CODE')];
            }
        } else if (result.status === 'rejected') {
            console.error(`Failed to fetch taxonomy for species code ${speciesCodes[index]}:`, result.reason);
        }
    });

    return taxonomies;
}