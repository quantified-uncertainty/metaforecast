/* Imports */
import axios from "axios"
import fs from "fs"

/* Definitions */
let endpoints = ["https://goodjudgment.io/superforecasts/", "https://goodjudgment.io/economist/"]

/* Support functions */

/* Body */

export async function goodjudgment(){
  let results = []
  for(let endpoint of endpoints){
    let content = await axios.get(endpoint)
        .then(query => query.data)
    let questions = content.split(`<td align="center">&nbsp;Today's<br/>Forecast&nbsp`)
    for(let question of questions){
      let lastlineposition= question.lastIndexOf("value=")
      let lastline = question.substring(lastlineposition+1, question.length)
      if(!lastline.includes("Close Superforecaster Analysis") && !lastline.includes("</table")){
        let lastlineremovetabs = lastline.replace("			", "")
        let lastlineremovetags1 = lastlineremovetabs.split(">\n")[1]
        let lastlineremovetags2 = lastlineremovetags1.replace("</td", "")
        let lastlinereplacequotations = lastlineremovetags2.replaceAll("&quot;","'")
        console.log(lastlinereplacequotations)
        let standardObj = ({
          "Title": lastlinereplacequotations,
          "URL": endpoint,
          "Platform": "Good Judgment",
          "Binary question?": false,
          "Percentage": "none",
        })
        results.push(standardObj)
      }
    }
  }
  let string = JSON.stringify(results,null,  2)
  fs.writeFileSync('./data/goodjudgment-questions.json', string);
  console.log("Done")
}
//goodjudgment()
