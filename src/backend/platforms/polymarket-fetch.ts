/* Imports */
import axios from "axios";

import { calculateStars } from "../utils/stars";
import { Forecast, PlatformFetcher } from "./";

/* Definitions */
let graphQLendpoint =
  "https://api.thegraph.com/subgraphs/name/polymarket/matic-markets-5";
let units = 10 ** 6;

async function fetchAllContractInfo() {
  // for info which the polymarket graphql API
  let response = await axios
    .get(
      "https://strapi-matic.poly.market/markets?active=true&_sort=volume:desc&_limit=-1"
    )
    .then((query) => query.data);
  response = response.filter((res) => res.closed != true);
  return response;
}

async function fetchAllContractData() {
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

export const polymarket: PlatformFetcher = async function () {
  let allData = await fetchAllContractData();
  let allInfo = await fetchAllContractInfo();

  let used = process.memoryUsage().heapUsed / 1024 / 1024;
  console.log(
    `The script uses approximately ${Math.round(used * 100) / 100} MB`
  );

  let infos = {};
  for (let info of allInfo) {
    let address = info.marketMakerAddress;
    let addressLowerCase = address.toLowerCase();

    if (info.outcomes[0] != "Long" || info.outcomes[1] != "Long")
      infos[addressLowerCase] = {
        title: info.question,
        url: "https://polymarket.com/market/" + info.slug,
        address: address,
        description: info.description,
        outcomes: info.outcomes,
        options: [],
        category: info.category,
      };
  }

  let results = [];
  for (let data of allData) {
    let addressLowerCase = data.id;

    if (infos[addressLowerCase] != undefined) {
      let id = `polymarket-${addressLowerCase.slice(0, 10)}`;
      let info = infos[addressLowerCase];
      let numforecasts = Number(data.tradesQuantity);
      let tradevolume =
        (Number(data.collateralBuyVolume) + Number(data.collateralSellVolume)) /
        units;
      let liquidity = Number(data.liquidityParameter) / units;
      // let isbinary = Number(data.conditions[0].outcomeSlotCount) == 2
      // let percentage = Number(data.outcomeTokenPrices[0]) * 100
      // let percentageFormatted = isbinary ? (percentage.toFixed(0) + "%") : "none"
      let options = [];
      for (let outcome in data.outcomeTokenPrices) {
        options.push({
          name: info.outcomes[outcome],
          probability: data.outcomeTokenPrices[outcome],
          type: "PROBABILITY",
        });
      }

      let result: Forecast = {
        id: id,
        title: info.title,
        url: info.url,
        platform: "PolyMarket",
        description: info.description,
        options: options,
        timestamp: new Date().toISOString(),
        qualityindicators: {
          numforecasts: numforecasts.toFixed(0),
          liquidity: liquidity.toFixed(2),
          tradevolume: tradevolume.toFixed(2),
          stars: calculateStars("Polymarket", {
            liquidity,
            option: options[0],
            volume: tradevolume,
          }),
        },
        extra: {
          address: info.address,
        },
      };
      if (info.category != "Sports") {
        results.push(result);
      }
    }
  }

  return results;
};
