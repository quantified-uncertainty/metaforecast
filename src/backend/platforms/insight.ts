/* Imports */
import axios from "axios";

import {FetchedQuestion, Platform} from ".";
import toMarkdown from "../utils/toMarkdown";

/* Definitions */
const platformName = "insight";
const marketsEnpoint = "https://insightprediction.com/api/markets?orderBy=is_resolved&sortedBy=asc";
const getMarketEndpoint = (id : number) => `https://insightprediction.com/api/markets/${id}`;

/* Support functions */

// Stubs
const excludeMarketFromTitle = (title : any) => {
  if (!!title) {
    return title.includes(" vs ") || title.includes(" Over: ")
  } else {
    return true
  }
}

const hasActiveYesNoOrderBook = (orderbook : any) => {
  if (!!orderbook) {
    let yes = !!orderbook.yes && !!orderbook.yes.buy && Array.isArray(orderbook.yes.buy) && orderbook.yes.buy.length != 0 && !!orderbook.yes.buy[0].price && !!orderbook.yes.sell && Array.isArray(orderbook.yes.sell) && orderbook.yes.sell.length != 0 && !!orderbook.yes.sell[0].price
    let no = !!orderbook.no && !!orderbook.no.buy && Array.isArray(orderbook.no.buy) && orderbook.no.buy.length != 0 && !!orderbook.no.buy[0].price && !!orderbook.no.sell && Array.isArray(orderbook.no.sell) && orderbook.no.sell.length != 0 && !!orderbook.no.sell[0].price
    return yes && no
  } else {
    return false
  }
}

const isBinaryQuestion = (data : any) => Array.isArray(data) && data.length == 1

const geomMean = (a : number, b : number) => Math.sqrt(a * b)

const processRelativeUrls = (a : string) => a.replaceAll("] (/", "](http://insightprediction.com/").replaceAll("](/", "](http://insightprediction.com/")

const processDescriptionText = (text : any) => {
  if (typeof text === 'string') {
    return processRelativeUrls(toMarkdown(text))
  } else {
    return ""
  }
}

// Fetching
async function fetchPage(bearer: string, pageNum: number) {
  let pageUrl = `${marketsEnpoint}&page=${pageNum}`
  console.log(`Fetching page #${pageNum}`) // : ${pageUrl}
  const response = await axios({
    url: pageUrl, // &orderBy=is_resolved&sortedBy=desc`,
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

async function fetchMarket(bearer: string, marketId: number) {
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


const processMarket = (market : any) => {
  let hasData = !!market && !!market.answer && !!market.answer.data
  if (hasData) {
    let data = market.answer.data
    // console.log("has data")
    if (isBinaryQuestion(data)) {
      let orderbook = data[0].orderbook
      // console.log("has orderbook")
      // console.log(JSON.stringify(orderbook, null, 2))
      if (!! orderbook && hasActiveYesNoOrderBook(orderbook)) { // console.log("has active orderbook")
        let yes_min_cents = orderbook.yes.buy[0].price
        let yes_max_cents = orderbook.yes.sell[0].price
        let yes_min = Number(yes_min_cents.slice(0, -1))
        let yes_max = Number(yes_max_cents.slice(0, -1))
        let yes_price_orderbook = geomMean(yes_min, yes_max)
        let latest_yes_price = data[0].latest_yes_price
        let yes_probability = latest_yes_price ? geomMean(latest_yes_price, yes_price_orderbook) : yes_price_orderbook
        const id = `${platformName}-${
          market.id
        }`;
        const probability = yes_probability / 100;
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
          id: id,
          title: market.title,
          url: market.url,
          description: processDescriptionText(market.rules),
          options,
          qualityindicators: market.coin_id == "USD" ? (
            {volume: market.volume}
          ) : ({})
        };
        return result;

      } else {
        return null
      }
    } else { // non binary question
      return null // for now
    }
  } else {
    return null
  }
}

async function fetchAllMarkets(bearer: string) {
  let pageNum = 1
  let markets = []
  let categories = []
  let isEnd = false
  while (! isEnd) {
    let page = await fetchPage(bearer, pageNum)
    // console.log(JSON.stringify(page, null, 2))
    let data = page.data
    if (!! data && Array.isArray(data) && data.length > 0) {
      let lastMarket = data[data.length - 1]
      let isLastMarketResolved = lastMarket.is_resolved
      if (isLastMarketResolved == true) {
        isEnd = true
      }
      let newMarkets = data.filter(market => !market.is_resolved && !market.is_expired && ! excludeMarketFromTitle(market.title))
      for (let initMarketData of newMarkets) {
        let fullMarketDataResponse = await fetchMarket(bearer, initMarketData.id)
        let fullMarketData = fullMarketDataResponse.data
        let processedMarketData = processMarket(fullMarketData)

        console.log(`- Adding: ${
          fullMarketData.title
        }`)
        console.group()
        console.log(fullMarketData)
        console.log(JSON.stringify(processedMarketData, null, 2))
        console.groupEnd()

        if (processedMarketData != null) {
          markets.push(processedMarketData)
        }
        
        let category = fullMarketData.category
        categories.push(category)

      }
    } else {
      isEnd = true
    } pageNum = pageNum + 1
  }
  console.log(markets)
  console.log(categories)
  return markets
}
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
    if (!! bearer) {
      let data = await fetchAllMarkets(bearer);
      return data
    } else {
      throw Error("No INSIGHT_BEARER available in environment")
    }
    // let results: FetchedQuestion[] = []; // await processPredictions(data); // somehow needed
    // return results;
  },
  calculateStars(data) {
    return 2;
  }
};
