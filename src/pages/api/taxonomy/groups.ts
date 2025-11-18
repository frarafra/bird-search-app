import type { NextApiRequest, NextApiResponse } from 'next';

import { getRedisClient } from '../../../client/redis';

const redis = getRedisClient();

const EBIRD_TAXONOMY_GROUP_API_URL = 'https://api.ebird.org/v2/ref/sppgroup/ebird';
const CACHE_EXPIRATION_SECONDS = 3 * 30 * 24 * 60 * 60;

interface TaxonomyGroupResponse {
    [key: string]: {
        groupName: string;
    };
}

async function getSppGroups() {
    let cachedData = await redis.get('spp-groups');
    if (cachedData) {
        return JSON.parse(cachedData);
    }

    const response = await fetch(EBIRD_TAXONOMY_GROUP_API_URL);
    const taxonomyGroups: TaxonomyGroupResponse = await response.json();

    const groupNames = Object.values(taxonomyGroups).map(group => group.groupName);
    await redis.set('spp-groups', JSON.stringify(groupNames), 'EX', CACHE_EXPIRATION_SECONDS);

    return groupNames;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const sppGroups = await getSppGroups();
    res.status(200).json(sppGroups);
  } catch (error) {
    console.error('Error in /api/taxonomy/groups:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}