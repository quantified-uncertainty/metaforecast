/* Imports */
import fs from 'fs'
import axios from "axios"
import https from "https"
import fetch from "isomorphic-fetch"
import {getCookie, applyIfCookieExists} from "../utils/getCookies.js"
import toMarkdown from "../utils/toMarkdown.js"
import { calculateStars } from "../utils/stars.js"
import { upsert } from "../utils/mongo-wrapper.js"

/* Definitions */
let hypermindEnpoint1 = 'https://predict.hypermind.com/dash/jsx.json'
let hypermindEnpoint2 = 'https://prod.hypermind.com/ngdp-jsx/jsx.json'
const insecureHttpsAgent = new https.Agent({
  rejectUnauthorized: false, // (NOTE: this will disable client verification)
})

/* Support Functions */
String.prototype.replaceAll = function replaceAll(search, replace) { return this.split(search).join(replace); }

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* Fetchers */
async function fetchHypermindData1(slug) {
  let jsx = `jsx=%5B%5B%22dataMgr%22%2C%22getGQList%22%2C%7B%22listName%22%3A%20%22${slug}%22%2C%22format%22%3A%20%7B%22props%22%3A%20true%2C%22posts%22%3A%20true%2C%22cond%22%3A%20%7B%22props%22%3A%20true%2C%22otcm%22%3A%20%7B%22tradingHistory%22%3A%20true%2C%22props%22%3A%20true%7D%7D%2C%22otcm%22%3A%20%7B%22tradingHistory%22%3A%20true%2C%22props%22%3A%20true%7D%7D%7D%5D%5D`
  // console.log(jsx)
  let response = await await axios(hypermindEnpoint1, {
    "credentials": "omit",
    "headers": {
        "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:90.0) Gecko/20100101 Firefox/90.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Cache-Control": "max-age=0"
    },
    "referrer": `https://predict.hypermind.com/dash/dash/dash.html?list=${slug}`,
    "data": jsx,
    "method": "POST",
    "mode": "cors",
    httpsAgent: insecureHttpsAgent
  }).then(response => response.data[0].questions)
  //console.log(response)
  return response
}

async function fetchHypermindDataShowcases(slug, cookie) {
  let response = await axios(hypermindEnpoint2, {
    "credentials": "include",
    "headers": {
      "User-Agent": "",
      "Accept": "*/*",
      "Accept-Language": "en-US,en;q=0.5",
      "Content-Type": "application/json; charset=UTF-8",
      //"Cookie": cookie
    },
    "referrer": "https://prod.hypermind.com/ngdp/en/showcase/showcase.html?inFrame=true",
    "data": `[["showcase","getShowcase",{"showcase":"${slug}","fmt":{"fcsterCnt":true,"crowdFcst":true,"crowdFcstHist":true}}]]`,
    "method": "POST",
    "mode": "cors",
    httpsAgent: insecureHttpsAgent
    }).then(resp => resp.data[0].items)
    .then(items => items.filter(item => item.type == "IFP"))
    .then(items => items.map(item => item.IFP))
  
  // console.log(response)
  response.forEach(item => delete item.crowdFcstHist)
  return response
}

