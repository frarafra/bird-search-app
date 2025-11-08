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

    const fetchBatchImages = async (batch: Record<string, string>) => {
        try {
            const response = await fetch('/api/ebirdImages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(batch),
            });

            if (!response.ok) throw new Error('Failed to fetch images');

            const data = await response.json();
            setBirdData(prev => ({
                ...prev,
                ...data.reduce((acc: Record<string, string>, bird: BirdData) => {
                    acc[bird.name] = bird.imageUrl;
                    return acc;
                }, {}),
            }));
        } catch (error) {
            console.error('Error fetching images:', error);
        }
    };

    useEffect(() => {
        if (Object.keys(birds).length > 0 && page < Math.ceil(Object.keys(birds).length / batchSize)) {
            const currentBatch = Object.entries(birds)
                .slice(page * batchSize, (page + 1) * batchSize)
                .reduce((acc: Record<string, string>, [name, code]) => {
                    acc[name] = code;
                    return acc;
                }, {});

            setIsLoading(true);
            fetchBatchImages(currentBatch).finally(() => setIsLoading(false));
        }
    }, [page]);

    const loadMore = () => {
        if (!isLoading && page < Math.ceil(Object.keys(birds).length / batchSize)) {
            setPage(prevPage => prevPage + 1);
        }
    };

    const birdNames = Object.keys(birdData);

    return (
        <div>
            <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                {birdNames.map((name) => {
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