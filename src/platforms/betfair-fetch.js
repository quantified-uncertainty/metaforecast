/* Imports */
import fs from 'fs'
import axios from "axios"
import https from 'https';
import toMarkdown from "../utils/toMarkdown.js"
import { calculateStars } from "../utils/stars.js"
import {upsert} from "../utils/mongo-wrapper.js"

/* Definitions */
let endpoint = process.env.SECRET_BETFAIR_ENDPOINT

/* Support functions */

async function fetchPredictions() {
  const agent = new https.Agent({  
    rejectUnauthorized: false
  });
  let response = await axios({
    url: endpoint,
    method: 'GET',
    headers: ({
      'Content-Type': 'text/html',
    }),
    httpsAgent: agent
  })
    .then(response => response.data)
  // console.log(response)
  return response
}

async function whipIntoShape(data){
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
  }
  
  let catalogues = data.market_catalogues
  let books = data.market_books
  let keys1 = Object.keys(catalogues)
  let keys2 = Object.keys(books)
  let results = ({})
  if(!arraysEqual(keys1, keys2)){
    throw new Error("Betfair: Error in endpoint; Betfair catalogues and books do not match")
  }else{
    for(catalogue in catalogues){
      console.log(catalogue)
    }
    for(book in books){
      console.log(book)
    }
  }
  return results
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
      "title": prediction.title,
      "url": `https://example.com`,
      "platform": "Example",
      "description": prediction.description,
      "options": options,
      "timestamp": new Date().toISOString(),
      "qualityindicators": {
          "stars": calculateStars("Example", ({some: somex, factors: factors})),
          "other": prediction.otherx,
          "indicators": prediction.indicatorx
        }
    })
    return result
  })
  return results //resultsProcessed
}

/* Body */

export async function betfair() {
  let predictions = await fetchPredictions()
  whipIntoShape(predictions)
  let results = await processPredictions(predictions) // somehow needed
  // console.log(results)
  // let string = JSON.stringify(results, null, 2)
  // fs.writeFileSync('polyprediction-questions.json', string);
  // await upsert(results, "example-questions")
  console.log("Done")
}
betfair()
