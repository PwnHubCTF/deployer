## Installation
### From source, with docker for Redis and MySQL

- You need docker & docker-compose
- Copy and paste .env.example, to create a .env file `cp .env.example .env`
- Then, run `docker-compose up -d `, to create a redis and a mysql docker
- Populate env file
  - GITHUB_TOKEN is needed in order to pull private repositories
- Install dependencies `npm install`
- You can now start NestJS app `npm run start:dev`

# Usage

In dev mode, you can go to `http://localhost:3000/api` to test API routes

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
