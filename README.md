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

They can either be stored as process variables (e.g., something that can be accessed as `process.env.<variable name>`), or as text in `src/input/privatekeys.json`, in the same format as `src/input/privatekeys_example.json`. These session cookies are necessary to query CSET-foretell, Good Judgment Open and Hypermind, and to access the MongoDB database I'm using to save data and history. You can get these cookies by creating an account in said platforms and then making and inspecting a request (e.g., by making a prediction, or browsing questions). After doing this, you should create the environment variables.

### 3. Actually run

From the top level directory, enter: `npm run start`

## What are "stars" and how are they computed

Star ratings—e.g. ★★★☆☆—are an indicator of the quality of an aggregate forecast for a question. These ratings currently try to reflect my own best judgment and the best judgment of forecasting experts I've asked, based on our collective experience forecasting on these platforms. Thus, stars have a strong subjective component which could be formalized and refined in the future. You can see the code used to decide how many stars to assign [here](https://github.com/QURIresearch/metaforecasts/blob/master/src/stars.js)

With regards the quality, I am most uncertain about Smarkets, Hypermind, Ladbrokes and WilliamHill, as I haven't used them as much. Also note that, whatever other redeeming features they might have, prediction markets rarely go above 95% or below 5%.

## Various notes

- Right now, I'm fetching only a couple of common properties, such as the title, url, platform, whether a question is binary (yes/no), its percentage, and the number of forecasts. However, the code contains more fields commented out, such as trade volume, liquidity, etc. 
- A note as to quality: Tentatively, Good Judgment >> Good Judgment Open ~ Metaculus > CSET > PredictIt ~> Polymarket >> Elicit > Omen. 
- I'm not really sure where Hypermind falls in that spectrum.
- For elicit and metaculus, this library currently filters questions with <10 predictions.
- Omen *does* have very few active predictions at the moment; this is not a mistake. 
