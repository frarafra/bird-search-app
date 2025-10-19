import React from 'react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <header>
                <h1>Bird Search App</h1>
            </header>
            <main>{children}</main>
            <footer>
                <p>&copy; {new Date().getFullYear()} Bird Search App</p>
            </footer>
        </div>
    );
};

export default Layout;