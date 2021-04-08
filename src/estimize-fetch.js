import { calculateStars } from "./stars.js"
import fs from "fs"

export function estimize(){
  let data = fs.readFileSync('/home/nuno/Documents/core/software/fresh/js/metaforecasts/metaforecasts-current/data/s-and-p-500-companies/companies.csv', 'utf8')

  let splitData = data.split("\n")
  let results = []
  for(let datum of splitData){
      if(datum!=""){
          //console.log(datum)
          let datumSplit = datum.split(",")
          let companyStickerSymbol=datumSplit[0]
          let companyName=datumSplit[1]
          let standardObj = ({
          "title": `Estimates for ${companyName} (${companyStickerSymbol})`,
          "url": `https://www.estimize.com/${companyStickerSymbol.toLowerCase()}`,
          "platform": "Estimize",
          "description": `A link to Estimize's forecasts for *${companyName}* (sticker symbol ${companyStickerSymbol}). Viewing them requires making a prediction, Wall Street estimates are provided for free`,
          "options": [],
          "timestamp": new Date().toISOString(),
          "qualityindicators": {
            "stars": calculateStars("Estimize", ({})),
          }
        })
        results.push(standardObj)
      }
  }
  console.log(results)
  let string = JSON.stringify(results, null, 2)
  fs.writeFileSync('./data/estimize-questions.json', string);
}
//estimize()
