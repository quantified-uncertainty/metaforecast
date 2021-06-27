/* Imports */
import fs from 'fs'
import axios from "axios"
import { calculateStars } from "../utils/stars.js"
import {upsert} from "../utils/mongo-wrapper.js"

/* Definitions */
let jsonEndpoint = "https://www.rootclaim.com/main_page_stories?number=100&offset=0"//"https://subgraph-matic.poly.market/subgraphs/name/TokenUnion/polymarket"//"https://subgraph-backup.poly.market/subgraphs/name/TokenUnion/polymarket"//'https://subgraph-matic.poly.market/subgraphs/name/TokenUnion/polymarket3'

/* Support functions
async function fetchAllContractInfo(){ // for info which the polymarket graphql API
  let data = fs.readFileSync("./data/polymarket-contract-list.json")
  let response = JSON.parse(data)
  return response
}
 */
async function fetchAllRootclaims() { // for info which the polymarket graphql API
  let response = await axios.get(jsonEndpoint)
  .then(response => response.data)
  if(response.length != (response[0]+1)){
      console.log(response.length)
      console.log(response[0])
      //throw Error("Rootclaim's backend has changed.")
  }
  response.shift()
  return response
}

async function fetchAndProcessData() {
  let claims = await fetchAllRootclaims()
  let results  = []
  for (let claim of claims) {
    let options = []
    for (let scenario in claim.scenarios) {
        options.push({
            "name": scenario.name,
            "probability": scenario.net_prob / 100,
            "type": "PROBABILITY"
        })
    }
    let obj = ({
      "title": claim.question,
      "url": "https://www.rootclaim.com/analysis/"+claim.slug,
      "platform": "Rootclaim",
      "description": claim.background,
      "options": options,
      "timestamp": new Date().toISOString(),
      "qualityindicators": {
          "numforecasts": 1,
          "stars": calculateStars("Rootclaim", ({}))  
      }
    })
    results.push(obj)
    }
  return results
}

/* Body */
export async function rootclaim() {
  let results = await fetchAndProcessData()
  // console.log(results)
  // let string = JSON.stringify(results, null, 2)
  // fs.writeFileSync('rootclaim-questions.json', string);
  await upsert(results, "rootclaim-questions")
  console.log("Done")
}
//rootclaim()
