/* Imports */
import fs from "fs";
import axios from "axios";
import { calculateStars } from "../utils/stars.js";
import { databaseUpsert } from "../database/database-wrapper.js";

/* Definitions */
let graphQLendpoint = "https://api.foretold.io/graphql";
let highQualityCommunities = [
  "0104d8e8-07e4-464b-8b32-74ef22b49f21",
  "c47c6bc8-2c9b-4a83-9583-d1ed80a40fa2",
  "cf663021-f87f-4632-ad82-962d889a2d39",
  "47ff5c49-9c20-4f3d-bd57-1897c35cd42d",
  "b2412a1d-0aa4-4e37-a12a-0aca9e440a96",
];

/* Support functions */
async function fetchAllCommunityQuestions(communityId) {
  let response = await axios({
    url: graphQLendpoint,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: JSON.stringify({
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
      `,
    }),
  })
    .then((res) => res.data)
    .then((res) => res.data.measurables.edges);
  //console.log(response)
  return response;
}

/* Body */

export async function foretold() {
  let results = [];
  for (let community of highQualityCommunities) {
    let questions = await fetchAllCommunityQuestions(community);
    questions = questions.map((question) => question.node);
    questions = questions.filter((question) => question.previousAggregate); // Questions without any predictions
    questions.forEach((question) => {
      let id = `foretold-${question.id}`;
      let options = [];
      if (question.valueType == "PERCENTAGE") {
        let probability = question.previousAggregate.value.percentage;
        options = [
          {
            name: "Yes",
            probability: probability / 100,
            type: "PROBABILITY",
          },
          {
            name: "No",
            probability: 1 - probability / 100,
            type: "PROBABILITY",
          },
        ];
      }
      let result = {
        id: id,
        title: question.name,
        url: `https://www.foretold.io/c/${community}/m/${question.id}`,
        platform: "Foretold",
        description: "",
        options: options,
        timestamp: new Date().toISOString(),
        qualityindicators: {
          numforecasts: Math.floor(Number(question.measurementCount) / 2),
          stars: calculateStars("Foretold", {}),
        },
        /*liquidity: liquidity.toFixed(2),
          tradevolume: tradevolume.toFixed(2),
          address: obj.address*/
      };
      // console.log(result)
      results.push(result);
    });
  }
  // let string = JSON.stringify(results, null, 2)
  // fs.writeFileSync('./data/foretold-questions.json', string);
  await databaseUpsert({ contents: results, group: "foretold" });

  console.log("Done");
}
// foretold()
