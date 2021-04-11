/* Imports */
import axios from "axios"
import fs from "fs"
import { Tabletojson } from "tabletojson"
import toMarkdown from "../utils/toMarkdown.js"
import { calculateStars } from "../utils/stars.js"
import { upsert } from "../utils/mongo-wrapper.js"

/* Definitions */
let endpoints = ["https://goodjudgment.io/superforecasts/", "https://goodjudgment.io/economist/"]
String.prototype.replaceAll = function replaceAll(search, replace) { return this.split(search).join(replace); }

/* Support functions */

/* Body */
export async function goodjudgment() {
  let results = []
  for (let endpoint of endpoints) {
    let content = await axios.get(endpoint)
      .then(query => query.data)
    let jsonTable = Tabletojson.convert(content, { stripHtmlFromCells: false })
    jsonTable.shift() // deletes first element
    jsonTable.pop() // deletes last element
    if (endpoint == endpoints[1]) jsonTable.pop() // pop again
    //console.log(jsonTable)
    for (let table of jsonTable) {
      let title = table[0]['0']
        .split("\t\t\t")
        .splice(3)[0]
      let description = table
        .filter(row => row['0'].includes("BACKGROUND:"))
        .map(row => row['0'])
        .map(text => text
          .split("BACKGROUND:")[1]
          .split("Examples of Superforecaster")[0]
          .split("AT A GLANCE")[0]
          .replaceAll("\n\n", "\n")
          .split("\n")
          .slice(3)
          .join(" ")
          .replaceAll("      ", "")
          .replaceAll("<br> ", "")
        )[0]
      let options = table
        .filter(row => '4' in row)
        .map(row => ({
          name: row['2']
            .split("<span class=\"qTitle\">")[1]
            .replace("</span>", ""),
          probability: Number(row['3'].split("%")[0]) / 100,
          type: "PROBABILITY"
        }))
      let analysis = table.filter(row => row[0].includes("Examples of Superforecaster commentary"))[0][0]
      // console.log(analysis)
      let standardObj = ({
        "title": title,
        "url": endpoint,
        "platform": "Good Judgment",
        "description": description,
        "options": options,
        "timestamp": new Date().toISOString(),
        "qualityindicators": {
          "stars": calculateStars("Good Judgment", ({})),
        },
        "extra": {
          "superforecastercommentary": analysis
        }
      })
      results.push(standardObj)
    }
  }
  // console.log(results.slice(0,10))
  let string = JSON.stringify(results, null, 2)
  // fs.writeFileSync('./data/goodjudgment-questions.json', string);
  // fs.writeFileSync('./goodjudgment-questions-test.json', string);
  // console.log(results)
  await upsert(results, "goodjudgment-questions")
  console.log("Done")
}
goodjudgment()
