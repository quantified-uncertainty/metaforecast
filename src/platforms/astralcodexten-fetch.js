/* Imports */
import fs from 'fs'
import axios from "axios"
import { calculateStars } from "../utils/stars.js"
import { upsert } from "../utils/mongo-wrapper.js"

/* Definitions */
let graphQLendpoint = "https://api.foretold.io/graphql"
let ScottAlexanderPredictions = ["6eebf79b-4b6f-487b-a6a5-748d82524637"]

/* Support functions */
async function fetchAllCommunityQuestions(communityId) {
  let response = await axios({
    url: graphQLendpoint,
    method: 'POST',
    headers: ({ 'Content-Type': 'application/json' }),
    data: JSON.stringify(({
      query: `
      query {
        measurables(
          channelId: "${communityId}",
          states: OPEN,
          first: 500
        ){
		      total
          edges{
            node{
              id
              name
              valueType
              measurementCount
              previousAggregate{
                value{
                  percentage
                }
              }
            }
          }
        }
      }
      `
    })),
  })
    .then(res => res.data)
    .then(res => res.data.measurables.edges)
  //console.log(response)
  return response
}

/* Body */

export async function astralcodexten(){
  let results = []
  for(let community of ScottAlexanderPredictions){
    let questions = await fetchAllCommunityQuestions(community)
    questions = questions.map(question => question.node)
    questions = questions.filter(question => question.previousAggregate) // Questions without any predictions
    questions.forEach(question => {
      let options = []
      if(question.valueType == "PERCENTAGE"){
        let probability = question.previousAggregate.value.percentage
        options = [
          {
            "name": "Yes",
            "probability": probability/100,
            "type": "PROBABILITY"
          },
          {
            "name": "No",
            "probability": 1-probability/100,
            "type": "PROBABILITY"
          }
        ]
      } 
      let result = {
          "title": question.name.split(". ")[1],
          "url": `https://www.foretold.io/c/${community}/m/${question.id}`,
          "platform": "AstralCodexTen",
          "description": "...by the end of 2021",
          "options": options,
          "timestamp": new Date().toISOString(),
          "qualityindicators": {
            "numforecasts": Number((question.measurementCount +1) / 2),
            "stars": calculateStars("AstralCodexTen", ({  }))
            }
          /*liquidity: liquidity.toFixed(2),
          tradevolume: tradevolume.toFixed(2),
          address: obj.address*/
      }
      // console.log(result)
      results.push(result)
    })
  }
  // let string = JSON.stringify(results, null, 2)
  // fs.writeFileSync('./data/foretold-questions.json', string);
  // console.log(JSON.stringify(results, null, 2))
  await upsert(results, "astralcodexten-questions")
  // console.log(results)
  console.log("Done")
}
// astralcodexten()
