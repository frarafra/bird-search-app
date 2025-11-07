import React, { FC } from 'react';
import Link from 'next/link';

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: FC<MainLayoutProps> = ({ children }) => (
    <div>
        <header style={{ backgroundColor: '#f8f9fa', padding: '1rem' }}>
            <nav>
                <ul style={{ listStyleType: 'none', display: 'flex', gap: '2rem' }}>
                    <li><Link href="/">Search</Link></li>
                    <li><Link href="/birds">Bird List</Link></li>
                </ul>
            </nav>
        </header>

        <main style={{ padding: '1rem' }}>
            {children}
        </main>
    </div>
);

export default MainLayout;