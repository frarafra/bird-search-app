FROM node:20
FROM mcr.microsoft.com/playwright:focal AS playwright

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY src/ ./src/
COPY tsconfig.json ./
COPY empty.js ./
COPY global.d.ts ./
COPY next-env.d.ts ./
COPY next.config.js ./
COPY .env ./

RUN mkdir -p /app/public/markers
COPY node_modules/leaflet/dist/images/marker-icon.png ./public/markers/marker-icon.png

RUN npm run build

ENV PATH /app/node_modules/.bin:$PATH

EXPOSE 3000

CMD [ "npm", "start" ]
