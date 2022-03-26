/* Imports */
import axios from "axios";
import { databaseUpsert } from "../database/database-wrapper";
import { calculateStars } from "../utils/stars";
import toMarkdown from "../utils/toMarkdown";

/* Definitions */
let jsonEndpoint =
  "https://www.rootclaim.com/main_page_stories?number=100&offset=0"; //"https://subgraph-matic.poly.market/subgraphs/name/TokenUnion/polymarket"//"https://subgraph-backup.poly.market/subgraphs/name/TokenUnion/polymarket"//'https://subgraph-matic.poly.market/subgraphs/name/TokenUnion/polymarket3'

async function fetchAllRootclaims() {
  // for info which the polymarket graphql API
  let response = await axios
    .get(jsonEndpoint)
    .then((response) => response.data);
  if (response.length != response[0] + 1) {
    console.log(response.length);
    console.log(response[0]);
    //throw Error("Rootclaim's backend has changed.")
  }
  response.shift();
  return response;
}

async function fetchAndProcessData() {
  let claims = await fetchAllRootclaims();
  let results = [];
  for (let claim of claims) {
    let id = `rootclaim-${claim.slug.toLowerCase()}`;
    let options = [];
    for (let scenario of claim.scenarios) {
      //console.log(scenario)
      options.push({
        name: toMarkdown(scenario.text).replace("\n", "").replace("&#39;", "'"),
        probability: scenario.net_prob / 100,
        type: "PROBABILITY",
      });
    }
    let claimUrlPath = claim.created_at < "2020" ? "claims" : "analysis";
    let obj = {
      id: id,
      title: toMarkdown(claim.question).replace("\n", ""),
      url: `https://www.rootclaim.com/${claimUrlPath}/${claim.slug}`,
      platform: "Rootclaim",
      description: toMarkdown(claim.background).replace("&#39;", "'"),
      options: options,
      timestamp: new Date().toISOString(),
      qualityindicators: {
        numforecasts: 1,
        stars: calculateStars("Rootclaim", {}),
      },
    };
    results.push(obj);
  }
  return results;
}

/* Body */
export async function rootclaim() {
  let results = await fetchAndProcessData();
  await databaseUpsert({ contents: results, group: "rootclaim" });

  console.log("Done");
}
//rootclaim()
