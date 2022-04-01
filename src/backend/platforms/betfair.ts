/* Imports */
import axios from "axios";
import https from "https";

import { calculateStars } from "../utils/stars";
import { Forecast, Platform } from "./";

const platformName = "betfair";

/* Definitions */
let endpoint = process.env.SECRET_BETFAIR_ENDPOINT;

/* Utilities */
let arraysEqual = (a, b) => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.
  // Please note that calling sort on an array will modify that array.
  // you might want to clone your array first.

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};
let mergeRunners = (runnerCatalog, runnerBook) => {
  let keys = Object.keys(runnerCatalog);
  let result = [];
  for (let key of keys) {
    result.push({ ...runnerCatalog[key], ...runnerBook[key] });
  }
  return result;
};

/* Support functions */

async function fetchPredictions() {
  const agent = new https.Agent({
    rejectUnauthorized: false,
  });
  let response = await axios({
    url: endpoint,
    method: "GET",
    headers: {
      "Content-Type": "text/html",
    },
    httpsAgent: agent,
  }).then((response) => response.data);

  return response;
}

async function whipIntoShape(data) {
  let catalogues = data.market_catalogues;
  let books = data.market_books;
  let keys1 = Object.keys(catalogues).sort();
  let keys2 = Object.keys(books).sort();
  // console.log(keys1)
  // console.log(keys2)
  let results = [];
  if (!arraysEqual(keys1, keys2)) {
    throw new Error(
      "Betfair: Error in endpoint; Betfair catalogues and books do not match"
    );
  } else {
    for (let key of keys1) {
      results.push({
        ...catalogues[key],
        ...books[key],
        options: mergeRunners(catalogues[key].runners, books[key].runners),
      });
    }
  }
  return results;
}

async function processPredictions(data) {
  let predictions = await whipIntoShape(data);
  // console.log(JSON.stringify(predictions, null, 4))
  let results: Forecast[] = predictions.map((prediction) => {
    /* if(Math.floor(Math.random() * 10) % 20 ==0){
       console.log(JSON.stringify(prediction, null, 4))
    } */
    let id = `${platformName}-${prediction.marketId}`;
    let normalizationFactor = prediction.options
      .filter((option) => option.status == "ACTIVE" && option.totalMatched > 0)
      .map((option) => option.lastPriceTraded)
      .map((x) => 1 / x)
      .reduce((a, b) => a + b, 0);
    let options = prediction.options
      .filter((option) => option.status == "ACTIVE" && option.totalMatched > 0)
      .map((option) => ({
        name: option.runnerName,
        probability:
          option.lastPriceTraded != 0
            ? 1 / option.lastPriceTraded / normalizationFactor
            : 0, // https://www.aceodds.com/bet-calculator/odds-converter.html
        type: "PROBABILITY",
      }));

    // console.log(prediction.options)

    let rules = prediction.description.rules
      .split("Regs</a>.")[1]
      .replace(/<br><br>/g, " ")
      .replace(/<br>/g, " ")
      .replace(/<b>/g, " ")
      .replace(/<\/b>/g, " ")
      .replace(/\n/g, " ")
      .trim();
    if (rules == undefined) {
      // console.log(prediction.description)
    }
    let title = rules.split("? ")[0] + "?";
    let description = rules.split("? ")[1].trim();
    if (title.includes("of the named")) {
      title = prediction.marketName + ": " + title;
    }
    let result = {
      id: id,
      title: title,
      url: `https://www.betfair.com/exchange/plus/politics/market/${prediction.marketId}`,
      platform: platformName,
      description: description,
      options: options,
      timestamp: new Date().toISOString(),
      qualityindicators: {
        stars: calculateStars(platformName, {
          volume: prediction.totalMatched,
        }),
        volume: prediction.totalMatched,
      },
    };
    return result;
  });
  return results; //resultsProcessed
}

export const betfair: Platform = {
  name: platformName,
  label: "Betfair",
  color: "#3d674a",
  async fetcher() {
    const data = await fetchPredictions();
    const results = await processPredictions(data); // somehow needed
    return results;
  },
};
