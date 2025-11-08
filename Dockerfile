FROM node:20
FROM mcr.microsoft.com/playwright:v1.56.1-noble AS playwright

WORKDIR /app
COPY package*.json ./
COPY src/ ./src/
COPY tsconfig.json ./
COPY empty.js ./
COPY global.d.ts ./
COPY next-env.d.ts ./
COPY next.config.js ./
COPY .env ./

RUN npm install

RUN npm run build

ENV PATH /app/node_modules/.bin:$PATH

EXPOSE 3000

CMD [ "npm", "start" ]
