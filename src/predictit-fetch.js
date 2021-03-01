/* Imports */
import fs from 'fs'
import axios from "axios"
import toMarkdown from "./toMarkdown.js"
import {getstars} from "./stars.js"

/* Support functions */
async function fetchmarkets(){
  let response = await axios({
    method: 'get',
    url: 'https://www.predictit.org/api/marketdata/all/'

  })
  return response.data.markets
}

async function fetchmarketrules(market_id){
  let response = await axios({
    method: 'get',
    url: 'https://www.predictit.org/api/Market/'+market_id
  })
  return response.data.rule
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


/* Body */
export async function predictit(){
  let response = await fetchmarkets()
  console.log(response)
  let result=[]
  for(let market of response){
    let isbinary = market.contracts.length == 1;
    await sleep(3000*(1+Math.random()))
    let descriptionraw = await fetchmarketrules(market.id)
    let descriptionprocessed1 = toMarkdown(descriptionraw)
    let description= descriptionprocessed1
    let percentageFormatted = isbinary? Number(Number(market.contracts[0].lastTradePrice)*100).toFixed(0)+"%" : "none"

    let options = market.contracts.map(contract => ({
      "name": contract.name,
      "probability": contract.lastTradePrice,
      "type": "PROBABILITY"
    }))
    let totalValue = options
    .map(element => Number(element.probability))
    .reduce((a,b) => (a+b), 0)
    
    if(options.length != 1 && totalValue>1){
      options = options.map(element => ({
        ...element,
        probability: Number(element.probability)/totalValue
      }))
    }else if(options.length == 1){
      let option = options[0]
      let probability = option["probability"]
      options = [
          {
            "name": "Yes",
            "probability": probability,
            "type": "PROBABILITY"
          },
          {
            "name": "No",
            "probability": 1-probability,
            "type": "PROBABILITY"
          }
        ]
    }

    let obj = ({
      "title": market["name"],
      "url": market.url,
      "platform": "PredictIt",
      "options": options,
      "description": description,
      "stars": 2
      //"qualityindicators": {}
    })
    console.log(obj)
    result.push(obj)
  }
  //console.log(result)
  let string = JSON.stringify(result,null,  2)
  fs.writeFileSync('./data/predictit-questions.json', string);
  console.log("Done")
}
