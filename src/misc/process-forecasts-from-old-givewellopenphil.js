/* Imports */
import fs from "fs"

/* Definitions */
let locationData = "./data/"

/* Body */
let rawdata = fs.readFileSync("../data/givewellopenphil-questions-processed-old-format.json")
let data = JSON.parse(rawdata)

let results = []
for(let datum of data){
  let probability = Math.round(Number(datum["Percentage"].replace("%","")))/100
    let result = ({
    "title": datum["Title"],
    "url": datum["URL"],
    "platform": datum["Platform"],
    "description": datum["Description"],
    "options": [
      {
        "name": "Yes",
        "probability": probability,
        "type": "PROBABILITY"
      },
      {
        "name": "No",
        "probability": 1-Math.round(probability*100)/100,
        "type": "PROBABILITY"
      }
    ],            
    "timestamp": "2021-02-23T15∶21∶37.005Z",//new Date().toISOString(),
    "qualityindicators": {
      "stars": datum["Stars"]
    }
  })
  results.push(result)
}

let string = JSON.stringify(results,null,  2)
fs.writeFileSync("../data/givewellopenphil-questions-new.json", string)
