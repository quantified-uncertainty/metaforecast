/* Imports */
import fs from 'fs'
import axios from "axios"
import {getCookie, applyIfCookieExists} from "../utils/getCookies.js"
import { Tabletojson } from "tabletojson"
import { calculateStars } from "../utils/stars.js"
import toMarkdown from "../utils/toMarkdown.js"
import { upsert } from "../utils/mongo-wrapper.js"

/* Definitions */
let htmlEndPoint = 'https://www.gjopen.com/questions?page='
let annoyingPromptUrls = ["https://www.gjopen.com/questions/1933-what-forecasting-questions-should-we-ask-what-questions-would-you-like-to-forecast-on-gjopen", "https://www.gjopen.com/questions/1779-are-there-any-forecasting-tips-tricks-and-experiences-you-would-like-to-share-and-or-discuss-with-your-fellow-forecasters"]

/* Support functions */

async function fetchPage(page, cookie) {
  let response = await axios({
    url: htmlEndPoint + page,
    method: 'GET',
    headers: ({
      'Content-Type': 'text/html',
      'Cookie': cookie
    }),
  })
    .then(res => res.data)
  //console.log(response)
  return response
}

async function fetchStats(questionUrl, cookie) {
  let response = await axios({
    url: questionUrl + "/stats",
    method: 'GET',
    headers: ({
      'Content-Type': 'text/html',
      'Cookie': cookie,
      'Referer': questionUrl,
    }),
  })
    .then(res => res.data)
  //console.log(response)

  // Is binary?
  let isbinary = response.includes("binary?&quot;:true")

  let options = []
  if (isbinary) {
    // Crowd percentage
    let htmlElements = response.split("\n")
    let h3Element = htmlElements.filter(str => str.includes("<h3>"))[0]
    // console.log(h3Element)
    let crowdpercentage = h3Element.split(">")[1].split("<")[0]
    let probability = Number(crowdpercentage.replace("%", "")) / 100
    options.push(({
      name: "Yes",
      probability: probability,
      type: "PROBABILITY"
    }), ({
      name: "No",
      probability: +(1 - probability).toFixed(2), // avoids floating point shenanigans
      type: "PROBABILITY"
    }))
  } else {
    let optionsHtmlElement = "<table" + response.split("tbody")[1] + "table>"
    let tablesAsJson = Tabletojson.convert(optionsHtmlElement)
    let firstTable = tablesAsJson[0]
    options = firstTable.map(element => ({
      name: element['0'],
      probability: Number(element['1'].replace("%", "")) / 100,
      type: "PROBABILITY"
    }))
    //console.log(optionsHtmlElement)
    //console.log(options)
  }

  // Description
  let descriptionraw = response.split(`<div id="question-background" class="collapse smb">`)[1]
  let descriptionprocessed1 = descriptionraw.split(`</div>`)[0]
  let descriptionprocessed2 = toMarkdown(descriptionprocessed1)
  let descriptionprocessed3 = descriptionprocessed2.split("\n")
    .filter(string => !string.includes("Confused? Check our"))
    .join("\n")
  let description = descriptionprocessed3

  // Number of forecasts
  let numforecasts = response.split("prediction_sets_count&quot;:")[1].split(",")[0]
  //console.log(numforecasts)

  // Number of predictors
  let numforecasters = response.split("predictors_count&quot;:")[1].split(",")[0]
  //console.log(numpredictors)

  // Calculate the stars
  let minProbability = Math.min(...options.map(option => option.probability))
  let maxProbability = Math.max(...options.map(option => option.probability))
  
  let result = {
    "description": description,
    "options": options,
    "timestamp": new Date().toISOString(),
    "qualityindicators": {
      "numforecasts": numforecasts,
      "numforecasters": numforecasters,
      "stars": calculateStars("Good Judgment Open", ({ numforecasts, minProbability, maxProbability }))
    }
  }
  return result
}

function isNotSignedIn(html){

  let isNotSignedInBool = html.includes("You need to sign in or sign up before continuing") || html.includes("Sign up")
  if(isNotSignedIn){
    console.log("Error: Not signed in.")
  }
  console.log(`isNotSignedIn? ${isNotSignedInBool}`)
  return isNotSignedInBool
}

function isEnd(html){
  let isEndBool = html.includes("No questions match your filter")
  if(isEndBool){
    //console.log(html)
  }
  console.log(`IsEnd? ${isEndBool}`)
  return isEndBool
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* Body */

async function goodjudgmentopen_inner(cookie) {
  let i = 1
  let response = await fetchPage(i, cookie)
  let results = []
  let init = Date.now()
  // console.log("Downloading... This might take a couple of minutes. Results will be shown.")
  while(!isEnd(response) && !isNotSignedIn(response)){
    // console.log(`Page #${i}`)
    let htmlLines = response.split("\n")
    let h5elements = htmlLines.filter(str => str.includes("<h5><a href="))
    let j = 0
    for (let h5element of h5elements) {
      let h5elementSplit = h5element.split('"><span>')
      let url = h5elementSplit[0].split('<a href="')[1]
      if(!annoyingPromptUrls.includes(url)){
        let title = h5elementSplit[1].replace('</span></a></h5>', "")
        await sleep(1000 + Math.random() * 1000) // don't be as noticeable
        try {
          let moreinfo = await fetchStats(url, cookie)
          if (moreinfo.isbinary) {
            if (!moreinfo.crowdpercentage) { // then request again.
              moreinfo = await fetchStats(url, cookie)
            }
          }
          let question = ({
            "title": title,
            "url": url,
            "platform": "Good Judgment Open",
            ...moreinfo
          })
          if(j % 30 == 0){
            console.log(`Page #${i}`)
            console.log(question)
          }
          // console.log(question)
          results.push(question)
        } catch (error) {
          console.log(error)
          console.log(`We encountered some error when fetching the URL: ${url}, so it won't appear on the final json`)
        }
      }
      j = j+1
    }
    i = i + 1
    // console.log("Sleeping for 5secs so as to not be as noticeable to the gjopen servers")
    await sleep(5000 + Math.random() * 1000) // don't be a dick to gjopen server

    try {
      response = await fetchPage(i, cookie)
    } catch (error) {
      console.log(error)
      console.log(`We encountered some error when fetching page #${i}, so it won't appear on the final json`)
    }
  }
  // let string = JSON.stringify(results, null, 2)
  // fs.writeFileSync('./data/goodjudmentopen-questions.json', string);

  if(results.length > 0){
    await upsert(results, "goodjudmentopen-questions")
  }else{
    console.log("Not updating results, as process was not signed in")
  }

  let end = Date.now()
  let difference = end - init
  console.log(`Took ${difference / 1000} seconds, or ${difference / (1000 * 60)} minutes.`)
}

export async function goodjudgmentopen(){
  let cookie = process.env.GOODJUDGMENTOPENCOOKIE || getCookie("goodjudmentopen")
  await applyIfCookieExists(cookie, goodjudgmentopen_inner)
}
