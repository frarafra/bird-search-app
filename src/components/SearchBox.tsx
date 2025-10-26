import React, { useState, useEffect } from 'react';

import { ebirdObservationSearch, ebirdTaxonomySearch } from '../app/api/ebird';

interface SearchBoxProps {
    onSearch: (bird: string) => void;
    lat: number;
    lng: number;
}

const SearchBox: React.FC<SearchBoxProps> = ({ onSearch, lat, lng }) => {
    const [bird, setBird] = useState('');
    const [observations, setObservations] = useState<Record<string, string>>({});
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [taxonomies, setTaxonomies] = useState<Record<string, string>>({});

    useEffect(() => {
        ebirdObservationSearch(lat.toString(), lng.toString()).then((observations) => {
            setObservations(observations.reduce((acc: any, obs: any) => {
                acc[obs.comName.toLowerCase()] = obs.speciesCode;
                return acc;
            }, {}));
        });
    }, [lat, lng]);

    useEffect(() => {
        const speciesCodes = Object.values(observations);

        if (speciesCodes.length > 0) {
            const taxonomyData = ebirdTaxonomySearch(speciesCodes);
            setTaxonomies(taxonomyData);
        }
    }, [observations]);

    useEffect(() => {
        if (bird.length > 0) {
            const filteredSuggestions = Object.keys(observations).filter(suggestion =>
                suggestion.toLowerCase().includes(bird.toLowerCase())
            ).sort();
            
            if (bird.length > 4 && taxonomies[observations[filteredSuggestions[0]]]) {
                const firstFamily = taxonomies[observations[filteredSuggestions[0]]];
                filteredSuggestions.push(...Object.keys(observations).filter(suggestion =>
                    !filteredSuggestions.includes(suggestion)
                    && taxonomies[observations[suggestion]] === firstFamily
                ).slice(0, 4 - (filteredSuggestions.length > 1 ? 1 : 0)));
            }

            setSuggestions(filteredSuggestions);
        } else {
            setSuggestions([]);
        }
    }, [bird]);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        onSearch(observations[bird]);
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
