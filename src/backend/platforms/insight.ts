/* Imports */
import axios from "axios";

import {FetchedQuestion, Platform} from ".";

/* Definitions */
const platformName = "insight";
const marketsEnpoint = "https://insightprediction.com/api/markets";
const getMarketEndpoint = (id : number) => `https://insightprediction.com/api/markets/${id}`;

/* Support functions */

/*
async function fetchQuestionStats(bearer : string, marketId : number) {
  const response = await axios({
    url: getMarketEndpoint(marketId),
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${bearer}`
    }
  }).then((res) => res.data);
  // console.log(response)
  return response;
}

async function fetchPage(bearer : string, pageNum : number) {
  const response = await axios({
    url: `${marketsEnpoint}?page=${pageNum}`, // &orderBy=is_resolved&sortedBy=desc`,
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${bearer}`
    }
  }).then((res) => res.data);
  // console.log(response);
  return response;
}

async function fetchData(bearer : string) {
  let pageNum = 1;
  let reachedEnd = false;
  let results = [];
  while (! reachedEnd) {
    let newPage = await fetchPage(bearer, pageNum);
    let newPageData = newPage.data;
    let marketsFromPage = []
    for (let market of newPageData) {
      let response = await fetchQuestionStats(bearer, market.id);
      let marketData = response.data
      let marketAnswer = marketData.answer.data
      delete marketData.answer
      // These are the options and their prices.
      let marketOptions = marketAnswer.map(answer => {
        return({name: answer.title, probability: answer.latest_yes_price, type: "PROBABILITY"})
      })
      marketsFromPage.push({
        ... marketData,
        options: marketOptions
      });
    }

    let finalObject = marketsFromPage

    console.log(`Page = #${pageNum}`);
    // console.log(newPageData)
    console.dir(finalObject, {depth: null});
    results.push(... finalObject);

    let newPagination = newPage.meta.pagination;
    if (newPagination.total_pages == pageNum) {
      reachedEnd = true;
    } else {
      pageNum = pageNum + 1;
    }
  }
  return results
}

async function processPredictions(predictions : any[]) {
  let results = await predictions.map((prediction) => {
    const id = `${platformName}-${
      prediction.id
    }`;
    const probability = prediction.probability;
    const options: FetchedQuestion["options"] = [
      {
        name: "Yes",
        probability: probability,
        type: "PROBABILITY"
      }, {
        name: "No",
        probability: 1 - probability,
        type: "PROBABILITY"
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
      }
    };
    return result;
  });
  return results; // resultsProcessed
}
*/

/* Body */
export const insight: Platform = {
  name: platformName,
  label: "Insight Prediction",
  color: "#ff0000",
  version: "v1",
  async fetcher() {
    let bearer = process.env.INSIGHT_BEARER;
    // let data = await fetchData(bearer);
    // console.log(data);
    let results: FetchedQuestion[] = []; // await processPredictions(data); // somehow needed
    return results;
  },
  calculateStars(data) {
    return 2;
  }
};
