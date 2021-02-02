/* Imports */
import fs from 'fs'
import axios from "axios"

/* Definitions */
let hypermindEnpoint1 = 'https://predict.hypermind.com/dash/jsx.json'

/* Support Functions */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getcookie(){
  try {
    let rawcookie = fs.readFileSync("./src/privatekeys.json")
    let cookie = JSON.parse(rawcookie).hypermindcookie
    if(cookie == undefined){
      throw new Error('No cookie for Hypermind!');
    }
    return cookie
  } catch(error) {
    console.log("Error: No cookies for Hypermind on src/privatekeys.json! See the README.md")
    process.exit()
  }
}

async function fetchHypermindData1(slug){
  let response = await axios("https://predict.hypermind.com/dash/jsx.json", {
    "credentials": "omit",
    "headers": {
        "User-Agent": "",
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.5",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
    },
    "referrer": `https://predict.hypermind.com/dash/dash/dash.html?list=${slug}`,
    "data": `jsx=%5B%5B%22dataMgr%22%2C%22getGQList%22%2C%7B%22listName%22%3A%20%22${slug}%22%2C%22format%22%3A%20%7B%22props%22%3A%20true%2C%22posts%22%3A%20true%2C%22cond%22%3A%20%7B%22props%22%3A%20true%2C%22otcm%22%3A%20%7B%22tradingHistory%22%3A%20true%2C%22props%22%3A%20true%7D%7D%2C%22otcm%22%3A%20%7B%22tradingHistory%22%3A%20true%2C%22props%22%3A%20true%7D%7D%7D%5D%5D`,
    "method": "POST",
    "mode": "cors"
  }).then(resp => resp.data[0].questions)
  return response
}

async function fetchHypermindData2(){
  let response = await axios("https://prod.hypermind.com/ngdp-jsx/jsx.json", {
      "credentials": "include",
      "headers": {
          "User-Agent": "",
          "Accept": "*/*",
          "Accept-Language": "en-US,en;q=0.5",
          "Content-Type": "application/json; charset=UTF-8",
          "Cookie": getcookie()
      },
      "referrer": "https://prod.hypermind.com/ngdp/en/showcase/showcase.html?inFrame=true",
      "data": `[["showcase","queryIFPs",{"query":{"showcaseOnly":true},"fmt":{"stats":true,"crowdFcstHist":true}}]]`,
      "method": "POST",
      "mode": "cors"
  }).then(resp => resp.data[0])
  return response
}

async function fetchHypermindData3(){
  let response = await axios("https://prod.hypermind.com/ngdp-jsx/jsx.json", {
      "credentials": "include",
      "headers": {
          "User-Agent": "",
          "Accept": "*/*",
          "Accept-Language": "en-US,en;q=0.5",
          "Content-Type": "application/json; charset=UTF-8",
          "Cookie": getcookie()
      },
      "referrer": "https://prod.hypermind.com/ngdp/en/showcase/showcase.html?inFrame=true",
      "data": `[["showcase","getShowcase",{"showcase":"Covid19","fmt":{"fcsterCnt":true,"crowdFcst":true,"crowdFcstHist":true}}]]`,
      "method": "POST",
      "mode": "cors"
  })
  .then(resp => resp.data[0].items)
  .then(items => items.filter(item => item.type=="IFP"))
  .then(items => items.map(item => item.IFP))
  //console.log(response)
  return response
}

/* Body */
export async function hypermind(){
  let slugs = ["USA", "FRA", "AFR", "INT", "COV", "POL", "ECO"]
  
  let results1 = []
  
  for(let slug of slugs){
    console.log(slug)
    await sleep(1000 + Math.random()*1000)
    let result = await fetchHypermindData1(slug)
    let objs = result.map(res => ({
      Title: res.props.title.split("%%fr")[0].replace("%%en:", ""),
      URL: "https://predict.hypermind.com/dash/dash/dash.html?list="+slug,
      Platform: "Hypermind",
      "Binary question?" : (res.otcms.length==2),
      "Percentage": (res.otcms.length==2)?res.otcms[0].price +"%": "none"
    }))
    results1.push(...objs)
  }
  
  console.log("GDP")
  await sleep(1000 + Math.random()*1000)
  let results2 = await fetchHypermindData2()
  let results2processed = results2.map(res => ({
    Title: res.props.title,
    URL: "https://prod.hypermind.com/ngdp/en/showcase/showcase.html",
    Platform: "Hypermind",
    "Binary question?" : false,
    "Percentage": "none"
  }))
  
  console.log("COVID-19 OpenPhil")
  await sleep(1000 + Math.random()*1000)
  let results3 = await fetchHypermindData3()
  let results3processed = results3.map(res => ({
    Title: res.props.title,
    URL: "https://prod.hypermind.com/ngdp/en/showcase2/showcase.html?sc=Covid19",
    Platform: "Hypermind",
    "Binary question?" : false,
    "Percentage": "none"
  }))
  
  let resultsTotal=[...results1, ...results2processed, ...results3processed]

  let distinctTitles = []
  let resultsTotalUnique = []
  for(let result of resultsTotal){
    if(!distinctTitles.includes(result.Title)){
        resultsTotalUnique.push(result)
        distinctTitles.push(result.Title)
    }
  }
  console.log(resultsTotalUnique)
  let string = JSON.stringify(resultsTotalUnique,null,  2)
  fs.writeFileSync('./data/hypermind-questions.json', string);
  
}
//hypermind()
