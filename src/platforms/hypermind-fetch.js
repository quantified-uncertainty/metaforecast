/* Imports */
import fs from 'fs'
import axios from "axios"
import toMarkdown from "../utils/toMarkdown.js"
import { calculateStars } from "../utils/stars.js"
import { upsert } from "../utils/mongo-wrapper.js"

/* Definitions */
let hypermindEnpoint1 = 'https://predict.hypermind.com/dash/jsx.json'

/* Support Functions */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getcookie() {
  try {
    let rawcookie = fs.readFileSync("./src/input/privatekeys.json")
    let cookie = JSON.parse(rawcookie).hypermindcookie
    if (cookie == undefined) {
      throw new Error('No cookie for Hypermind!');
    }
    return cookie
  } catch (error) {
    console.log("Error: No cookies for Hypermind on src/privatekeys.json! See the README.md")
    process.exit()
  }
}

async function fetchHypermindData1(slug) {
  let response = await axios("https://predict.hypermind.com/dash/jsx.json", {
    "credentials": "omit",
    "headers": {
      "User-Agent": "",
      "Accept": "*/*",
      "Accept-Language": "en-US,en;q=0.5",
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
    },
    "referrer": `https://predict.hypermind.com/dash/dash/dash.html?list=${slug}`,
    "data": `jsx=%5B%5B%22dataMgr%22%2C%22getGQList%22%2C%7B%22listName%22%3A%20%22${slug}%22%2C%22format%22%3A%20%7B%22props%22%3A%20true%2C%22posts%22%3A%20true%2C%22cond%22%3A%20%7B%22props%22%3A%20true%2C%22otcm%22%3A%20%7B%22tradingHistory%22%3A%20true%2C%22props%22%3A%20true%7D%7D%2C%22otcm%22%3A%20%7B%22tradingHistory%22%3A%20true%2C%22props%22%3A%20true%7D%7D%7D%5D%5D`,
    "method": "POST",
    "mode": "cors"
  }).then(resp => resp.data[0].questions)
  return response
}

async function fetchHypermindData2() {
  let response = await axios("https://prod.hypermind.com/ngdp-jsx/jsx.json", {
    "credentials": "include",
    "headers": {
      "User-Agent": "",
      "Accept": "*/*",
      "Accept-Language": "en-US,en;q=0.5",
      "Content-Type": "application/json; charset=UTF-8",
      "Cookie": getcookie()
    },
    "referrer": "https://prod.hypermind.com/ngdp/en/showcase/showcase.html?inFrame=true",
    "data": `[["showcase","queryIFPs",{"query":{"showcaseOnly":true},"fmt":{"stats":true,"crowdFcstHist":true}}]]`,
    "method": "POST",
    "mode": "cors"
  }).then(resp => resp.data[0])
  return response
}

async function fetchHypermindData3() {
  let response = await axios("https://prod.hypermind.com/ngdp-jsx/jsx.json", {
    "credentials": "include",
    "headers": {
      "User-Agent": "",
      "Accept": "*/*",
      "Accept-Language": "en-US,en;q=0.5",
      "Content-Type": "application/json; charset=UTF-8",
      "Cookie": getcookie()
    },
    "referrer": "https://prod.hypermind.com/ngdp/en/showcase/showcase.html?inFrame=true",
    "data": `[["showcase","getShowcase",{"showcase":"Covid19","fmt":{"fcsterCnt":true,"crowdFcst":true,"crowdFcstHist":true}}]]`,
    "method": "POST",
    "mode": "cors"
  })
    .then(resp => resp.data[0].items)
    .then(items => items.filter(item => item.type == "IFP"))
    .then(items => items.map(item => item.IFP))
  //console.log(response)
  return response
}

async function fetchHypermindData4() {
  let response = await axios("https://prod.hypermind.com/ngdp-jsx/jsx.json", {
    "credentials": "include",
    "headers": {
      "User-Agent": "",
      "Accept": "*/*",
      "Accept-Language": "en-US,en;q=0.5",
      "Content-Type": "application/json; charset=UTF-8",
      "Cookie": getcookie()
    },
    "referrer": "https://prod.hypermind.com/ngdp/en/showcase/showcase.html?inFrame=true",
    "data": `[["showcase","getShowcase",{"showcase":"AI2023","fmt":{"fcsterCnt":true,"crowdFcst":true,"crowdFcstHist":true}}]]`,
    "method": "POST",
    "mode": "cors"
  })
    .then(resp => resp.data[0].items)
    .then(items => items.filter(item => item.type == "IFP"))
    .then(items => items.map(item => item.IFP))
  //console.log(response)
  return response
}

