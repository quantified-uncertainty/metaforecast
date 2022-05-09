/* Imports */
import axios from "axios";

import { calculateStars } from "../utils/stars";
import { FetchedQuestion, Platform } from "./";

/* Definitions */
const platformName = "manifold";
let endpoint = "https://manifold.markets/api/v0/markets";
// See https://manifoldmarkets.notion.site/Manifold-Markets-API-5e7d0aef4dcf452bb04b319e178fabc5

/* Support functions */

async function fetchData() {
  let response = await axios({
    url: endpoint,
    method: "GET",
    headers: {
      "Content-Type": "text/html",
    },
  }).then((response) => response.data);
  // console.log(response)
  return response;
}

function showStatistics(results: FetchedQuestion[]) {
  console.log(`Num unresolved markets: ${results.length}`);
  let sum = (arr) => arr.reduce((tally, a) => tally + a, 0);
  let num2StarsOrMore = results.filter(
    (result) => result.qualityindicators.stars >= 2
  );
  console.log(
    `Manifold has ${num2StarsOrMore.length} markets with 2 stars or more`
  );
  console.log(
    `Mean volume: ${
      sum(results.map((result) => result.qualityindicators.volume7Days)) /
      results.length
    }; mean pool: ${
      sum(results.map((result) => result.qualityindicators.pool)) /
      results.length
    }`
  );
}

async function processPredictions(predictions) {
  let results: FetchedQuestion[] = await predictions.map((prediction) => {
    let id = `${platformName}-${prediction.id}`; // oops, doesn't match platform name
    let probability = prediction.probability;
    let options = [
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
    const result: FetchedQuestion = {
      id: id,
      title: prediction.question,
      url: prediction.url,
      description: prediction.description,
      options: options,
      qualityindicators: {
        stars: calculateStars(platformName, {
          volume7Days: prediction.volume7Days,
          volume24Hours: prediction.volume24Hours,
          pool: prediction.pool,
        }),
        createdTime: prediction.createdTime,
        volume7Days: prediction.volume7Days,
        volume24Hours: prediction.volume24Hours,
        pool: prediction.pool, // normally liquidity, but I don't actually want to show it.
      },
      extra: {
        isResolved: prediction.isResolved,
      },
    };
    return result;
  });

  const unresolvedResults = results.filter(
    (result) => !(result.extra as any).isResolved
  );
  return unresolvedResults;
}

export const manifold: Platform = {
  name: platformName,
  label: "Manifold Markets",
  color: "#793466",
  async fetcher() {
    let data = await fetchData();
    let results = await processPredictions(data); // somehow needed
    showStatistics(results);
    return results;
  },
};
