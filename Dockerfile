FROM node:18-alpine

RUN apk add --no-cache git docker docker-compose
WORKDIR /home/node

COPY . /home/node/

RUN npm i

RUN npm run build
RUN adduser node docker
RUN chmod 0755 /var/run/
# USER node