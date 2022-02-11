/* Imports */
import fs from "fs";
import axios from "axios";
import toMarkdown from "../utils/toMarkdown.js";
import { calculateStars } from "../utils/stars.js";
import { upsert } from "../utils/mongo-wrapper.js";

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
    let id = `platform-${prediction.id}`;
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
        stars: calculateStars("Example", { some: somex, factors: factors }),
        other: prediction.otherx,
        indicators: prediction.indicatorx,
      },
    };
    return result;
  });
  return results; //resultsProcessed
}

/* Body */

export async function example() {
  let data = await fetchData();
  let results = await processPredictions(data); // somehow needed
  // console.log(results)
  // let string = JSON.stringify(results, null, 2)
  // fs.writeFileSync('polyprediction-questions.json', string);
  await upsert(results, "example-questions");
  console.log("Done");
}
//example()
