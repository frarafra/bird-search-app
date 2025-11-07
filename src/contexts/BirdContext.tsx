import { createContext, FC, ReactNode, useState } from 'react';

interface BirdContextType {
    birds: Record<string, string>;
    setBirds: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    mapCenter: {
        lat: number;
        lng: number;
    };
    setMapCenter: React.Dispatch<React.SetStateAction<{
        lat: number;
        lng: number;
    }>>;
}

export const BirdContext = createContext<BirdContextType>({
    birds: {},
    setBirds: () => {},
    mapCenter: {
        lat: parseFloat(process.env.NEXT_PUBLIC_LAT || '0'),
        lng: parseFloat(process.env.NEXT_PUBLIC_LNG || '0')
    },
    setMapCenter: () => {}
});

interface BirdProviderProps {
    children: ReactNode;
}

export const BirdProvider: FC<BirdProviderProps> = ({ children }) => {
    const [birds, setBirds] = useState<Record<string, string>>({});
    const [mapCenter, setMapCenter] = useState<{
        lat: number;
        lng: number;
    }>({
        lat: parseFloat(process.env.NEXT_PUBLIC_LAT || '0'),
        lng: parseFloat(process.env.NEXT_PUBLIC_LNG || '0')
    });

    return (
        <BirdContext.Provider value={{ birds, setBirds, mapCenter, setMapCenter }}>
            {children}
        </BirdContext.Provider>
    );
};