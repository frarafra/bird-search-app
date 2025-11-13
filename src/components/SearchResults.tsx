import React from 'react';

import { Result } from '../types';

interface SearchResultsProps {
    results: Array<Result>;
    setHoveredResultId: (id: number | null) => void;
}

export const EBIRD_SPECIES_URL = 'https://ebird.org/species/';

const SearchResults: React.FC<SearchResultsProps> = ({ results, setHoveredResultId }) => {
    return (
        <div>
            {results.length > 0 && (
                <h4>
                    Search Results for{' '}
                    <a href={`${EBIRD_SPECIES_URL}${results[0].speciesCode}`} target="_blank" rel="noopener noreferrer">
                        {results[0].comName}
                    </a>
                </h4>
            )}
            <ul>
                {results.map(result => (
                    <li
                        key={result.subId}
                        onMouseEnter={() => setHoveredResultId(result.subId)}
                        onMouseLeave={() => setHoveredResultId(null)}
                    >                        
                        <h5>{result.locName}</h5>
                        <p>{result.obsDt}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SearchResults;