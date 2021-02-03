/* Imports */
import fs from 'fs'
import axios from "axios"
import textVersion from "textversionjs"

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
  //console.log(response)
  let result=[]
  for(let market of response){
    let isbinary = market.contracts.length == 1;
    await sleep(3000*(1+Math.random()))
    let descriptionraw = await fetchmarketrules(market.id)
    let descriptionprocessed1 = textVersion(descriptionraw)
    let description= descriptionprocessed1
    
    let obj = ({
      Title: market["name"],
      URL: market.url,
      Platform: "PredictIt",
      "Binary question?": isbinary,
      "Percentage": isbinary? Number(Number(market.contracts[0].lastTradePrice)*100).toFixed(0)+"%" : "none",
      "Description": description
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
