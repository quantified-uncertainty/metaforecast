/* Imports */
import axios from "axios"
import fs from "fs"
import toMarkdown from "./toMarkdown.js"
import { calculateStars } from "./stars.js"

/* Definitions */
let endpoint = "https://sports.williamhill.com/betting/en-gb/politics"

// <header class="header-dropdown header-dropdown--large -expanded" data-id="

/* Support functions */
async function fetchUrl(url){
  let response = await axios(url, {
    "credentials": "include",
    "headers": {
        "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:86.0) Gecko/20100101 Firefox/86.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Upgrade-Insecure-Requests": "1",
        "Cache-Control": "max-age=0"
    },
    "method": "GET",
    "mode": "cors"
  }).then(response => response.data)
  return response

}

let processResults = (html) => {
  let results = []

  let chunks = html.split('<header class="header-dropdown header-dropdown--large -expanded" data-id="')
  chunks.shift()
  
  // Kamala Special
  let kamalaspecial = chunks[0]
  let kamalamarkets = kamalaspecial.split('<div class="btmarket__selection"><p class="btmarket__name"><span>')
  kamalamarkets.shift()
  for(let kamalamarket of kamalamarkets){
    let title = kamalamarket.split('</span>')[0]
    let numerator = Number(kamalamarket.split('data-num="')[1].split('"')[0])
    let denominator = Number(kamalamarket.split('data-denom="')[1].split('"')[0])
    let probability = denominator/(numerator+denominator)
    let obj = ({
      "title": title,
      "url": "https://sports.williamhill.com/betting/en-gb/politics",
      "platform": "WilliamHill",
      "description": "",
      "timestamp": new Date().toISOString(),
      "options": [
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
      ],
      "stars": calculateStars("WilliamHill", ({}))
    })
    results.push(obj)
  }
  chunks.shift()

  // Deal with the other markets
  for(let chunk of chunks){
    let title = chunk.split('"')[0]
    let title2 = chunk.split('<a title="')[1].split('"')[0]
    title = title.length > title2.length ? title : title2

    let options = []
    let alternatives = chunk.split('<div class="btmarket__selection"><p class="btmarket__name"><span>')
    alternatives.shift()
    for(let alternative of alternatives){
      let optionName = alternative.split('</span>')[0]
      let numerator = Number(alternative.split('data-num="')[1].split('"')[0])
      let denominator = Number(alternative.split('data-denom="')[1].split('"')[0])
      let option = ({
        "name":optionName,
        "probability": denominator/(numerator+denominator),
        "type": "PROBABILITY"
      });
      options.push(option)
    }

    // normalize probabilities
    let totalValue = options
      .map(element => Number(element.probability))
      .reduce((a, b) => (a + b), 0)
    options = options.map(element => ({
      ...element,
      probability: Number(element.probability) / totalValue
    }))
    // Filter very unlikely probabilities: Not here, but on the front end
    // options = options.filter(element => element.probability > 0.02)

    let obj = ({
      "title": title,
      "url": "https://sports.williamhill.com/betting/en-gb/politics",
      "platform": "WilliamHill",
      "options": options,
      "qualityindicators": {
        "stars": calculateStars("WilliamHill", ({}))
      }
    })
    results.push(obj)
  }
  
  //console.log(results)
  return results
}

let processhtml2 = (html) => {
  html.split()
}

/* Body */
export async function williamhill() {
  let response = await fetchUrl("https://sports.williamhill.com/betting/en-gb/politics")
  let results = processResults(response)
  let string = JSON.stringify(results, null, 2)
  fs.writeFileSync('./data/williamhill-questions.json', string);
  console.log("Done")
}
//williamhill()
