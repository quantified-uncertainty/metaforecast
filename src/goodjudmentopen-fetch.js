/* Imports */
import fs from 'fs'
import axios from "axios"
import {Tabletojson} from "tabletojson"
import {getstars} from "./stars.js"
import toMarkdown from "./toMarkdown.js"

/* Definitions */
let htmlEndPoint = 'https://www.gjopen.com/questions?page='

/* Support functions */

function getcookie(){
  try {
    let rawcookie = fs.readFileSync("./src/privatekeys.json")
    let cookie = JSON.parse(rawcookie).goodjudmentopencookie
    if(cookie == undefined){
      throw new Error('No cookie for Good Judgment Open!');
    }
    
    return cookie
  } catch(error) {
    console.log("Error: No cookies for Good Judgment Open on src/privatekeys.json! See the README.md")
    process.exit()
  }
}


async function fetchPage(page, cookie){
  let response  = await axios({
    url: htmlEndPoint+page,
    method: 'GET',
    headers: ({ 
    'Content-Type': 'text/html',
    'Cookie': cookie
    }),
  })
  .then(res => res.data)
  //console.log(response)
  return response
}

async function fetchStats(questionUrl, cookie){
  let response  = await axios({
    url: questionUrl+"/stats",
    method: 'GET',
    headers: ({ 
    'Content-Type': 'text/html',
    'Cookie': cookie,
    'Referer': questionUrl,
    }),
  })
  .then(res => res.data)
  //console.log(response)
  
  // Is binary?
  let isbinary = response.includes("binary?&quot;:true")

  let options = []
  if(isbinary){
    // Crowd percentage
    let htmlElements = response.split("\n")
    let h3Element = htmlElements.filter(str => str.includes("<h3>"))[0]
    console.log(h3Element)
    let crowdpercentage = h3Element.split(">")[1].split("<")[0]
    let probability = Number(crowdpercentage.replace("%", ""))/100
    options.push(({
      name: "Yes",
      probability: probability,
      type: "PROBABILITY"
    }), ({
      name: "No",
      probability: +(1-probability).toFixed(2), // avoids floating point shenanigans
      type: "PROBABILITY"
    }))
  }else{
    let optionsHtmlElement = "<table" + response.split("tbody")[1] + "table>"
    let tablesAsJson = Tabletojson.convert(optionsHtmlElement)
    let firstTable = tablesAsJson[0]
    options = firstTable.map(element => ({
      name: element['0'],
      probability: Number(element['1'].replace("%",""))/100,
      type: "PROBABILITY"
    }))
    //console.log(optionsHtmlElement)
    //console.log(options)
  }

  // Description
  let descriptionraw = response.split(`<div id="question-background" class="collapse smb">`)[1]
  let descriptionprocessed1 = descriptionraw.split(`</div>`)[0]
  let descriptionprocessed2= toMarkdown(descriptionprocessed1)
  let descriptionprocessed3 = descriptionprocessed2.split("\n")
    .filter(string => !string.includes("Confused? Check our"))
    .join("\n")
  let description = descriptionprocessed3
  
  // Number of forecasts
  let numforecasts = response.split("prediction_sets_count&quot;:")[1].split(",")[0]
  //console.log(numforecasts)
  
  // Number of predictors
  let numforecasters = response.split("predictors_count&quot;:")[1].split(",")[0]
  //console.log(numpredictors)
  
  let result = {
    "description": description, 
    "options": options,
    "numforecasts": numforecasts,
    "numforecasters": numforecasters,
    "stars": numforecasts>100?3:2
  }
  return result
}

function isEnd(html){
  return html.includes("No questions match your filter")
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* Body */

export async function goodjudgmentopen(){
  let cookie = getcookie()

  let i=1
  let response = await fetchPage(i, cookie)
  let questions = []
  let init = Date.now()
  console.log("Downloading... This might take a couple of minutes. Results will be shown.")
  while(!isEnd(response)){
    console.log(`Page #${i}`)
    let htmlLines = response.split("\n")
    let h5elements = htmlLines.filter(str => str.includes("<h5><a href=")) 
    for(let h5element of h5elements){
      let h5elementSplit = h5element.split('"><span>')
      let url = h5elementSplit[0].split('<a href="')[1]
      let title = h5elementSplit[1].replace('</span></a></h5>', "")
      await sleep(1000 + Math.random()*1000) // don't be as noticeable
      try{
        let moreinfo = await fetchStats(url, cookie)
        if(moreinfo.isbinary){
          if(!moreinfo.crowdpercentage){ // then request again.
            moreinfo = await fetchStats(url, cookie)
          }
        }
        let question = ({
            "title": title,
            "url": url,
            "platform": "Good Judgment Open",
            ...moreinfo
          })
          console.log(question)
          questions.push(question)
      } catch(error){
        console.log(error)
        console.log(`We encountered some error when fetching the URL: ${url}, so it won't appear on the final json`)
      }
    }
    i=i+1
    console.log("Sleeping for 5secs so as to not be as noticeable to the gjopen servers")
    await sleep(5000 + Math.random()*1000) // don't be a dick to gjopen server
    
    try{
      response = await fetchPage(i,cookie)
    }catch(error){
      console.log(error)
      console.log(`We encountered some error when fetching page #${i}, so it won't appear on the final json`)
    }
  }
  let string = JSON.stringify(questions,null,  2)
  fs.writeFileSync('./data/goodjudmentopen-questions.json', string);
  
  let end = Date.now()
  let difference = end-init
  console.log(`Took ${difference/1000} seconds, or ${difference/(1000*60)} minutes.`)
}
