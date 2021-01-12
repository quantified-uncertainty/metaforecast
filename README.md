## How to use your own cookies
Private session cookies are necessary to query CSET-foretell and Good Judgment Open. You can get said cookies by creating an account in said platforms and then making and inspecting a request (e.g., by making a prediction). After doing this, you should create a `src/privatekeys.json`, in the same format as `src/privatekeys_example.json`

## How to run

From the top level directory, enter: `npm run start`

## Various notes

- This will eventually be a webpage where users can just search for keywords and obtain forecasts related to those keywords. For example, by searching "Trump" and get probabilities related to various scenarios involving him. 
- A demo of this functionality can be found [here](https://www.loki.red/metaforecasts/), the database can be found [here](https://www.loki.red/metaforecasts/data/), and a csv with the raw data [here](https://www.loki.red/metaforecasts/merged-questions.csv).
- These probabilities could then be rated and annotated, e.g., prediction markets rarely go above 95% or below 5%. 
- For elicit and metaculus, this library currently filters questions with <10 predictions
