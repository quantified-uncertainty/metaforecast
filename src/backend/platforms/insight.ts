/* Imports */
import axios from "axios";

import { FetchedQuestion, Platform } from ".";

/* Definitions */
const platformName = "insight";
const marketsEnpoint = "https://insightprediction.com/api/markets";
const getMarketEndpoint = (id: number) => `https://insightprediction.com/api/markets/${id}`

/* Support functions */

async function fetchQuestionStats(bearer: string, marketId: number){
  const response = await axios({
    url: getMarketEndpoint(marketId),
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Bearer ${bearer}`,
    },
  }).then((res) => res.data);
  // console.log(response)
  return response;
}

async function fetchPage(bearer: string, pageNum: number) {
  const response = await axios({
    url: `${marketsEnpoint}?page=${pageNum}`,
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Bearer ${bearer}`,
    },
  }).then((res) => res.data);
  // console.log(response)
  return response;
}

async function fetchData(bearer: string){
  let pageNum = 1
  let reachedEnd = false
  let results = []
  while(!reachedEnd){
    let newPage = await fetchPage(bearer, pageNum)
    let newPageData = newPage.data
   
    let marketsWithStats = newPageData.map(marketData => {
      let marketStats = fetchQuestionStats(bearer, marketData.id)
      return ({...marketStats, ...marketData})
    })

    console.log(`Page = #${pageNum}`)
    // console.log(newPageData)
    console.log(marketsWithStats)
    results.push(...marketsWithStats)

    let newPagination = newPage.meta.pagination
    if(newPagination.total_pages == pageNum  ){
      reachedEnd = true
    }else{
      pageNum = pageNum + 1
    }
  }
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

export const insight: Platform = {
  name: platformName,
  label: "Insight Prediction",
  color: "#ff0000",
  version: "v0",
  async fetcher() {
    let bearer = process.env.INSIGHT_BEARER;
    let pageNum = 1
    let data = await fetchData(bearer);
    console.log(data)
    let results = [] // await processPredictions(data); // somehow needed
    return results;
  },
  calculateStars(data) {
    return 2;
  },
};