/* Body */
export async function hypermind() {
  let slugs = ["USA", "FRA", "AFR", "INT", "COV", "POL", "ECO"]

  let results1 = []

  for (let slug of slugs) {
    console.log(slug)
    await sleep(2000 + Math.random() * 2000)
    let result = await fetchHypermindData1(slug)
    //console.log(result)

    let objs = result.map(res => {
      let descriptionraw = res.props.details
      let descriptionprocessed1 = descriptionraw.split("%%fr")[0]
      let descriptionprocessed2 = descriptionprocessed1.replaceAll("<BR>", "\n")
      let descriptionprocessed3 = descriptionprocessed2.replace("%%en:", "")
      let descriptionprocessed4 = descriptionprocessed3.replace(`Shares of the correct outcome will be worth 100<sup>ℍ</sup>, while the others will be worthless (0<sup>ℍ</sup>).<p>`, "")
      let descriptionprocessed5 = toMarkdown(descriptionprocessed4)
      let description = descriptionprocessed5.replaceAll("\n", "")
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
        }
      })
    })
    results1.push(...objs)
  }

  console.log("GDP")
  await sleep(1000 + Math.random() * 1000)
  let results2 = await fetchHypermindData2()
  let results2processed = results2.map(res => {
    //console.log(res.props.details)
    let descriptionraw = res.props.details.split("<hr size=1>")[0]
    let descriptionprocessed1 = toMarkdown(descriptionraw)
    let descriptionprocessed2 = descriptionprocessed1.split("![image]")[0]
    let description = descriptionprocessed2
    //console.log(description)
    return ({
      "title": res.props.title,
      "url": "https://prod.hypermind.com/ngdp/en/showcase/showcase.html",
      "platform": "Hypermind",
      "description": description,
      "options": [],
      "qualityindicators": {
        "stars": calculateStars("Hypermind", ({})),
      }
    })
  })


  console.log("COVID-19 OpenPhil")
  await sleep(1000 + Math.random() * 1000)
  let results3 = await fetchHypermindData3()
  //  console.log(results3)
  let results3processed = results3.map(res => {
    let descriptionraw = res.props.details.split("<hr size=1>")[0]
    let descriptionprocessed1 = toMarkdown(descriptionraw)
    let descriptionprocessed2 = descriptionprocessed1.split("![image]")[0]
    let description = descriptionprocessed2
    return ({
      "title": res.props.title,
      "url": "https://prod.hypermind.com/ngdp/en/showcase2/showcase.html?sc=Covid19",
      "platform": "Hypermind",
      "description": description,
      "options": [],
      "qualityindicators": {
        "stars": calculateStars("Hypermind", ({})),
      }
    })
  })

  console.log("AI in 2023")
  await sleep(1000 + Math.random() * 1000)
  let results4 = await fetchHypermindData4()
  console.log(results4)
  let results4processed = results2.map(res => {
    let description = res.props.details
    return ({
      "title": res.props.title,
      "url": "https://prod.hypermind.com/ngdp/en/showcase2/showcase.html?sc=AI2023",
      "platform": "Hypermind",
      "description": description,
      "options": [],
      "qualityindicators": {
        "stars": calculateStars("Hypermind", ({})),
      }
    })
  })

  let resultsTotal = [...results1, ...results2processed, ...results3processed, ...results4processed]

  let distinctTitles = []
  let resultsTotalUnique = []
  for (let result of resultsTotal) {
    if (!distinctTitles.includes(result["title"])) {
      resultsTotalUnique.push(result)
      distinctTitles.push(result["title"])
    }
  }
  //console.log(resultsTotalUnique)
  // let string = JSON.stringify(resultsTotalUnique, null, 2)
  // fs.writeFileSync('./data/hypermind-questions.json', string);
  await upsert(resultsTotalUnique, "hypermind-questions")

}
//hypermind()
