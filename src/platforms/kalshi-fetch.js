/* Imports */
import fs from 'fs'
import axios from "axios"
import { calculateStars } from "../utils/stars.js"
import {upsert} from "../utils/mongo-wrapper.js"

/* Definitions */
let jsonEndpoint = "https://trading-api.kalshi.com/v1/cached/markets/"//"https://subgraph-matic.poly.market/subgraphs/name/TokenUnion/polymarket"//"https://subgraph-backup.poly.market/subgraphs/name/TokenUnion/polymarket"//'https://subgraph-matic.poly.market/subgraphs/name/TokenUnion/polymarket3'

/* Support functions
async function fetchAllContractInfo(){ // for info which the polymarket graphql API
  let data = fs.readFileSync("./data/polymarket-contract-list.json")
  let response = JSON.parse(data)
  return response
}
 */
async function fetchAllMarkets() { // for info which the polymarket graphql API
  let response = await axios.get(jsonEndpoint).then(response => response.data.markets)
  // console.log(response)
  return response
}


async function processMarkets(markets) {
  let results = await markets.map(market => {
    let probability = market.last_price/100
    let options = [
      {
        "name": "Yes",
        "probability": probability,
        "type": "PROBABILITY"
      },
      {
        "name": "No",
        "probability": 1 - probability,
        "type": "PROBABILITY"
      }
    ]
    let result = ({
      "title": market.title,
      "url": `https://kalshi.com`,
      "platform": "Kalshi",
      "description": `${market.settle_details}. The resolution source is: ${market.ranged_group_name} (${market.settle_source_url})`,
      "options": options,
      "timestamp": new Date().toISOString(),
      "qualityindicators": {
          "stars": calculateStars("Kalshi", ({volume: market.volume, interest: market.open_interest})),
          "yes_bid": market.yes_bid,
          "yes_ask": market.yes_ask,
          "spread": Math.abs(market.yes_bid-market.yes_ask),
          "volume": market.volume,
          "open_interest": market.open_interest
      }
    })
    return result
  })
  return results //resultsProcessed
}

/* Body */
export async function kalshi() {
  let markets = await fetchAllMarkets()
  let results = await processMarkets(markets) // somehow needed
  // console.log(results)
  // let string = JSON.stringify(results, null, 2)
  // fs.writeFileSync('polymarket-questions.json', string);
  await upsert(results, "kalshi-questions")
  console.log("Done")
}
// kalshi()
