'use client';

import React, { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

import { BirdContext } from '../contexts/BirdContext';
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
    const { birds, setBirds, setTaxonomies } = useContext(BirdContext);
    const [observations, setObservations] = useState([]);
    const [hoveredResultId, setHoveredResultId] = useState<number | null>(null);

    const { lat, lng } = mapCenter;
    
    const fetchBirds = async (newLat?: string, newLng?: string) => {
        try {
            const response = await fetch(`/api/ebirdSpeciesSearch?lat=${newLat}&lng=${newLng}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch birds: ${response.statusText}`);
            }

            const birds = await response.json();
            
            setBirds(birds.reduce((acc: Record<string, string>, obs: any) => {
                acc[obs.comName.toLowerCase()] = obs.speciesCode;
                return acc;
            }, {}));
        } catch (error) {
            console.error('Error fetching birds:', error);
        }
    };

    const fetchTaxonomies = async (speciesCodes: string[]) => {
        try {
            const response = await fetch(`/api/taxonomy/species?speciesCodes=${speciesCodes.join(',')}`);

            if (!response.ok) {
                throw new Error(`Failed to fetch taxonomies: ${response.statusText}`);
            }

            const taxonomies = await response.json();
            
            setTaxonomies(taxonomies);
        } catch (error) {
            console.error('Error fetching taxonomies:', error);
        }
    };
    
    const getBirdObservations = async (bird: string) => {
        if (!bird ||!mapCenter.lat || !mapCenter.lng) return;

        let observations = [];
        try {
            const response = await fetch(`/api/ebirdObservations?bird=${bird}&lat=${mapCenter.lat}&lng=${mapCenter.lng}`);
            observations = await response.json();
        } catch (error) {
            console.error(error);
            return {};
        }
        setObservations(observations);
    };
    
    const handleSearch = async (bird: string) => {
        getBirdObservations(bird);
    };

    useEffect(() => {
        fetchBirds(lat.toString(), lng.toString());  
    }, [lat, lng]);

    useEffect(() => {
        const speciesCodes = Object.values(birds);
        if (speciesCodes.length > 0) {
            fetchTaxonomies(speciesCodes);
        }
    }, [birds]);

    useEffect(() => {
        getBirdObservations(species as string);
    }, [species]);
    
    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <div style={{ flex: 2, paddingRight: '20px' }}>
                <SearchBox onSearch={handleSearch} />
                <SearchResults results={observations.slice(0, 10).sort((a: Result, b: Result) => {
                    const aObsDt = Date.parse(a.obsDt);
                    const bObsDt = Date.parse(b.obsDt);
                    if (bObsDt !== aObsDt) {
                        return bObsDt - aObsDt;
                    }
                    return b.howMany - a.howMany;
                })} setHoveredResultId={setHoveredResultId} />
            </div>
            <div style={{ flex: 3, position: 'relative', height: '100vh' }}>
                <Map lat={mapCenter.lat} lng={mapCenter.lng} results={observations} hoveredResultId={hoveredResultId} onMoveEnd={setMapCenter} />
            </div>
        </div>
    );
};

export default HomePage;