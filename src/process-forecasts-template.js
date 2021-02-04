/* Imports */
import fs from "fs"

/* Definitions */
let locationData = "./data/"

/* Body */
let rawdata = fs.readFileSync("../data/merged-questions.json")
let data = JSON.parse(rawdata)

let results = []
for(let datum of data){
  // do something
}

let string = JSON.stringify(result,null,  2)
fs.writeFileSync("../data/output.txt", string)
