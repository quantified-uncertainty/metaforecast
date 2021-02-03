/* Imports */
import { Parser, transforms } from 'json2csv'
import fs from 'fs'
import readline from "readline"

import {csetforetell} from "./csetforetell-fetch.js"
import {elicit} from "./elicit-fetch.js" // Currently doesn't "fetch"; elicit must be downloaded manually. 
import {goodjudgment} from "./goodjudgment-fetch.js"
import {goodjudgmentopen} from "./goodjudmentopen-fetch.js"
import {metaculus} from "./metaculus-fetch.js"
import {polymarket} from "./polymarket-fetch.js"
import {predictit} from "./predictit-fetch.js"
import {omen} from "./omen-fetch.js"
import {hypermind} from "./hypermind-fetch.js"

/* Definitions */
let opts = {}
let json2csvParser = new Parser({ transforms:  [transforms.flatten()]});
//let parse = csv => json2csvParser.parse(csv);
let sets = ["template", "elicit", "metaculus", "predictit", "polymarket", "csetforetell", "goodjudgment","goodjudmentopen", "omen", "hypermind"]
let suffix = "-questions"
let locationData = "./data/"
let sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/* Support functions */
let getJSON = (set) => {
  let rawdata = fs.readFileSync(locationData + set + suffix + ".json")
  console.log(set)
  //console.log(rawdata)
  let data = JSON.parse(rawdata)
  return data
}
let csvfromjson = (json) => json2csvParser.parse(json)

let writefile = (data, set, filetype = ".csv") => {
  fs.writeFileSync(locationData + set + suffix + filetype, data)
}

let coverttocsvandmerge = () => {
  let merged = []
  for(let set of sets){
    let json = getJSON(set)
    let csv = csvfromjson(json)
    writefile(csv, set)
    merged = merged.concat(json)
    //console.log(merged)
  }
  writefile(JSON.stringify(merged, null, 2), "merged", ".json")
  let mergedcsv = csvfromjson(merged)
  writefile(mergedcsv, "merged")
  console.log("Done")

}

async function whattodo(message,callback){
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question(message, (answer) => {
    rl.close();
    callback(answer)
  });
}

let executeoption = async (option) => {
  option = Number(option)
  switch (option) {
    case 1:
      csetforetell()
      break;
    case 2:
      elicit()
      break;
    case 3:
      goodjudgment()
      break;
    case 4:
      goodjudgmentopen()
      break;
    case 5:
      hypermind()
      break;
    case 6:
      metaculus()
      break;
    case 7:
      omen()
      break;
    case 8:
      polymarket()
      break;
    case 9:    
      predictit()
      break;
    case 10:
      coverttocsvandmerge()
      break;
    case 11:
      await csetforetell()
      await elicit()
      await goodjudgment()
      await goodjudgmentopen()
      await hypermind()
      await metaculus()
      await omen()
      await polymarket()
      await predictit()
      await coverttocsvandmerge()
      break;
    default:
      console.log("Sorry, invalid case")
      break;
  }
}

/* BODY */
let whattodoMessage = `What do you want to do?
[1]: Download predictions from csetforetell
[2]: Download predictions from elicit
[3]: Download predictions from goodjudgment
[4]: Download predictions from goodjudgmentopen
[5]: Download predictions from hypermind
[6]: Download predictions from metaculus
[7]: Download predictions from omen
[8]: Download predictions from polymarket
[9]: Download predictions from predictit
[10]: Convert predictions to csvs and merge them into one big file (requires previous steps)
[11]: All of the above
Choose one option, wisely: #`
whattodo(whattodoMessage, executeoption)
