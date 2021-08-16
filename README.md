## What this is 

This is a set of libraries and a command line interface that fetches probabilities/forecasts from prediction markets and forecasting platforms. 

These forecasts are then used to power a search engine for probabilities, which can be found [here](https://metaforecast.org/) (try searching "Trump", "China" or "Semiconductors") (source code [here](https://github.com/QURIresearch/metaforecast-website-nextjs)). I also provide a datatabase, which can be accessed with a script similar to [this one](https://github.com/QURIresearch/metaforecasts/blob/master/src/utils/manualDownloadFromMongo.js).

I also created a search engine using Elicit's IDE, which uses GPT-3 to deliver vastly superior semantic search (as opposed to fuzzy word matching). If you have access to the Elicit IDE, you can use the action "Search Metaforecast database". However, I'm not currently updating it regularly.

![](./metaforecasts.png)

## How to run

### 1. Download this repository

``git clone https://github.com/QURIresearch/metaforecasts``

### 2. Enter your own process.env variables
The following variables are currently needed to run the `master` branch:
- `MONGODB_URL`, a string in the format `"mongodb+srv://<username>:<password>@<mongodburl>/?retryWrites=true&w=majority&useNewUrlParser=true&useUnifiedTopology=true"`
- `REBUIDNETLIFYHOOKURL`, a string in the format `"https://api.netlify.com/build_hooks/someprivatestring"`
- `CSETFORETELL_COOKIE`
- `GOODJUDGMENTOPENCOOKIE`
- `HYPERMINDCOOKIE`
- `ALGOLIA_MASTER_API_KEY`, a string of 32 alphanumeric characters, like `6ofolyptm956j9uuev3q4v81vjbqrkp2` (not an actual key)

They can either be stored as process variables (e.g., something that can be accessed as `process.env.<variable name>`), or as text in `src/input/privatekeys.json`, in the same format as `src/input/privatekeys_example.json`.  
- Some of these are just session cookies, necessary to query CSET-foretell, Good Judgment Open and Hypermind. You can get these cookies by creating an account in said platforms and then making and inspecting a request (e.g., by making a prediction, or browsing questions).
- Others interface with services, e.g., to access the MongoDB database I'm using to save data and history, or to renew the algolia database. You can get these keys by creating an account with those services.

Note that not all of these cookies are needed to use all parts of the source code. For instance, to download Polymarket data, one could just interface with the polymarket code. In particular, the code in this repository contains code to with the mongo database using read permissions, which are freely available.

### 3. Actually run

```
$ git clone https://github.com/QURIresearch/metaforecasts
$ cd metaforecasts
$ npm install
$ npm run start
```

`npm run start` presents the user with choices; if you would like to skip each step, use the option number instead, e.g., `npm run start 14`

### 4. Example: download the metaforecasts database

```
$ git clone https://github.com/QURIresearch/metaforecasts
$ cd metaforecasts
$ npm install
$ node src/utils/manualDownload.js
```

## What are "stars" and how are they computed

Star ratings—e.g. ★★★☆☆—are an indicator of the quality of an aggregate forecast for a question. These ratings currently try to reflect my own best judgment and the best judgment of forecasting experts I've asked, based on our collective experience forecasting on these platforms. Thus, stars have a strong subjective component which could be formalized and refined in the future. You can see the code used to decide how many stars to assign [here](https://github.com/QURIresearch/metaforecasts/blob/master/src/stars.js)

With regards the quality, I am most uncertain about Smarkets, Hypermind, Ladbrokes and WilliamHill, as I haven't used them as much. Also note that, whatever other redeeming features they might have, prediction markets rarely go above 95% or below 5%.

## Various notes

- Right now, I'm fetching only a couple of common properties, such as the title, url, platform, whether a question is binary (yes/no), its percentage, and the number of forecasts. 
- For elicit and metaculus, this library currently filters questions with <10 predictions.
- Omen *does* have very few active predictions at the moment; this is not a mistake.
- Hypermind fetching is currently incomplete.
