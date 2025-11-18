import React, { useContext } from 'react';
import BirdList from '../components/BirdList';
import { BirdContext } from '../contexts/BirdContext';

const BirdsPage = () => {
    const { birds, taxonomies } = useContext(BirdContext);

    return (
        <div>
            {Object.keys(birds).length > 0 && <BirdList birds={birds} taxonomies={taxonomies} />}
        </div>
    );
};

export default BirdsPage;