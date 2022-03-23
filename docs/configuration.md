# Configuration

All configuration is done through environment variables.

Not all of these are necessary to run the code. The most important ones are:

- `DIGITALOCEAN_POSTGRES` pointing to the working Postgres database
- `NEXT_PUBLIC_SITE_URL` for the frontend to work properly

There's also a template configuration file in `../env.example`.

## Database endpoints

- `DIGITALOCEAN_POSTGRES`, of the form `postgres://username:password@domain.com:port/configvars`. (Disregard `DIGITALOCEAN_` prefix, you can use any endpoint you like).
- `DIGITALOCEAN_POSTGRES_PUBLIC`
- `MONGODB_URL`, a string in the format `"mongodb+srv://<username>:<password>@<mongodburl>/?retryWrites=true&w=majority&useNewUrlParser=true&useUnifiedTopology=true"` (No longer really needed, superseded by Postgres).
- `ALGOLIA_MASTER_API_KEY`, a string of 32 hexidecimal characters, like `19b6c2234e50c98d30668659a39e3127` (not an actual key).

## Platform cookies and keys

Most of these are just session cookies, necessary to query INFER (previously CSET Foretell), Good Judgment Open and Hypermind (Hypermind is now deprecated). You can get these cookies by creating an account in said platforms and then making and inspecting a request (e.g., by making a prediction, or browsing questions).

Note that not all of these cookies are needed to use all parts of the source code. For instance, to download Polymarket data, one could just interface with the Polymarket code. In particular, the code in this repository contains code to with the mongo database using read permissions, which are freely available.

- `GOODJUDGEMENTOPENCOOKIE`
- `INFER_COOKIE`
- `CSETFORETELL_COOKIE`, deprecated, superseded by `INFER_COOKIE`.
- `HYPERMINDCOOKIE`
- `GOOGLE_API_KEY`, necessary to fetch Peter Wildeford's predictions.
- `SECRET_BETFAIR_ENDPOINT`

## Configuration flags

- `POSTGRES_NO_SSL`, can be set to a non-empty value to disable SSL; can be useful for local development.
- `DEBUG_MODE`, usually `off`, which controls log verbosity.

## Others

- `NEXT_PUBLIC_SITE_URL`, e.g., `http://localhost:3000` if you're running a local instance
- `REBUIDNETLIFYHOOKURL`
- `BACKUP_PROXY_IP`
- `BACKUP_PROXY_PORT`

# Old doc

- Others interface with services, e.g., to access the MongoDB database I'm using to save data and history, or to renew the algolia database. You can get these keys by creating an account with those services.

Overall, the services which we use are:

- Algolia for search
- Netlify for frontend deployment
- Heroku and DigitalOcean for backend deployment
- Postgres and Mongo for databases
