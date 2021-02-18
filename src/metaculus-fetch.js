/* Imports */
import axios from "axios"
import fs from 'fs'
import toMarkdown from "./toMarkdown.js"
import {getstars} from "./stars.js"

/* Definitions */
let jsonEndPoint = 'https://www.metaculus.com/api2/questions/?page='
let all_questions = [];
let now = new Date().toISOString()

/* Support functions */
async function fetchMetaculusQuestions(page=1){
  // Numbers about a given address: how many, how much, at what price, etc.
  let response  = await axios(({
    url: jsonEndPoint+page,
    method: 'GET',
    headers: ({ 'Content-Type': 'application/json' })
  }))
  .then(res => res.data)
  //console.log(response)
  return response
}


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchMetaculusQuestionDescription(slug){
  try{
    let response = await axios({
    method: 'get',
      url: "https://www.metaculus.com" + slug
    }).then(response => response.data)
    return response
  }catch(error){
    console.log(`We encountered some error when attempting to fetch a metaculus page. Trying again`)
    await sleep(10000)
    try{
      let response = await axios({
      method: 'get',
        url: "https://www.metaculus.com" + slug
      }).then(response => response.data)
      return response
    }catch(error){
      console.log(`We encountered some error when attempting to fetch a metaculus page.`)
      console.log("Error", error)
      throw "Giving up"
    }
  }

}

/* Body */

export async function metaculus(){

  let metaculusQuestionsInit = await fetchMetaculusQuestions(1)
  let numQueries = Math.round(Number(metaculusQuestionsInit.count)/20)
  console.log(`Downloading... This might take a while. Total number of queries: ${numQueries}`)
  for(let i = 4; i <= numQueries; i++){ // change numQueries to 10 if one want to just test
    if (i%20 == 0){
      console.log("Sleeping for 5secs")
      await sleep(5000)
    }
    console.log(`Query #${i}`)
    let metaculusQuestions = await fetchMetaculusQuestions(i)
    let results = metaculusQuestions.results;
    for(let result of results){
      if(
        (result.publish_time < now) && 
        (now < result.close_time)
      ){
        //console.log(result)
        await sleep(1000)
        let questionPage = await fetchMetaculusQuestionDescription(result.page_url)
        let descriptionraw = questionPage.split(`<div class="question__content">`)[1]
        let descriptionprocessed1 = descriptionraw.split("</div>")[0]
        let descriptionprocessed2 = toMarkdown(descriptionprocessed1)
        let description = descriptionprocessed2
        
        let isbinary = result.possibilities.type == "binary"  
        let options = []
        if(isbinary){
          let probability = Number(result.community_prediction.full.q2)
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
        let interestingInfo = ({
          "title": result.title,
          "url": "https://www.metaculus.com" + result.page_url,
          "platform": "Metaculus",
          "options": options,
          "description": description,
          "numforecasts": result.number_of_predictions,
          "stars": result.number_of_predictions > 300? 4:(result.number_of_predictions > 100? 3: 2)
          //"status": result.status,
          //"publish_time": result.publish_time,
          //"close_time": result.close_time,
          //"type": result.possibilities.type, // We want binary ones here.
          //"last_activity_time": result.last_activity_time,
        })
        if(Number(result.number_of_predictions) >= 10){
          console.log(interestingInfo)
          all_questions.push(interestingInfo)
        }
        
      }
    }
  }
  
  let string = JSON.stringify(all_questions,null,  2)
  fs.writeFileSync('./data/metaculus-questions.json', string);
  console.log("Done")
}
//metaculus()
