/* Imports */
import axios from "axios";

import { average } from "../../utils";
import { FetchedQuestion, Platform } from "./";

/* Definitions */
const platformName = "manifold";
const ENDPOINT = "https://api.manifold.markets/v0/markets";
// See https://manifoldmarkets.notion.site/Manifold-Markets-API-5e7d0aef4dcf452bb04b319e178fabc5

/* Support functions */

async function fetchPage(endpoint: string) {
  let response = await axios({
    url: endpoint,
    method: "GET",
    headers: {
      "Content-Type": "text/json",
    },
  }).then((response) => response.data);
  // console.log(response)
  return response;
}

async function fetchAllData() {
  let endpoint = ENDPOINT;
  let end = false;
  let allData = [];
  let counter = 1;
  while (!end) {
    console.log(`Query #${counter}: ${endpoint}`);
    let newData = await fetchPage(endpoint);
    // console.log(newData)
    if (Array.isArray(newData)) {
      allData.push(...newData);
      let hasReachedEnd =
        newData.length == 0 ||
        newData[newData.length - 1] == undefined ||
        newData[newData.length - 1].id == undefined;
      if (!hasReachedEnd) {
        let lastId = newData[newData.length - 1].id;
        endpoint = `${ENDPOINT}?before=${lastId}`;
      } else {
        end = true;
      }
    } else {
      end = true;
    }
    counter = counter + 1;
  }
  return allData;
}

function showStatistics(results: FetchedQuestion[]) {
  console.log(`Num unresolved markets: ${results.length}`);
  let sum = (arr: number[]) => arr.reduce((tally, a) => tally + a, 0);
  let num2StarsOrMore = results.filter(
    (result) => manifold.calculateStars(result) >= 2
  );
  console.log(
    `Manifold has ${num2StarsOrMore.length} markets with 2 stars or more`
  );
  console.log(
    `Mean volume: ${
      sum(results.map((result) => result.qualityindicators.volume7Days || 0)) /
      results.length
    }; mean pool: ${
      sum(results.map((result) => result.qualityindicators.pool)) /
      results.length
    }`
  );
}

function processPredictions(predictions: any[]): FetchedQuestion[] {
  let results: FetchedQuestion[] = predictions.map((prediction) => {
    let id = `${platformName}-${prediction.id}`; // oops, doesn't match platform name
    let probability = prediction.probability;
    let options: FetchedQuestion["options"] = [
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
      description: prediction.description || "",
      options,
      qualityindicators: {
        createdTime: prediction.createdTime,
        // volume7Days: prediction.volume7Days, // deprecated.
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
  version: "v1",
  async fetcher() {
    let data = await fetchAllData();
    let results = processPredictions(data); // somehow needed
    showStatistics(results);
    return results;
  },
  calculateStars(data) {
    let nuno = () =>
      (data.qualityindicators.volume24Hours || 0) > 100 ||
      ((data.qualityindicators.pool || 0) > 500 &&
        (data.qualityindicators.volume24Hours || 0) > 50)
        ? 2
        : 1;
    let eli = () => null;
    let misha = () => null;
    let starsDecimal = average([nuno()]); //, eli(data), misha(data)])
    let starsInteger = Math.round(starsDecimal);
    return starsInteger;
  },
};
