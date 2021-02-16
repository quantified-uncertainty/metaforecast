/* Imports */
import axios from "axios"
import fs from "fs"
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
    let questions = content.split(`<table width="80%" class="qTable" align="center">`) 
    // content.split(`<td align="center">&nbsp;Today's<br/>Forecast&nbsp`)
    questions.pop()
    questions.shift()
    for(let question of questions){
      // Title
      let titleraw = question.split(`<input type="hidden" id="num`)[1]
      let titleprocessed1 = titleraw.split(">")[1]
      let titleprocessed2 = titleprocessed1.split("</td>")[0]
      let titleprocessed3 = titleprocessed2.replace("</td","")
      let titleprocessed4 = titleprocessed3.replaceAll("	", "")
      let titleprocessed5 = titleprocessed4.replaceAll("\n", "")
      let title = titleprocessed5
      console.log(title)
      
      // Get the description
      let descriptionraw = question.split("BACKGROUND:")[1]
      //let descriptionprocessed1 = descriptionraw.replace(" Examples of Superforecaster commentary in italics", "")
      let descriptionprocessed1 = descriptionraw.split("SUPERFORECASTER COMMENTARY HIGHLIGHTS")[0]
      let descriptionprocessed2 = toMarkdown(descriptionprocessed1)
      let descriptionprocessed3 = descriptionprocessed2.split("\n").filter(string => !string.includes("Examples of Superforecaster"))
      let descriptionprocessed4 = descriptionprocessed3.join("\n")
      let descriptionprocessed5 = descriptionprocessed4.replace("AT A GLANCE:\n", "")
      let description=descriptionprocessed5
      console.log(description)
      
      let standardObj = ({
          "Title": title,
          "URL": endpoint,
          "Platform": "Good Judgment",
          "Binary question?": false,
          "Percentage": "none",
          "Description": description,
          "Stars": getstars(4)
      })
      results.push(standardObj)

    }
  }
  let string = JSON.stringify(results,null,  2)
  fs.writeFileSync('./data/goodjudgment-questions.json', string);
  console.log("Done")
}
//goodjudgment()
