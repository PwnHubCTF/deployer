## Installation

### With docker

You need docker compose

`docker-compose up -d`

### From source

You need to install redis first.

If you have docker, you can simply do:

`docker run -d -p 6379:6379`

You need a DB, you can deploy a mysql docker for this

Then, copy and paste .env.example, to create a .env file

`cp .env.example .env`

You can now start NestJS app

`npm install`

`npm run start:dev`

# Usage

This project is an API to deploy a docker compose stack, from a github URL

Most important route is

`POST /instance`

Body:
```json
{
  "githubUrl": "string",
  "owner": "string",
  "team": "string"
}
```
githubUrl must point to a folder, containing the project.
ex: https://github.com/USER/REPO/tree/main/prog/basicChall


The folder need to have a config.yaml file, with at least an ID for the project

```yaml
id: prog-my_chall
```

And a docker-compose.yml file, with only ONE binded random port

```yaml
version: "3.3"
services:
  mychall:
    build:
      context: .
    ports:
      - ":7000"
```
