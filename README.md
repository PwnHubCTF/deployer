## Installation
### From source, with docker for Redis and MySQL (DEV)

- You need docker & docker-compose
- Copy and paste .env.example, to create a .env file `cp .env.example .env`
- Populate env file
  - GITHUB_TOKEN is needed in order to pull private repositories
- Then, run `docker compose -f .\docker-compose.yml up -d `, to create a redis and a mysql docker
- Install dependencies `npm install`
- You can now start NestJS app `npm run start:dev`

### For production, with docker

- You need docker & docker-compose
- Copy and paste .env.example, to create a .env file `cp .env.example .env`
- Populate env file
  - GITHUB_TOKEN is needed in order to pull private repositories
- run `docker compose up -d `

/!\ If `docker compose` doesn't works, try `docker-compose`

# Usage

In dev mode, you can go to `http://localhost:3000/api` to test API routes (set the token in Authorize, on web page)

This project is an API to deploy a docker compose stack, from a github URL

Most important route is

`POST /instance`

Body:
```json
{
  "githubUrl": "string",
  "owner": "string",
}
```
githubUrl must point to a folder, containing the project.
ex: https://github.com/USER/REPO/tree/main/prog/basicChall

# Challenge folder configuration

And a docker-compose.yml file for your challenge, with only *ONE* binded random port

```yaml
version: "3.3"
services:
  mychall:
    ports:
      - "7000"
```
