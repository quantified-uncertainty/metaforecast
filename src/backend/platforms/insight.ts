/* Imports */
import axios from "axios";

import {FetchedQuestion, Platform} from ".";

/* Definitions */
const platformName = "insight";
const marketsEnpoint = "https://insightprediction.com/api/markets";
const getMarketEndpoint = (id : number) => `https://insightprediction.com/api/markets/${id}`;

/* Support functions */

async function fetchQuestionStats(bearer: string, marketId: number) {
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

async function fetchPage(bearer: string, pageNum: number) {
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

async function fetchData(bearer: string) {
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
        // console.dir(finalObject, {depth: null});
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

async function processPredictions(predictions: any[]) {
    let filteredPredictions = predictions.filter(prediction => !prediction.is_resolved && prediction.category != "Sports")
    let results = filteredPredictions.map((prediction) => {
        const id = `${platformName}-${
            prediction.id
        }`;
        const options: FetchedQuestion["options"] = prediction.options
        const result: FetchedQuestion = {
            id,
            title: prediction.title,
            url: `https:${
                prediction.url
            }`,
            description: prediction.rules,
            options,
            qualityindicators: {
                volume: prediction.volume,
                createdTime: prediction.created_at
                // other: prediction.otherx,
                // indicators: prediction.indicatorx,
            }
        };
        return result;
    });
    // Filter results
    return results; // resultsProcessed
}

/* Body */

export const insight: Platform = {
    name: platformName,
    label: "Insight Prediction",
    color: "#ff0000",
    version: "v1",
    async fetcher() {
        let bearer = process.env.INSIGHT_BEARER;
        let data = await fetchData(bearer);
        let results = await processPredictions(data);
        console.log(results);
        return results;
    },
    calculateStars(data) {
        return 2;
    }
};
