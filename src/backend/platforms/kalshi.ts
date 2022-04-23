/* Imports */
import axios from "axios";

import { calculateStars } from "../utils/stars";
import { FetchedQuestion, Platform } from "./";

/* Definitions */
const platformName = "kalshi";
let jsonEndpoint = "https://trading-api.kalshi.com/v1/cached/markets/"; //"https://subgraph-matic.poly.market/subgraphs/name/TokenUnion/polymarket"//"https://subgraph-backup.poly.market/subgraphs/name/TokenUnion/polymarket"//'https://subgraph-matic.poly.market/subgraphs/name/TokenUnion/polymarket3'

async function fetchAllMarkets() {
  // for info which the polymarket graphql API
  let response = await axios
    .get(jsonEndpoint)
    .then((response) => response.data.markets);
  // console.log(response)
  return response;
}

async function processMarkets(markets) {
  let dateNow = new Date().toISOString();
  // console.log(markets)
  markets = markets.filter((market) => market.close_date > dateNow);
  let results = await markets.map((market) => {
    const probability = market.last_price / 100;
    const options = [
      {
        name: "Yes",
        probability: probability,
        type: "PROBABILITY",
      },
      {
        name: "No",
        probability: 1 - probability,
        type: "PROBABILITY",
      },
    ];
    const id = `${platformName}-${market.id}`;
    const result: FetchedQuestion = {
      id,
      title: market.title.replaceAll("*", ""),
      url: `https://kalshi.com/markets/${market.ticker_name}`,
      platform: platformName,
      description: `${market.settle_details}. The resolution source is: ${market.ranged_group_name} (${market.settle_source_url})`,
      options,
      qualityindicators: {
        stars: calculateStars(platformName, {
          shares_volume: market.volume,
          interest: market.open_interest,
        }),
        yes_bid: market.yes_bid,
        yes_ask: market.yes_ask,
        spread: Math.abs(market.yes_bid - market.yes_ask),
        shares_volume: market.volume, // Assuming that half of all buys are for yes and half for no, which is a big if.
        // "open_interest": market.open_interest, also in shares
      },
    };
    return result;
  });
  //console.log(results.length)
  // console.log(results.map(result => result.title))
  // console.log(results.map(result => result.title).length)
  console.log([...new Set(results.map((result) => result.title))]);
  console.log(
    "Number of unique questions: ",
    [...new Set(results.map((result) => result.title))].length
  );
  // console.log([...new Set(results.map(result => result.title))].length)
  return results; //resultsProcessed
}

export const kalshi: Platform = {
  name: platformName,
  label: "Kalshi",
  color: "#615691",
  fetcher: async function () {
    let markets = await fetchAllMarkets();
    return await processMarkets(markets);
  },
};
