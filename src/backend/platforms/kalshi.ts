/* Imports */
import axios from "axios";

import { average } from "../../utils";
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
    const options: FetchedQuestion["options"] = [
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
      description: `${market.settle_details}. The resolution source is: ${market.ranged_group_name} (${market.settle_source_url})`,
      options,
      qualityindicators: {
        yes_bid: market.yes_bid,
        yes_ask: market.yes_ask,
        spread: Math.abs(market.yes_bid - market.yes_ask),
        shares_volume: market.volume, // Assuming that half of all buys are for yes and half for no, which is a big if.
        // "open_interest": market.open_interest, also in shares
      },
      extra: {
        open_interest: market.open_interest,
      },
    };
    return result;
  });

  console.log([...new Set(results.map((result) => result.title))]);
  console.log(
    "Number of unique questions: ",
    [...new Set(results.map((result) => result.title))].length
  );

  return results;
}

export const kalshi: Platform = {
  name: platformName,
  label: "Kalshi",
  color: "#615691",
  fetcher: async function () {
    let markets = await fetchAllMarkets();
    return await processMarkets(markets);
  },
  calculateStars(data) {
    let nuno = () =>
      ((data.extra as any)?.open_interest || 0) > 500 &&
      data.qualityindicators.shares_volume > 10000
        ? 4
        : data.qualityindicators.shares_volume > 2000
        ? 3
        : 2;
    // let eli = (data) => data.interest > 10000 ? 5 : 4
    // let misha = (data) => 4
    let starsDecimal = average([nuno()]); //, eli(data), misha(data)])

    // Substract 1 star if probability is above 90% or below 10%
    if (
      data.options instanceof Array &&
      data.options[0] &&
      ((data.options[0].probability || 0) < 0.1 ||
        (data.options[0].probability || 0) > 0.9)
    ) {
      starsDecimal = starsDecimal - 1;
    }

    let starsInteger = Math.round(starsDecimal);
    return starsInteger;
  },
};
