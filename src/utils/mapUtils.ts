import { Result } from '../types';

export const calculateBounds = (results: Result[]): [[number, number], [number, number]] => {
  if (!results.length) return [[0, 0], [0, 0]];

  const latitudes = results.map(result => result.lat);
  const longitudes = results.map(result => result.lng);

  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);

  return [[minLat, minLng], [maxLat, maxLng]];
};