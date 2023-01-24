FROM node:18-alpine

RUN apk add --no-cache git docker docker-compose

WORKDIR /user/src/app

COPY . .

RUN npm i

# RUN npm run build