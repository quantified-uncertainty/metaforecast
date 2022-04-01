/* Imports */
import axios from "axios";

import { calculateStars } from "../utils/stars";
import { Platform } from "./";

/* Definitions */
let endpoint = "https://example.com/";

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

async function processPredictions(predictions) {
  let results = await predictions.map((prediction) => {
    let id = `example-${prediction.id}`;
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
    let result = {
      title: prediction.title,
      url: `https://example.com`,
      platform: "Example",
      description: prediction.description,
      options: options,
      timestamp: new Date().toISOString(),
      qualityindicators: {
        stars: calculateStars("Example", {
          /* some: somex, factors: factors */
        }),
        other: prediction.otherx,
        indicators: prediction.indicatorx,
      },
    };
    return result;
  });
  return results; //resultsProcessed
}

/* Body */

export const example: Platform = {
  name: "example",
  label: "Example platform",
  color: "#ff0000",
  async fetcher() {
    let data = await fetchData();
    let results = await processPredictions(data); // somehow needed
    return results;
  },
};
