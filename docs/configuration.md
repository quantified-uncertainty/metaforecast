# Configuration

All configuration is done through environment variables.

Not all of these are necessary to run the code. The most important ones are:

- `DIGITALOCEAN_POSTGRES` pointing to the working Postgres database

Environment for production deployments is configured through Terraform, see [infra.md](./infra.md) for details.

For local development you can write `.env` file by hand or import it from Heroku with `heroku config -s -a metaforecast-backend` and then modify accordingly.

There's also a template configuration file in `../env.example`.

## Database endpoints

- `DIGITALOCEAN_POSTGRES`, of the form `postgres://username:password@domain.com:port/configvars`. (Disregard `DIGITALOCEAN_` prefix, you can use any endpoint you like).
- `ALGOLIA_MASTER_API_KEY`, a string of 32 hexidecimal characters, like `19b6c2234e50c98d30668659a39e3127` (not an actual key).
- `NEXT_PUBLIC_ALGOLIA_APP_ID`,
- `NEXT_PUBLIC_ALGOLIA_SEARCH_KEY`

## Platform cookies and keys

Most of these are just session cookies, necessary to query INFER (previously CSET Foretell), Good Judgment Open and Hypermind (Hypermind is now deprecated). You can get these cookies by creating an account in said platforms and then making and inspecting a request (e.g., by making a prediction, or browsing questions).

Note that not all of these cookies are needed to use all parts of the source code. For instance, to download Polymarket data, one could just interface with the Polymarket code. In particular, the code in this repository contains code to connect with the postgres database using read permissions, which are freely available.

- `GOODJUDGMENTOPENCOOKIE`
- `INFER_COOKIE`
- `HYPERMINDCOOKIE`
- `GOOGLE_API_KEY`, necessary to fetch Peter Wildeford's predictions.
- `SECRET_BETFAIR_ENDPOINT`

## Configuration flags

- `POSTGRES_NO_SSL`, can be set to a non-empty value to disable SSL; can be useful for local development.
- `DEBUG_MODE`, usually `off`, which controls log verbosity.

## Others

- `BACKUP_PROXY_IP`
- `BACKUP_PROXY_PORT`
