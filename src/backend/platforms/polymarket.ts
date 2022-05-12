/* Imports */
import axios from "axios";

import { average } from "../../utils";
import { FetchedQuestion, Platform } from "./";

/* Definitions */
const platformName = "polymarket";
const graphQLendpoint =
  "https://api.thegraph.com/subgraphs/name/polymarket/matic-markets-5";
let units = 10 ** 6;

async function fetchAllContractInfo() {
  // for info which the polymarket graphql API
  let response = await axios
    .get(
      "https://strapi-matic.poly.market/markets?active=true&_sort=volume:desc&closed=false&_limit=-1"
      // "https://strapi-matic.poly.market/markets?active=true&_sort=volume:desc&_limit=-1" to get all markets, including closed ones
    )
    .then((query) => query.data);
  response = response.filter((res: any) => res.closed != true);
  return response;
}

async function fetchIndividualContractData(marketMakerAddress: string) {
  let daysSinceEra = Math.round(Date.now() / (1000 * 24 * 60 * 60)) - 7; // last week
  let response = await axios({
    url: graphQLendpoint,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: JSON.stringify({
      query: `
      {
          fixedProductMarketMakers(first: 1000
          where: {
            id: "${marketMakerAddress}"
            lastActiveDay_gt: ${daysSinceEra}
          }){
            id
            creator
            creationTimestamp
            fee
            tradesQuantity
            buysQuantity
            sellsQuantity
            lastActiveDay
            outcomeTokenPrices
            outcomeTokenAmounts
            liquidityParameter
            collateralBuyVolume
            collateralSellVolume
            conditions {
              outcomeSlotCount
            }
        }
      }
      `,
    }),
  })
    .then((res) => res.data)
    .then((res) => res.data.fixedProductMarketMakers);

  return response;
}

export const polymarket: Platform = {
  name: platformName,
  label: "PolyMarket",
  color: "#00314e",
  version: "v1",
  async fetcher() {
    let results: FetchedQuestion[] = [];
    let webpageEndpointData = await fetchAllContractInfo();
    for (let marketInfo of webpageEndpointData) {
      let address = marketInfo.marketMakerAddress;
      let addressLowerCase = address.toLowerCase();
      if (
        marketInfo.outcomes[0] != "Long" ||
        marketInfo.outcomes[1] != "Long"
      ) {
        let moreMarketAnswer = await fetchIndividualContractData(
          addressLowerCase
        );
        if (moreMarketAnswer.length > 0) {
          let moreMarketInfo = moreMarketAnswer[0];
          let id = `${platformName}-${addressLowerCase.slice(0, 10)}`;
          // console.log(id);
          let numforecasts = Number(moreMarketInfo.tradesQuantity);
          let tradevolume =
            (Number(moreMarketInfo.collateralBuyVolume) +
              Number(moreMarketInfo.collateralSellVolume)) /
            units;
          let liquidity = Number(moreMarketInfo.liquidityParameter) / units;
          // let isbinary = Number(moreMarketInfo.conditions[0].outcomeSlotCount) == 2
          // let percentage = Number(moreMarketInfo.outcomeTokenPrices[0]) * 100
          // let percentageFormatted = isbinary ? (percentage.toFixed(0) + "%") : "none"
          let options: FetchedQuestion["options"] = [];
          for (let outcome in moreMarketInfo.outcomeTokenPrices) {
            options.push({
              name: String(marketInfo.outcomes[outcome]),
              probability: Number(moreMarketInfo.outcomeTokenPrices[outcome]),
              type: "PROBABILITY",
            });
          }

          let result: FetchedQuestion = {
            id: id,
            title: marketInfo.question,
            url: "https://polymarket.com/market/" + marketInfo.slug,
            description: marketInfo.description,
            options,
            qualityindicators: {
              numforecasts: numforecasts.toFixed(0),
              liquidity: liquidity.toFixed(2),
              tradevolume: tradevolume.toFixed(2),
            },
            extra: {
              address: marketInfo.address,
            },
            /*
             */
          };
          if (marketInfo.category !== "Sports") {
            results.push(result);
          }
        }
      }
    }
    return results;
  },
  calculateStars(data) {
    // let nuno = (data) => (data.volume > 10000 ? 4 : data.volume > 1000 ? 3 : 2);
    // let eli = (data) => data.liquidity > 10000 ? 5 : 4
    // let misha = (data) => 4

    const liquidity = data.qualityindicators.liquidity || 0;
    const volume = data.qualityindicators.tradevolume || 0;

    let nuno = () =>
      liquidity > 1000 && volume > 10000
        ? 4
        : liquidity > 500 && volume > 1000
        ? 3
        : 2;
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
