import axios from "axios";

import { average } from "../../utils";
import { FetchedQuestion, Platform } from "./index.js";

/* Definitions */
const platformName = "manifold";

// See https://docs.manifold.markets/api
const ENDPOINT = "https://api.manifold.markets/v0/markets";

async function fetchPage(endpoint: string) {
  const response = await axios({
    url: endpoint,
    method: "GET",
    headers: {
      "Content-Type": "text/json",
    },
  }).then((response) => response.data);

  return response;
}

async function fetchAllData() {
  let endpoint = ENDPOINT;
  let end = false;
  const allData = [];
  let counter = 1;
  while (!end) {
    console.log(`Query #${counter}: ${endpoint}`);
    const newData = await fetchPage(endpoint);
    // console.log(newData)
    if (Array.isArray(newData)) {
      allData.push(...newData);
      const hasReachedEnd =
        newData.length == 0 ||
        newData[newData.length - 1] == undefined ||
        newData[newData.length - 1].id == undefined;

      if (!hasReachedEnd) {
        const lastId = newData[newData.length - 1].id;
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
  const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

  const num2StarsOrMore = results.filter(
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
  const results: FetchedQuestion[] = predictions.map((prediction) => {
    const id = `${platformName}-${prediction.id}`; // oops, doesn't match platform name
    const probability = prediction.probability;

    const options: FetchedQuestion["options"] = [
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
      id,
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
    const data = await fetchAllData();
    const results = processPredictions(data); // somehow needed
    showStatistics(results);
    return results;
  },
  calculateStars(data) {
    const nuno = () =>
      (data.qualityindicators.volume24Hours || 0) > 100 ||
      ((data.qualityindicators.pool || 0) > 500 &&
        (data.qualityindicators.volume24Hours || 0) > 50)
        ? 2
        : 1;

    const starsDecimal = average([nuno()]);
    const starsInteger = Math.round(starsDecimal);
    return starsInteger;
  },
};
