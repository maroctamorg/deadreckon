FROM node:22-slim AS build-stage

WORKDIR /usr/src/app

COPY . .

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm test

RUN npm run build

FROM nginx:1.25-alpine

COPY --from=build-stage /usr/src/app/dist /usr/share/nginx/html
