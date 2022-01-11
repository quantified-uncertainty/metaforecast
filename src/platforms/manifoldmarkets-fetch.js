/* Imports */
import fs from 'fs'
import axios from "axios"
import { calculateStars } from "../utils/stars.js"
import { upsert } from "../utils/mongo-wrapper.js"

/* Definitions */
let endpoint = 'https://us-central1-mantic-markets.cloudfunctions.net/markets'

/* Support functions */

async function fetchData() {
    let response = await axios({
        url: endpoint,
        method: 'GET',
        headers: ({
            'Content-Type': 'text/html',
        }),
    })
        .then(response => response.data)
    // console.log(response)
    return response
}

async function processPredictions(predictions) {
    let results = await predictions.map(prediction => {
        let probability = prediction.probability
        let options = [
            {
                "name": "Yes",
                "probability": probability,
                "type": "PROBABILITY"
            },
            {
                "name": "No",
                "probability": 1 - probability,
                "type": "PROBABILITY"
            }
        ]
        let result = ({
            "title": prediction.question,
            "url": prediction.url,
            "platform": "Manifold Markets",
            "description": prediction.description,
            "options": options,
            "timestamp": new Date().toISOString(),
            "qualityindicators": {
                "stars": calculateStars("Manifold Markets", ({
                    volume7days: prediction.volume7days,
                    volume24Hours: prediction.volume24Hours,
                    pool: prediction.pool 
                })),
                "createdTime": prediction.createdTime,
                "volume7Days": prediction.volume7Days,
                "volume24Hours": prediction.volume24Hours,
                "pool": prediction.pool // normally liquidity, but I don't actually want to show it.
            }
        })
        return result
    })
    let unresolvedResults = results.filter(result => !result.isResolved)
	  console.log(unresolvedResults)
    return unresolvedResults //resultsProcessed
}

/* Body */

export async function manifoldmarkets() {
    let data = await fetchData()
    let results = await processPredictions(data) // somehow needed
    // console.log(results)
    // let string = JSON.stringify(results, null, 2)
    // fs.writeFileSync('polyprediction-questions.json', string);
    await upsert(results, "manifoldmarkets-questions")
    console.log("Done")
}
manifoldmarkets()
