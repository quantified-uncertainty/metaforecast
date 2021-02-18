/* Imports */
import axios from "axios"
import fs from "fs"
import {Tabletojson} from "tabletojson"
import toMarkdown from "./toMarkdown.js"
import {getstars} from "./stars.js"

/* Definitions */
let endpoints = ["https://goodjudgment.io/superforecasts/", "https://goodjudgment.io/economist/"]

/* Support functions */

/* Body */
export async function goodjudgment(){
  let results = []
  for(let endpoint of endpoints){
    let content = await axios.get(endpoint)
        .then(query => query.data)
    let jsonTable = Tabletojson.convert(content, { stripHtmlFromCells: false })
    jsonTable.shift() // deletes first element
    jsonTable.pop() // deletes last element
    if (endpoint==endpoints[1]) jsonTable.pop() // pop again
    console.log(jsonTable)
    //console.log(jsonTable)
    for(let table of jsonTable){
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
          .replaceAll("<br> ","")
        )[0]
      let options = table
        .filter(row => '4' in row)
        .map(row => ({
          name: row['2']
            .split("<span class=\"qTitle\">")[1]
            .replace("</span>",""),
          probability: Number(row['3'].split("%")[0])/100,
          type: "PROBABILITY"
        }))

      let standardObj = ({
        "title": title,
        "url": endpoint,
        "platform": "Good Judgment",
        "description": description,
        "options": options,
        "stars": 4
      })
      results.push(standardObj)
    }
  }
  console.log(results)
  let string = JSON.stringify(results,null,  2)
  fs.writeFileSync('./data/goodjudgment-questions.json', string);
  console.log("Done")
}
//goodjudgment()
