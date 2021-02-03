/* Imports */
import fs from 'fs'
import axios from "axios"
import textVersion from "textversionjs"

/* Definitions */
let htmlEndPoint = 'https://www.cset-foretell.com/questions?page='

/* Support functions */

function getcookie(){
  try {
    let rawcookie = fs.readFileSync("./src/privatekeys.json")
    let cookie = JSON.parse(rawcookie).csetforetellcookie
    if(cookie == undefined){
      throw new Error('No cookie for CSET-foretell!');
    }
    
    return cookie
  } catch(error) {
    console.log("Error: No cookies for CSET-foretell on src/privatekeys.json! See the README.md")
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
  let percentage = "none"
  if(isbinary){
    // Crowd percentage
    let htmlElements = response.split("\n")
    let h3Element = htmlElements.filter(str => str.includes("h3"))[0]
    let crowdpercentage = h3Element.split(">")[1].split("<")[0]
    percentage = crowdpercentage
  }
  
  // Description
  let descriptionraw = response.split(`  <meta name="description" content="`)[1]
  let descriptionprocessed1 = descriptionraw.split(`">`)[0]
  let descriptionprocessed2 = descriptionprocessed1.replace(">", "")
  let descriptionprocessed3 = descriptionprocessed2.replace("To suggest a change or clarification to this question, please select Request Clarification from the green gear-shaped dropdown button to the right of the question.", ``)
  let descriptionprocessed4=descriptionprocessed3.replaceAll("\r\n\r\n", "\n")
  let descriptionprocessed5=descriptionprocessed4.replaceAll("\n\n", "\n")  
  let descriptionprocessed6=descriptionprocessed5.replaceAll("&quot;", `"`)
  let descriptionprocessed7=descriptionprocessed6.replaceAll("&#39;", "'")
  let descriptionprocessed8=textVersion(descriptionprocessed7)
  let description = descriptionprocessed8
  // Number of forecasts
  let numforecasts = response.split("prediction_sets_count&quot;:")[1].split(",")[0]
  //console.log(numforecasts)
  
  // Number of predictors
  let numforecasters = response.split("predictors_count&quot;:")[1].split(",")[0]
  //console.log(numpredictors)
  
  let result = {
    "Binary question?": isbinary,
    "Percentage": percentage,
    "# Forecasts": numforecasts,
    "# Forecasters": numforecasters,
    "Description": description
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

export async function csetforetell(){
  let cookie = getcookie()
  let i=1
  let response = await fetchPage(i, cookie)
  let questions = []
  let init = Date.now()
  console.log("Downloading... This might take a couple of minutes. Results will be shown.")
  while(!isEnd(response)){
    console.log(`Page #${i}`)
    let htmlLines = response.split("\n")
    let h4elements = htmlLines.filter(str => str.includes("<h4><a href=")) 
    for(let h4element of h4elements){
      let h4elementSplit = h4element.split('"><span>')
      let url = h4elementSplit[0].split('<a href="')[1]
      let title = h4elementSplit[1].replace('</span></a></h4>', "")
      await sleep(1000 + Math.random()*1000) // don't be as noticeable
      try{
        let moreinfo = await fetchStats(url, cookie)
        if(moreinfo.isbinary){
          if(!moreinfo.crowdpercentage){ // then request again.
            moreinfo = await fetchStats(url, cookie)
          }
        }
        let question = ({
            "Title": title,
            "URL": url,
            "Platform": "CSET-foretell",
            ...moreinfo
          })
          console.log(question)
          questions.push(question)
      } catch(error){
        console.log(`We encountered some error when fetching the URL: ${url}, so it won't appear on the final json`)
      }
    }
    i=i+1
    console.log("Sleeping for ~5secs so as to not be as noticeable to the cset-foretell servers")
    await sleep(5000 + Math.random()*1000) // don't be as noticeable
    
    try{
      response = await fetchPage(i, cookie)
    }catch(error){
      console.log(`The program encountered some error when fetching page #${i}, so it won't appear on the final json. It is possible that this page wasn't actually a prediction question pages`)
    }
  }
  let string = JSON.stringify(questions,null,  2)
  fs.writeFileSync('./data/csetforetell-questions.json', string);
  
  let end = Date.now()
  let difference = end-init
  console.log(`Took ${difference/1000} seconds, or ${difference/(1000*60)} minutes.`)
}
