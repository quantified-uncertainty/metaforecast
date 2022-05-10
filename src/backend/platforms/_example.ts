/* Imports */
import axios from "axios";

import { FetchedQuestion, Platform } from "./";

/* Definitions */
const platformName = "example";
const endpoint = "https://example.com/";

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

async function processPredictions(predictions: any[]) {
  let results = await predictions.map((prediction) => {
    const id = `${platformName}-${prediction.id}`;
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
      title: prediction.title,
      url: "https://example.com",
      description: prediction.description,
      options,
      qualityindicators: {
        // other: prediction.otherx,
        // indicators: prediction.indicatorx,
      },
    };
    return result;
  });
  return results; //resultsProcessed
}

/* Body */

export const example: Platform = {
  name: platformName,
  label: "Example platform",
  color: "#ff0000",
  async fetcher() {
    let data = await fetchData();
    let results = await processPredictions(data); // somehow needed
    return results;
  },
  calculateStars(data) {
    return 2;
  },
};
