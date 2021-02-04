/* Imports */
import fs from "fs"

/* Definitions */
let locationData = "./data/"

/* Body */
let rawdata = fs.readFileSync("./data/merged-questions.json") // run from topmost folder, not from src
let data = JSON.parse(rawdata)

let processDescription = (description) => {
  if(description == null || description == undefined || description == ""){
    return ""
  }else{
    description = description==null?"":description
      .replaceAll("] (", "](")
      .replaceAll(") )", "))")
      .replaceAll("( [", "([")
      .replaceAll(") ,", "),")
      .replaceAll("\n", " ")
    if(description.length > 1000){
      return(description.slice(0,1000)+"...")
    }else{
      return(description)
    }
  }
}

let results = []
for(let datum of data){
  // do something
  let description = processDescription(datum["Description"])
  let forecasts = datum["# Forecasts"] || "unknown"
  results.push("Title: "+datum["Title"])
  results.push("URL: "+datum["URL"])
  results.push("Platform: "+datum["Platform"])
  results.push("Binary question?: "+datum["Binary question?"])
  results.push("Percentage: "+datum["Percentage"])
  results.push("Description: "+description)
  results.push("# Forecasts: "+ forecasts)
  results.push("Stars: "+datum["Stars"])  
  results.push("\n")  
}

let string = results.join("\n")
string = string.replaceAll("\n\n", "\n")

fs.writeFileSync("./data/elicit-output.txt", string)
