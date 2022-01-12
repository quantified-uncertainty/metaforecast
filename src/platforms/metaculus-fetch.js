/* Imports */
import axios from "axios"
import fs from 'fs'
import toMarkdown from "../utils/toMarkdown.js"
import { calculateStars } from "../utils/stars.js"
import {upsert} from "../utils/mongo-wrapper.js"

/* Definitions */
let jsonEndPoint = 'https://www.metaculus.com/api2/questions/?page='
let all_questions = [];
let now = new Date().toISOString()

/* Support functions */
async function fetchMetaculusQuestions(next) {
  // Numbers about a given address: how many, how much, at what price, etc.
  let response = await axios(({
    url: next,
    method: 'GET',
    headers: ({ 'Content-Type': 'application/json' })
  }))
    .then(res => res.data)
  // console.log(response)
  return response
}


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchMetaculusQuestionDescription(slug) {
  try {
    let response = await axios({
      method: 'get',
      url: "https://www.metaculus.com" + slug
    }).then(response => response.data)
    return response
  } catch (error) {
    console.log(error)
    console.log(`We encountered some error when attempting to fetch a metaculus page. Trying again`)
    await sleep(10000)
    try {
      let response = await axios({
        method: 'get',
        url: "https://www.metaculus.com" + slug
      }).then(response => response.data)
      // console.log(response)
      return response
    } catch (error) {
      console.log(`We encountered some error when attempting to fetch a metaculus page.`)
      console.log("Error", error)
      throw "Giving up"
    }
  }

}

/* Body */

export async function metaculus() {

  // let metaculusQuestionsInit = await fetchMetaculusQuestions(1)
  // let numQueries = Math.round(Number(metaculusQuestionsInit.count) / 20)
  // console.log(`Downloading... This might take a while. Total number of queries: ${numQueries}`)
  // for (let i = 4; i <= numQueries; i++) { // change numQueries to 10 if one want to just test
  let next = "https://www.metaculus.com/api2/questions/"
  let i = 1
  while(next){
    if (i % 20 == 0) {
      console.log("Sleeping for 5secs")
      await sleep(5000)
    }
    console.log(`\nQuery #${i}`)
    let metaculusQuestions = await fetchMetaculusQuestions(next)
    let results = metaculusQuestions.results;
    let j=false
    for (let result of results) {
      if (
        (result.publish_time < now) &&
        (now < result.resolve_time)
      ) {
        await sleep(5000) 
        let questionPage = await fetchMetaculusQuestionDescription(result.page_url)
        if(!questionPage.includes("A public prediction by")){
          // console.log(questionPage)
          let descriptionraw = questionPage.split(`<div class="content" ng-bind-html-compile="qctrl.question.description_html">`)[1] //.split(`<div class="question__content">`)[1]
          let descriptionprocessed1 = descriptionraw.split("</div>")[0]
          let descriptionprocessed2 = toMarkdown(descriptionprocessed1)
          let description = descriptionprocessed2
  
          let isbinary = result.possibilities.type == "binary"
          let options = []
          if (isbinary) {
            let probability = Number(result.community_prediction.full.q2)
            options = [
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
          }
          let interestingInfo = ({
            "title": result.title,
            "url": "https://www.metaculus.com" + result.page_url,
            "platform": "Metaculus",
            "description": description,
            "options": options,
            "timestamp": new Date().toISOString(),
            "qualityindicators": {
              "numforecasts": Number(result.number_of_predictions),
              "stars": calculateStars("Metaculus", ({ numforecasts: result.number_of_predictions }))
            }, 
            "extra": {
              "resolution_data": {
                "publish_time": result.publish_time,
                "resolution": result.resolution,
                "close_time": result.close_time,
                "resolve_time": result.resolve_time                  
              }
            }
            //"status": result.status,
            //"publish_time": result.publish_time,
            //"close_time": result.close_time,
            //"type": result.possibilities.type, // We want binary ones here.
            //"last_activity_time": result.last_activity_time,
          })
          if (Number(result.number_of_predictions) >= 10) {
            console.log(`- ${interestingInfo.title}`)
            all_questions.push(interestingInfo)
            if(!j && (i % 20 == 0)){
              console.log(interestingInfo)
              j = true
            }
          }
        }else{
          console.log("- [Skipping public prediction]")
        }
        

      }
    }
    next = metaculusQuestions.next
    i = i+1
  }

  // let string = JSON.stringify(all_questions, null, 2)
  // fs.writeFileSync('./metaculus-questions.json', string);
  await upsert(all_questions, "metaculus-questions")

  console.log("Done")
}
//metaculus()
