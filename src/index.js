/* Imports */
import { Parser, transforms } from 'json2csv'
import fs from 'fs'
import readline from "readline"

import {csetforetell} from "./csetforetell-fetch.js"
import {elicit} from "./elicit-fetch.js"
import {foretold} from "./foretold-fetch.js"
import {goodjudgment} from "./goodjudgment-fetch.js"
import {goodjudgmentopen} from "./goodjudmentopen-fetch.js"
import {hypermind} from "./hypermind-fetch.js"
import {ladbrokes} from "./ladbrokes-fetch.js"
import {metaculus} from "./metaculus-fetch.js"
import {polymarket} from "./polymarket-fetch.js"
import {predictit} from "./predictit-fetch.js"
import {omen} from "./omen-fetch.js"
import {smarkets} from "./smarkets-fetch.js"
import {williamhill} from "./williamhill-fetch.js"

/* Definitions */
let opts = {}
let json2csvParser = new Parser({ transforms:  [transforms.flatten()]});
//let parse = csv => json2csvParser.parse(csv);
// let sets = ["template", "elicit", "foretold", "metaculus", "predictit", "polymarket", "csetforetell", "givewellopenphil", "goodjudgment","goodjudmentopen", "omen", "hypermind", "smarkets", "williamhill", "ladbrokes", "xrisk"]
let sets = ["csetforetell", "elicit", "foretold", "givewellopenphil", "goodjudgment","goodjudmentopen", "hypermind", "ladbrokes", "metaculus", "polymarket", "predictit", "omen", "smarkets", "williamhill", "xrisk"]
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
      ladbrokes()
      break;
    case 8:
      metaculus()
      break;
    case 9:
      omen()
      break;
    case 10:
      polymarket()
      break;
    case 11:    
      predictit()
      break;
    case 12:
      smarkets()
      break;
    case 13:
      williamhill()
    break;
    case 14:
      coverttocsvandmerge()
      break;
    case 15:
      await csetforetell()
      await elicit()
      //await foretold()
      await goodjudgment()
      await goodjudgmentopen()
      await hypermind()
      await ladbrokes()
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
[7]: Download predictions from ladbrokes
[8]: Download predictions from metaculus
[9]: Download predictions from omen
[10]: Download predictions from polymarket
[11]: Download predictions from predictit
[12]: Download predictions from smarkets
[13]: Download predictions from William Hill
[14]: Merge jsons them into one big json (requires previous steps)
[15]: All of the above
Choose one option, wisely: #`

whattodo(whattodoMessage, executeoption)
