FROM node:slim

WORKDIR /app

# Running from repo root
COPY package.json package-lock.json ./

COPY server/package.json ./server/
COPY shared/package.json ./shared/

RUN npm install --workspace=server

COPY server ./server
COPY shared ./shared

RUN npm run build:server

CMD ["npm", "run", "start:server"]

EXPOSE 3000
