'use client';

import { useState } from 'react';

import SearchBox from '../components/SearchBox';
import SearchResults from '../components/SearchResults';
import Map from '../components/Map'; 
import { ebirdSearch, lat, lng } from './api/ebird';
import { Result } from '../types';

const Page = () => {
    const [results, setResults] = useState([]);
    const [hoveredResultId, setHoveredResultId] = useState<number | null>(null);
    const [mapCenter, setMapCenter] = useState({ lat: parseFloat(lat), lng: parseFloat(lng) });

    const handleSearch = async (bird: string) => {
        if (!mapCenter.lat || !mapCenter.lng) return;

        const data = await ebirdSearch(bird, mapCenter.lat.toString(), mapCenter.lng.toString());
        setResults(data);
    };

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <div style={{ flex: 2, paddingRight: '20px' }}>
                <SearchBox lat={mapCenter.lat} lng={mapCenter.lng} onSearch={handleSearch} />
                <SearchResults results={results.slice(0, 10).sort((a: Result, b: Result) => {
                    const aObsDt = Date.parse(a.obsDt);
                    const bObsDt = Date.parse(b.obsDt);
                    if (bObsDt !== aObsDt) {
                        return bObsDt - aObsDt;
                    }
                    return b.howMany - a.howMany;
                })} setHoveredResultId={setHoveredResultId} />
            </div>
            <div style={{ flex: 3, position: 'relative', height: '100vh' }}>
                <Map lat={mapCenter.lat} lng={mapCenter.lng} results={results} hoveredResultId={hoveredResultId} onMoveEnd={setMapCenter} />
            </div>
        </div>
    );
};

export default Page;