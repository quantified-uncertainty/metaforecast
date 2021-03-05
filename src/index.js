/* Imports */
import { Parser, transforms } from 'json2csv'
import fs from 'fs'
import readline from "readline"

import {csetforetell} from "./csetforetell-fetch.js"
import {elicit} from "./elicit-fetch.js"
import {foretold} from "./foretold-fetch.js"
import {goodjudgment} from "./goodjudgment-fetch.js"
import {goodjudgmentopen} from "./goodjudmentopen-fetch.js"
import {metaculus} from "./metaculus-fetch.js"
import {polymarket} from "./polymarket-fetch.js"
import {predictit} from "./predictit-fetch.js"
import {omen} from "./omen-fetch.js"
import {hypermind} from "./hypermind-fetch.js"
import {smarkets} from "./smarkets-fetch.js"

/* Definitions */
let opts = {}
let json2csvParser = new Parser({ transforms:  [transforms.flatten()]});
//let parse = csv => json2csvParser.parse(csv);
let sets = ["template", "elicit", "foretold", "metaculus", "predictit", "polymarket", "csetforetell", "givewellopenphil", "goodjudgment","goodjudmentopen", "omen", "hypermind", "smarkets"]
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

let writefile = (data, set, suffix, filetype = ".csv") => {
  fs.writeFileSync(locationData + set + suffix + filetype, data)
}

let coverttocsvandmerge = () => {
  let merged = []
  for(let set of sets){
    let json = getJSON(set)
    let csv = csvfromjson(json)
    writefile(csv, set, suffix)
    merged = merged.concat(json)
    //console.log(merged)
  }
  merged = merged.map(element => ({...element, optionsstringforsearch: element.options.map(option => option.name).join(", ")}))
  writefile(JSON.stringify(merged, null, 2), "metaforecasts", "", ".json")
  //let mergedcsv = csvfromjson(merged)
  //writefile(mergedcsv, "metaforecasts", "")
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
      foretold()
      break;
    case 4:
      goodjudgment()
      break;
    case 5:
      goodjudgmentopen()
      break;
    case 6:
      hypermind()
      break;
    case 7:
      metaculus()
      break;
    case 8:
      omen()
      break;
    case 9:
      polymarket()
      break;
    case 10:    
      predictit()
      break;
    case 11:
      smarkets()
      break;
    case 12:
      coverttocsvandmerge()
      break;
    case 13:
      await csetforetell()
      await elicit()
      await foretold()
      await goodjudgment()
      await goodjudgmentopen()
      await hypermind()
      await metaculus()
      await omen()
      await polymarket()
      await predictit()
      await smarkets()
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
[3]: Download predictions from foretold
[4]: Download predictions from goodjudgment
[5]: Download predictions from goodjudgmentopen
[6]: Download predictions from hypermind
[7]: Download predictions from metaculus
[8]: Download predictions from omen
[9]: Download predictions from polymarket
[10]: Download predictions from predictit
[11]: Download predictions from smarkets
[12]: Merge jsons them into one big json (requires previous steps)
[13]: All of the above
Choose one option, wisely: #`

whattodo(whattodoMessage, executeoption)
