# Bird Search App

## Overview
The Bird Search App is a Next.js application that allows users to search for bird species using the eBird API. It features a search box for user input and displays the search results in a list format and in a map.

## Project Structure
```
bird-search-app
├── src
│   ├── app
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components
│   │   ├── Map.tsx
│   │   ├── SearchBox.tsx
│   │   └── SearchResults.tsx
│   ├── lib
│   │   └── api.ts
│   └── types
│       └── index.ts
├── package.json
├── next.config.js
├── tsconfig.json
└── README.md
```

## Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```bash
   cd bird-search-app
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```

## Usage
To start the development server, run:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000` to view the application.

## Features
- Search for bird species using the eBird API.
- Display search results in a user-friendly format.

## License
This project is licensed under the MIT License.
