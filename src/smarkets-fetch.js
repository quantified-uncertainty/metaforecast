/* Imports */
import fs from 'fs'
import axios from "axios"
import {getstars} from "./stars.js"
import toMarkdown from "./toMarkdown.js"

/* Definitions */
let htmlEndPointEntrance = 'https://api.smarkets.com/v3/events/'

/* Support functions */

async function fetchEvents(url){
  let response  = await axios({
    url: htmlEndPointEntrance+url,
    method: 'GET',
    headers: ({ 
    'Content-Type': 'text/html',
    }),
  })
  .then(res => res.data)
  //console.log(response)
  return response
}

async function fetchMarkets(eventid){
  let response  = await axios({
    url: `https://api.smarkets.com/v3/events/${eventid}/markets/`,
    method: 'GET',
    headers: ({ 
    'Content-Type': 'text/json',
    }),
  })
  .then(res => res.data)
  .then(res => res.markets)
  return response
}

async function fetchContracts(marketid){
  let response  = await axios({
    url: `https://api.smarkets.com/v3/markets/${marketid}/contracts/`,
    method: 'GET',
    headers: ({ 
    'Content-Type': 'text/html',
    }),
  })
  .then(res => res.data)
  //console.log(response)
  return response

}

async function fetchPrices(marketid){
  let response  = await axios({
    url: `https://api.smarkets.com/v3/markets/${marketid}/last_executed_prices/`,
    method: 'GET',
    headers: ({ 
    'Content-Type': 'text/html',
    }),
  })
  .then(res => res.data)
  //console.log(response)
  return response

}

/* Body */

export async function smarkets(){
  let htmlPath = '?state=new&state=upcoming&state=live&type_domain=politics&type_scope=single_event&with_new_type=true&sort=id&limit=50'
  
  let events = []
  while(htmlPath){
    let data = await fetchEvents(htmlPath)
    events.push(...data.events)
    htmlPath = data.pagination.next_page
  }
  //console.log(events)
  
  let markets = []
  for(let event of events){
    //console.log(Date.now())
    //console.log(event.name)
    let eventMarkets = await fetchMarkets(event.id)
    eventMarkets = eventMarkets.map(market => ({...market, slug:event.full_slug}))
    //console.log("Markets fetched")
    //console.log(event.id)
    //console.log(market)
    markets.push(...eventMarkets)
    //let lastPrices = await fetchPrices(market.id)
  }
  //console.log(markets)
  
  let results = []
  for(let market of markets){
    //console.log("================")
    //console.log("Market: ", market)
    let name = market.name

    let contracts = await fetchContracts(market.id)
    //console.log("Contracts: ", contracts)
    let prices = await fetchPrices(market.id)
    //console.log("Prices: ", prices["last_executed_prices"][market.id])

    let options = {}
    for(let contract of contracts["contracts"]){
      options[contract.id] = {name: contract.name}
    }
    for(let price of prices["last_executed_prices"][market.id]){
      options[price.contract_id] = {...options[price.contract_id], 
        probability: Number(price.last_executed_price),
        type: "PROBABILITY"
      }
    }
    options = Object.values(options)
    let totalValue = options
      .map(element => Number(element.probability))
      .reduce((a,b) => (a+b), 0)
    
    options = options.map(element => ({
      ...element,
      probability: Number(element.probability)/totalValue
    }))

    //console.log(options)

    /*
    if(contracts["contracts"].length == 2){
      isBinary = true
      percentage = ( Number(prices["last_executed_prices"][market.id][0].last_executed_price) + (100 - Number(prices["last_executed_prices"][market.id][1].last_executed_price)) ) / 2
      percentage = Math.round(percentage)+"%"
      let contractName = contracts["contracts"][0].name
      name = name+ (contractName=="Yes"?'':` (${contracts["contracts"][0].name})`)
    }
    */
    let result = {
      "title": name,
      "url": "https://smarkets.com/event/"+ market.event_id +  market.slug,
      "platform": "Smarkets",
      "options": options,
      "description": market.description, 
      "stars": 2
    }
    //console.log(result)
    results.push(result)
  }
  //console.log(results)

  let string = JSON.stringify(results,null,  2)
  fs.writeFileSync('./data/smarkets-questions.json', string);

}
//smarkets()
