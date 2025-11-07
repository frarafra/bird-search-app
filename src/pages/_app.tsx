import React from 'react';
import type { AppProps } from 'next/app';
import MainLayout from '../layouts/MainLayout';
import { BirdProvider } from '../contexts/BirdContext';

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <BirdProvider>
            <MainLayout>
                <Component {...pageProps} />
            </MainLayout>
        </BirdProvider>
    );
}

export default MyApp;