/* Body */
async function hypermind_inner(cookie) {

  // Hypermind panelists and competitors; dashboard type two: "showcase"
  // https://prod.hypermind.com/ngdp/fr/showcase2/showcase.html?sc=SLUG
  // E.g., https://prod.hypermind.com/ngdp/fr/showcase2/showcase.html?sc=AI2023
  let slugs2 = [ "AI2030", "Covid19" , "DOSES", "H5N8", "NGDP", "JSAI", "AI2023" ] // []
  let results2 = []
  for(let slug of slugs2){
    console.log(slug)
    await sleep(1000 + Math.random() * 1000)
    let response = await fetchHypermindDataShowcases(slug)
    let objs = response.map(result => {
      let descriptionraw = result.props.details.split("<hr size=1>")[0]
      let descriptionprocessed1 = toMarkdown(descriptionraw)
      let descriptionprocessed2 = descriptionprocessed1.replaceAll("![image] ()", "")
      let descriptionprocessed3 = descriptionprocessed2.replaceAll(" Forecasting Schedule ", "")
      let descriptionprocessed4 = descriptionprocessed3.replaceAll("\n", " ").replaceAll("  ", " ")
      let descriptionprocessed5 = descriptionprocessed4.replaceAll("Context:", "")
      let description = descriptionprocessed5 || toMarkdown(result.props.details)
      return ({
        "title": result.props.title,
        "url": "https://prod.hypermind.com/ngdp/fr/showcase2/showcase.html?sc="+slug,
        "platform": "Hypermind",
        "description": description,
        "options": [],
        "qualityindicators": {
          "stars": calculateStars("Hypermind", ({})),
          "numforecasters": Number(result.fcsterCnt)
        }
      })
    })
    // console.log(objs)
    results2.push(...objs)
  }

  // Prediction markets; dashboard type one.
  // https://predict.hypermind.com/dash/dash/dash.html?list=SLUG
  // e.g., https://predict.hypermind.com/dash/dash/dash.html?list=POL
  let slugs1 = ["USA", "FRA", "AFR", "INT", "COV", "POL", "ECO"] // []
  let results1 = []

  for (let slug of slugs1) {
    console.log(slug)
    await sleep(2000 + Math.random() * 2000)
    let result = await fetchHypermindData1(slug)
    let objs = result.map(res => {
      let descriptionraw = res.props.details
      let descriptionprocessed1 = descriptionraw.split("%%fr")[0]
      let descriptionprocessed2 = descriptionprocessed1.replaceAll("<BR>", "\n")
      let descriptionprocessed3 = descriptionprocessed2.replace("%%en:", "")
      let descriptionprocessed4 = descriptionprocessed3.replace(`Shares of the correct outcome will be worth 100<sup>ℍ</sup>, while the others will be worthless (0<sup>ℍ</sup>).<p>`, "")
      let descriptionprocessed5 = toMarkdown(descriptionprocessed4)
      let description = descriptionprocessed5.replaceAll("\n", " ").replaceAll("  ", " ")
      //console.log(res.otcms)
      //let percentage = (res.otcms.length==2) ? Number(res.otcms[0].price).toFixed(0) +"%" : "none"
      let options = res.otcms.map(option => ({
        "name": option.props.title
          .split("%%fr")[0]
          .replaceAll("%%en:", ""),
        "probability": Number(option.price) / 100,
        "type": "PROBABILITY"
      }))
      return ({
        "title": res.props.title.split("%%fr")[0].replace("%%en:", ""),
        "url": "https://predict.hypermind.com/dash/dash/dash.html?list=" + slug,
        "platform": "Hypermind",
        "description": description,
        "options": options,
        "timestamp": new Date().toISOString(),
        "qualityindicators": {
          "stars": calculateStars("Hypermind", ({})),
          // "numforecasters": res.fcsterCnt
        }
      })
    })
    // console.log(objs)
    results1.push(...objs)
  }

  

  let resultsTotal = [...results1, ...results2]

  let distinctTitles = []
  let resultsTotalUnique = []
  for (let result of resultsTotal) {
    if (!distinctTitles.includes(result["title"])) {
      resultsTotalUnique.push(result)
      distinctTitles.push(result["title"])
    }
  }
  // console.log(resultsTotal)
  console.log(resultsTotalUnique)
  console.log(resultsTotalUnique.length, "results")
  // let string = JSON.stringify(resultsTotalUnique, null, 2)
  // fs.writeFileSync('./data/hypermind-questions.json', string);
  await upsert(resultsTotalUnique, "hypermind-questions")

}
//hypermind()

export async function hypermind() {
  let cookie = process.env.HYPERMINDCOOKIE || getCookie("hypermind") 
  await applyIfCookieExists(cookie, hypermind_inner)
}