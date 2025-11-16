import React, { useContext, useState, useEffect } from 'react';

import { ebirdObservationSearch } from '../lib/ebird';
import { BirdContext } from '../contexts/BirdContext';

interface SearchBoxProps {
    onSearch: (bird: string) => void;
    lat: number;
    lng: number;
}

const SearchBox: React.FC<SearchBoxProps> = ({ onSearch, lat, lng }) => {
    const { birds, setBirds } = useContext(BirdContext);
    const [bird, setBird] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [taxonomies, setTaxonomies] = useState<Record<string, string>>({});

    const fetchTaxonomies = async (speciesCodes: string[]) => {
        try {
            const response = await fetch(`/api/taxonomy?speciesCodes=${speciesCodes.join(',')}`);

            if (!response.ok) {
                throw new Error(`Failed to fetch taxonomies: ${response.statusText}`);
            }

            const taxonomies = await response.json();
            
            setTaxonomies(taxonomies);
        } catch (error) {
            console.error('Error fetching taxonomies:', error);
        }
    };

    useEffect(() => {
        ebirdObservationSearch(lat.toString(), lng.toString()).then((observations) => {
            setBirds(observations.reduce((acc: Record<string, string>, obs: any) => {
                acc[obs.comName.toLowerCase()] = obs.speciesCode;
                return acc;
            }, {}));
        });
    }, [lat, lng]);

    useEffect(() => {
        const speciesCodes = Object.values(birds);
        if (speciesCodes.length > 0) {
            fetchTaxonomies(speciesCodes);
        }
    }, [birds]);

    useEffect(() => {
        if (bird.length > 0) {
            const filteredSuggestions = Object.keys(birds).filter(suggestion =>
                suggestion.toLowerCase().includes(bird.toLowerCase())
            ).sort();
            
            if (bird.length > 4 && taxonomies[birds[filteredSuggestions[0]]]) {
                const firstFamily = taxonomies[birds[filteredSuggestions[0]]];
                filteredSuggestions.push(...Object.keys(birds).filter(suggestion =>
                    !filteredSuggestions.includes(suggestion)
                    && taxonomies[birds[suggestion]] === firstFamily
                ).slice(0, 4 - (filteredSuggestions.length > 1 ? 1 : 0)));
            }

            setSuggestions(filteredSuggestions);
        } else {
            setSuggestions([]);
        }
    }, [bird]);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        onSearch(birds[bird]);
        setBird('');
        setSuggestions([]);
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={bird}
                    onChange={(e) => setBird(e.target.value)}
                    placeholder="Search for birds..."
                />
                <button type="submit">Search</button>
            </form>

            {suggestions.length > 0 && (
                <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                    {suggestions.map((suggestion, index) => (
                        <li
                            key={index}
                            onClick={() => {
                                setBird(suggestion);
                                setSuggestions([]);
                            }}
                            style={{
                                cursor: 'pointer',
                                padding: '4px 8px',
                                backgroundColor: '#f0f0f0',
                                marginTop: '2px'
                            }}
                        >
                            {suggestion}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SearchBox;
