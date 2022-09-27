## Installation

### With docker

You need docker compose

`docker-compose up -d`

### From source

You need to install redis first.

If you have docker, you can simply do:

`docker run -d -p 6379:6379 --name myredis`

Then, copy and paste .env.example, to create a .env file

`cp .env.example .env`

You can now start NestJS app

`npm install`

`npm run start:dev`