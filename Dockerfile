FROM node:18-alpine

RUN apk add --no-cache git docker docker-compose
 
WORKDIR /user/src/app
 
COPY . .
 
RUN npm ci --omit=dev
 
RUN npm run build
 
USER node
 
CMD ["npm", "run", "start:prod"]