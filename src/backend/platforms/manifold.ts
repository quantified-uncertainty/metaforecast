/* Imports */
import axios from "axios";

import {average} from "../../utils";
import {FetchedQuestion, Platform} from "./";

/* Definitions */
const platformName = "manifold";
const endpoint = "https://manifold.markets/api/v0/markets";
// See https://manifoldmarkets.notion.site/Manifold-Markets-API-5e7d0aef4dcf452bb04b319e178fabc5

/* Support functions */

async function fetchPage(before ?:string) {
  try {
    let response = await axios({
      url: endpoint + `?limit=1000${
        !! before ? `&before=${before}` : ""
      }`,
      method: "GET",
      headers: {
        "Content-Type": "text/html"
      }
    }).then((response) => response.data);
    let lastMarketId = response[response.length - 1]
    let page = ({lastMarketId: lastMarketId, markets: response, reachedEnd: false})
    return page
  } catch (error) {
    console.log(error)
    let page = ({lastMarketId: "", markets: [], reachedEnd: true})
    return page
  }
}

async function fetchAllMarkets() {
  let before = ""
  let reachedEnd = false
  let marketsArray = []
  while (! reachedEnd) {
    let page = await fetchPage(before)
    reachedEnd = page.reachedEnd
    before = page.lastMarketId
    let newMarkets = page.markets.filter((market : any) => !!market && !market.isResolved)
    marketsArray.push(newMarkets)
  }
  return marketsArray
}

function processPredictions(data: any) {
  return []
}

export const manifold: Platform = {
  name: platformName,
  label: "Manifold Markets",
  color: "#793466",
  version: "v1",
  async fetcher() {
    let data = await fetchAllMarkets();
    let results = processPredictions(data); // somehow needed
    return results;
  },
  calculateStars(data) {
    let nuno = () => (data.qualityindicators.volume7Days || 0) > 250 || ((data.qualityindicators.pool || 0) > 500 && (data.qualityindicators.volume7Days || 0) > 100) ? 2 : 1;
    let eli = () => null;
    let misha = () => null;
    let starsDecimal = average([nuno()]); // , eli(data), misha(data)])
    let starsInteger = Math.round(starsDecimal);
    return starsInteger;
  }
};
