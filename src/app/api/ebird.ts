const EBIRD_API_URL = 'https://api.ebird.org/v2/data/nearest/geo/recent';
const EBIRD_OBS_API_URL = 'https://api.ebird.org/v2/data/obs/geo/recent';
export const lat = '9.86371' //41.72498';
export const lng = '-83.9195' //'1.82656';

export async function ebirdObservationSearch(newLat?: string, newLng?: string) {
    console.log('env', process.env);
    try {
        const response = await fetch(
          `${EBIRD_OBS_API_URL}/?lat=${newLat || lat}&lng=${newLng || lng}`,
            {
                headers: {
                    'X-eBirdApiToken': process.env.NEXT_PUBLIC_EBIRD_API_TOKEN || '',
                },
            }
        );

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
}

export async function ebirdSearch(bird: string, newLat?: string, newLng?: string) {
    if (!bird) {
      throw new Error('Missing species or location parameters');
    }

    try {
        const response = await fetch(
          `${EBIRD_API_URL}/${bird}/?lat=${newLat || lat}&lng=${newLng || lng}`,
            {
                headers: {
                    'X-eBirdApiToken': process.env.NEXT_PUBLIC_EBIRD_API_TOKEN || '',
                },
            }
        );

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
}