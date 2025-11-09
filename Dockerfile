FROM node:20
FROM mcr.microsoft.com/playwright:focal AS playwright

WORKDIR /app

COPY package*.json ./

RUN npm install && npm run postinstall

COPY src/ ./src/
COPY public/ ./public/
COPY tsconfig.json ./
COPY empty.js ./
COPY global.d.ts ./
COPY next-env.d.ts ./
COPY next.config.js ./
COPY .env ./

RUN npm run build

ENV PATH /app/node_modules/.bin:$PATH

EXPOSE 3000

CMD [ "npm", "start" ]
