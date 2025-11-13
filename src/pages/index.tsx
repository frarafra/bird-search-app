'use client';

import React, { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

import { BirdContext } from '../contexts/BirdContext';
import { ebirdSearch } from '../api/ebird';
import SearchBox from '../components/SearchBox';
import SearchResults from '../components/SearchResults';
import { Result } from '../types';

const Map = dynamic(() => import('../components/Map'), {
    ssr: false,
});

const HomePage = () => {
    const router = useRouter();
    const { species } = router.query;
    
    const { mapCenter, setMapCenter } = useContext(BirdContext);
    const [results, setResults] = useState([]);
    const [hoveredResultId, setHoveredResultId] = useState<number | null>(null);

    const getBirdObservations = async (bird: string) => {
        if (!bird ||!mapCenter.lat || !mapCenter.lng) return;

        const data = await ebirdSearch(bird, mapCenter.lat.toString(), mapCenter.lng.toString());

        setResults(data);
    };
    
    useEffect(() => {
        getBirdObservations(species as string);
    }, [species]);

    const handleSearch = async (bird: string) => {
        getBirdObservations(bird);
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

export default HomePage;