/* Imports */
import fs from 'fs'
import axios from "axios"
import { calculateStars } from "../utils/stars.js"
import {upsert} from "../utils/mongo-wrapper.js"

/* Definitions */
let graphQLendpoint = "https://api.thegraph.com/subgraphs/name/tokenunion/polymarket-matic"//"https://subgraph-matic.poly.market/subgraphs/name/TokenUnion/polymarket"//"https://subgraph-backup.poly.market/subgraphs/name/TokenUnion/polymarket"//'https://subgraph-matic.poly.market/subgraphs/name/TokenUnion/polymarket3'
let units = 10 ** 6

/* Support functions
async function fetchAllContractInfo(){ // for info which the polymarket graphql API
  let data = fs.readFileSync("./data/polymarket-contract-list.json")
  let response = JSON.parse(data)
  return response
}
 */
async function fetchAllContractInfo() { // for info which the polymarket graphql API
  let response = await axios.get('https://strapi-matic.poly.market/markets?active=true&_sort=volume:desc&_limit=-1')
    .then(query => query.data);
  response = response.filter(res => res.closed != true)
  return response
}

async function fetchAllContractData() {
  let daysSinceEra = Math.round(Date.now() / (1000 * 24 * 60 * 60)) - 7 // last week
  let response = await axios({
    url: graphQLendpoint,
    method: 'POST',
    headers: ({ 'Content-Type': 'application/json' }),
    data: JSON.stringify(({
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
      `
    })),
  })
    .then(res => res.data)
    .then(res => res.data.fixedProductMarketMakers)
  // console.log(response)
  return response
}

async function fetch_all() {
  let allData = await fetchAllContractData()
  let allInfo = await fetchAllContractInfo()

  let combinedObj = ({})
  let results = []
  for (let info of allInfo) {
    let address = info.marketMakerAddress
    let addressLowerCase = address.toLowerCase()
    //delete info.history
    if (info.outcomes[0] != "Long" || info.outcomes[1] != "Long")
      combinedObj[addressLowerCase] = {
        title: info.question,
        url: "https://polymarket.com/market/" + info.slug,
        address: address,
        description: info.description,
        outcomes: info.outcomes,
        options: []
      }
  }
  for (let data of allData) {
    let addressLowerCase = data.id
    // console.log(data)
    if (combinedObj[addressLowerCase] != undefined) {
      // console.log(addressLowerCase)
      let obj = combinedObj[addressLowerCase]
      let numforecasts = data.tradesQuantity
      let isbinary = Number(data.conditions[0].outcomeSlotCount) == 2
      let tradevolume = (Number(data.collateralBuyVolume) + Number(data.collateralSellVolume)) / units
      let liquidity = Number(data.liquidityParameter) / units
      let percentage = Number(data.outcomeTokenPrices[0]) * 100
      let percentageFormatted = isbinary ? (percentage.toFixed(0) + "%") : "none"
      let options = []
      for (let outcome in data.outcomeTokenPrices) {
        options.push({
          "name": obj.outcomes[outcome],
          "probability": data.outcomeTokenPrices[outcome],
          "type": "PROBABILITY"
        })
      }

      combinedObj[addressLowerCase] = {
        "title": obj.title,
        "url": obj.url,
        "platform": "PolyMarket",
        "description": obj.description,
        "options": options,
        "timestamp": new Date().toISOString(),
        "qualityindicators": {
          "numforecasts": Number(data.tradesQuantity).toFixed(0),
          "liquidity": liquidity.toFixed(2),
          "tradevolume": tradevolume.toFixed(2),
          "stars": calculateStars("Polymarket", ({ liquidity, option: options[0] }))  
        }
        /*
        address: obj.address
        */
      }
      results.push(combinedObj[addressLowerCase])
    }
  }
  // let resultsProcessed = Object.values(combinedObj)
  // console.log(result)
  return results //resultsProcessed
}

/* Body */
export async function polymarket() {
  let results = await fetch_all()
  // console.log(results)
  // console.log(result)
  // let string = JSON.stringify(results, null, 2)
  // fs.writeFileSync('polymarket-questions.json', string);
  await upsert(results, "polymarket-questions")
  console.log("Done")
}
// polymarket()
