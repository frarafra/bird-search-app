import type { NextApiRequest, NextApiResponse } from 'next';

const EBIRD_API_URL = 'https://api.ebird.org/v2/data/nearest/geo/recent';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { bird, lat, lng } = req.query;

  if (!bird) {
    return res.status(400).json({ error: 'Missing specie parameter' });
  }

  try {
    const response = await fetch(`${EBIRD_API_URL}/${bird}/?lat=${lat || process.env.NEXT_PUBLIC_LAT}&lng=${lng || process.env.NEXT_PUBLIC_LNG}`, {
      headers: {
        'X-eBirdApiToken': process.env.NEXT_PUBLIC_EBIRD_API_TOKEN || '',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch data from eBird API');
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
