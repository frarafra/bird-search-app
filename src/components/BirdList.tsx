'use client';

import React, { FC, useEffect, useState } from 'react';

interface BirdData {
    name: string;
    imageUrl: string;
}

interface BirdListProps {
    birds: Record<string, string>;
}

const BirdList: FC<BirdListProps> = ({ birds }) => {
    const [birdData, setBirdData] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(0);
    const batchSize = 8;

    useEffect(() => {
        let isMounted = true;

        const fetchImages = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/ebirdImages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(birds)
                });
                console.log('response', response);

                if (!response.ok) throw new Error('Failed to fetch images');

                const data = await response.json();
                if (isMounted) {
                    setBirdData(data.reduce((acc: Record<string, string>, bird: BirdData) => {
                        acc[bird.name] = bird.imageUrl;
                        return acc;
                    }, {}));
                }
                
            } catch (error) {
                console.error('Error fetching images:', error);
            }
            setIsLoading(false);
        };

        fetchImages();

        return () => {
            isMounted = false;
        };
    }, [birds]);

    const loadMore = () => {
        if (!isLoading && page < Math.ceil(Object.keys(birds).length / batchSize)) {
            setPage(prevPage => prevPage + 1);
        }
    };

    const birdNames = Object.keys(birdData);

    return (
        <div>
            <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                {birdNames.slice(0, (page + 1) * batchSize).map((name) => {
                    const birdImageUrl = birdData[name];
                    return (
                        <li key={name} style={{
                            cursor: 'default',
                            padding: '4px 8px',
                            backgroundColor: '#f5f5f5',
                            marginTop: '2px',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            {birdImageUrl && (
                                <img src={birdImageUrl} alt={`${name}`} style={{ width: '40px', height: 'auto', marginRight: '8px' }} />
                            )}
                            {name}
                        </li>
                    );
                })}
            </ul>
            {isLoading && <p>Loading...</p>}
            <button onClick={loadMore} disabled={isLoading || page >= Math.ceil(Object.keys(birds).length / batchSize)}>
                Load More
            </button>
        </div>
    );
};

export default BirdList;