import axios from "axios";

import { QuestionOption } from "../../common/types";
import { average } from "../../utils";
import { FetchedQuestion, Platform } from "./";

/* Definitions */
const platformName = "smarkets";
let htmlEndPointEntrance = "https://api.smarkets.com/v3/events/";
let VERBOSE = false;

/* Support functions */

async function fetchEvents(url: string) {
  const response = await axios({
    url: htmlEndPointEntrance + url,
    method: "GET",
  }).then((res) => res.data);
  VERBOSE && console.log(response);
  return response;
}

async function fetchMarkets(eventid: string) {
  const response = await axios({
    url: `https://api.smarkets.com/v3/events/${eventid}/markets/`,
    method: "GET",
  })
    .then((res) => res.data)
    .then((res) => res.markets);
  return response;
}

async function fetchContracts(marketid: string) {
  const response = await axios({
    url: `https://api.smarkets.com/v3/markets/${marketid}/contracts/`,
    method: "GET",
  }).then((res) => res.data);
  VERBOSE && console.log(response);

  if (!(response.contracts instanceof Array)) {
    throw new Error("Invalid response while fetching contracts");
  }
  return response.contracts as any[];
}

async function fetchPrices(marketid: string) {
  const response = await axios({
    url: `https://api.smarkets.com/v3/markets/${marketid}/last_executed_prices/`,
    method: "GET",
  }).then((res) => res.data);
  VERBOSE && console.log(response);
  if (!response.last_executed_prices) {
    throw new Error("Invalid response while fetching prices");
  }
  return response.last_executed_prices;
}

export const smarkets: Platform = {
  name: platformName,
  label: "Smarkets",
  color: "#6f5b41",
  async fetcher() {
    let htmlPath =
      "?state=new&state=upcoming&state=live&type_domain=politics&type_scope=single_event&with_new_type=true&sort=id&limit=50";

    let events = [];
    while (htmlPath) {
      const data = await fetchEvents(htmlPath);
      events.push(...data.events);
      htmlPath = data.pagination.next_page;
    }
    VERBOSE && console.log(events);

    let markets = [];
    for (const event of events) {
      VERBOSE && console.log(Date.now());
      VERBOSE && console.log(event.name);

      let eventMarkets = await fetchMarkets(event.id);
      eventMarkets = eventMarkets.map((market: any) => ({
        ...market,
        // smarkets doesn't have separate urls for different markets in a single event
        // we could use anchors (e.g. https://smarkets.com/event/886716/politics/uk/uk-party-leaders/next-conservative-leader#contract-collapse-9815728-control), but it's unclear if they aren't going to change
        slug: event.full_slug,
      }));
      VERBOSE && console.log("Markets fetched");
      VERBOSE && console.log(event.id);
      VERBOSE && console.log(eventMarkets);
      markets.push(...eventMarkets);
    }
    VERBOSE && console.log(markets);

    let results = [];
    for (let market of markets) {
      VERBOSE && console.log("================");
      VERBOSE && console.log("Market: ", market);

      let contracts = await fetchContracts(market.id);
      VERBOSE && console.log("Contracts: ", contracts);
      let prices = await fetchPrices(market.id);
      VERBOSE && console.log("Prices: ", prices[market.id]);

      let optionsObj: {
        [k: string]: QuestionOption;
      } = {};

      const contractIdToName = Object.fromEntries(
        contracts.map((c) => [c.id as string, c.name as string])
      );

      for (const price of prices[market.id]) {
        const contractName = contractIdToName[price.contract_id];
        if (!contractName) {
          console.warn(
            `Couldn't find contract ${price.contract_id} in contracts data, skipping`
          );
          continue;
        }
        optionsObj[price.contract_id] = {
          name: contractName,
          probability: price.last_executed_price
            ? Number(price.last_executed_price)
            : undefined,
          type: "PROBABILITY",
        };
      }
      let options: QuestionOption[] = Object.values(optionsObj);
      // monkey patch the case where there are only two options and only one has traded.
      if (
        options.length == 2 &&
        options.map((option) => option.probability).includes(undefined)
      ) {
        const nonNullPrice =
          options[0].probability == null
            ? options[1].probability
            : options[0].probability;

        if (nonNullPrice != null) {
          options = options.map((option) => {
            let probability = option.probability;
            return {
              ...option,
              probability:
                probability == null ? 100 - nonNullPrice : probability,
              // yes, 100, because prices are not yet normalized.
            };
          });
        }
      }

      // Normalize normally
      const totalValue = options
        .map((element) => Number(element.probability))
        .reduce((a, b) => a + b, 0);

      options = options.map((element) => ({
        ...element,
        probability: Number(element.probability) / totalValue,
      }));
      VERBOSE && console.log(options);

      /*
    if(contracts.length == 2){
      isBinary = true
      percentage = ( Number(prices[market.id][0].last_executed_price) + (100 - Number(prices[market.id][1].last_executed_price)) ) / 2
      percentage = Math.round(percentage)+"%"
      let contractName = contracts[0].name
      name = name+ (contractName=="Yes"?'':` (${contracts[0].name})`)
    }
    */
      const id = `${platformName}-${market.id}`;
      const title = market.name;
      const result: FetchedQuestion = {
        id,
        title,
        url: "https://smarkets.com/event/" + market.event_id + market.slug,
        description: market.description,
        options,
        timestamp: new Date(),
        qualityindicators: {},
      };
      VERBOSE && console.log(result);
      results.push(result);
    }
    VERBOSE && console.log(results);
    return results;
  },
  calculateStars(data) {
    let nuno = () => 2;
    let eli = () => null;
    let misha = () => null;
    let starsDecimal = average([nuno()]); //, eli(), misha()])
    let starsInteger = Math.round(starsDecimal);
    return starsInteger;
  },
};
