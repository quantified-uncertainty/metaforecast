/* Imports */
import axios from "axios"
import { getCookie, applyIfCookieExists } from "../utils/getCookies.js"
import { Tabletojson } from "tabletojson"
import toMarkdown from "../utils/toMarkdown.js"
import { calculateStars } from "../utils/stars.js"
import { upsert } from "../utils/mongo-wrapper.js"

/* Definitions */
let htmlEndPoint = 'https://www.cset-foretell.com/questions?page='
String.prototype.replaceAll = function replaceAll(search, replace) { return this.split(search).join(replace); }
const DEBUG_MODE = "on"// "off"
const SLEEP_TIME_RANDOM=100//5000 // miliseconds
const SLEEP_TIME_EXTRA=0//1000
/* Support functions */

async function fetchPage(page, cookie) {
  console.log(`Page #${page}`)
  if (page == 1) {
    cookie = cookie.split(";")[0] // Interesting that it otherwise doesn't work :(
  }
  let urlEndpoint = htmlEndPoint + page
  console.log(urlEndpoint)
  let response = await axios({
    url: urlEndpoint,
    method: 'GET',
    headers: ({
      'Content-Type': 'text/html',
      'Cookie': cookie
    }),
  })
    .then(res => res.data)
  // console.log(response)
  return response
}

async function fetchStats(questionUrl, cookie) {
  let response = await axios({
    url: questionUrl + "/stats",
    method: 'GET',
    headers: ({
      'Content-Type': 'text/html',
      'Cookie': cookie,
      'Referer': questionUrl,
    }),
  })
    .then(res => res.data)

  if (response.includes("Sign up or sign in to forecast")) {
    throw Error("Not logged in")
  }

  // Is binary?
  let isbinary = response.includes("binary?&quot;:true")
  // console.log(`is binary? ${isbinary}`)
  let options = []
  if (isbinary) {
    // Crowd percentage
    let htmlElements = response.split("\n")
    // DEBUG_MODE == "on" ? htmlLines.forEach(line => console.log(line)) : id()
    let h3Element = htmlElements.filter(str => str.includes("<h3>"))[0]
    // DEBUG_MODE == "on" ? console.log(h5elements) : id()
    let crowdpercentage = h3Element.split(">")[1].split("<")[0]
    let probability = Number(crowdpercentage.replace("%", "")) / 100
    options.push(({
      name: "Yes",
      probability: probability,
      type: "PROBABILITY"
    }), ({
      name: "No",
      probability: +(1 - probability).toFixed(2), // avoids floating point shenanigans
      type: "PROBABILITY"
    }))
  } else {
    try {
      let optionsBody = response.split("tbody")[1] // Previously [1], then previously [3] but they added a new table. 
      // console.log(optionsBody)
      let optionsHtmlElement = "<table" + optionsBody + "table>"
      let tablesAsJson = Tabletojson.convert(optionsHtmlElement)
      let firstTable = tablesAsJson[0]
      options = firstTable.map(element => ({
        name: element['0'],
        probability: Number(element['1'].replace("%", "")) / 100,
        type: "PROBABILITY"
      }))
    } catch (error) {
      let optionsBody = response.split("tbody")[3] // Catch if the error is related to table position
      let optionsHtmlElement = "<table" + optionsBody + "table>"
      let tablesAsJson = Tabletojson.convert(optionsHtmlElement)
      let firstTable = tablesAsJson[0]
      if (firstTable) {
        options = firstTable.map(element => ({
          name: element['0'],
          probability: Number(element['1'].replace("%", "")) / 100,
          type: "PROBABILITY"
        }))
      } else {
        // New type of question, tricky to parse the options
        // Just leave options = [] for now.
        // https://www.cset-foretell.com/blog/rolling-question-formats
      }
    }

  }
  // Description  
  let descriptionraw = response.split(`<meta name="description" content="`)[1]
  let descriptionprocessed1 = descriptionraw.split(`">`)[0]
  let descriptionprocessed2 = descriptionprocessed1.replace(">", "")
  let descriptionprocessed3 = descriptionprocessed2.replace("To suggest a change or clarification to this question, please select Request Clarification from the green gear-shaped dropdown button to the right of the question.", ``)
  // console.log(descriptionprocessed3)
  let descriptionprocessed4 = descriptionprocessed3.replaceAll("\r\n\r\n", "\n")
  let descriptionprocessed5 = descriptionprocessed4.replaceAll("\n\n", "\n")
  let descriptionprocessed6 = descriptionprocessed5.replaceAll("&quot;", `"`)
  let descriptionprocessed7 = descriptionprocessed6.replaceAll("&#39;", "'")
  let descriptionprocessed8 = toMarkdown(descriptionprocessed7)
  let description = descriptionprocessed8

  // Number of forecasts
  //console.log(response)
  //console.log(response.split("prediction_sets_count&quot;:")[1])
  let numforecasts = response.split("prediction_sets_count&quot;:")[1].split(",")[0]
  // console.log(numforecasts)

  // Number of predictors
  let numforecasters = response.split("predictors_count&quot;:")[1].split(",")[0]
  // console.log(numpredictors)

  let result = {
    "description": description,
    "options": options,
    "timestamp": new Date().toISOString(),
    "qualityindicators": {
      "numforecasts": Number(numforecasts),
      "numforecasters": Number(numforecasters),
      "stars": calculateStars("CSET-foretell", { numforecasts })
    }
  }

  return result
}

function isSignedIn(html) {

  let isSignedInBool = !(html.includes("You need to sign in or sign up before continuing") || html.includes("Sign up"))
  if (!isSignedInBool) {
    console.log("Error: Not signed in.")
  }
  console.log(`Signed in? ${isSignedInBool}`)
  return isSignedInBool
}

function isEnd(html) {
  let isEndBool = html.includes("No questions match your filter")
  if (isEndBool) {
    //console.log(html)
  }
  console.log(`IsEnd? ${isEndBool}`)
  return isEndBool
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* Body */

async function csetforetell_inner(cookie) {
  let i = 1
  let response = await fetchPage(i, cookie)
  let results = []
  let init = Date.now()
  // console.log("Downloading... This might take a couple of minutes. Results will be shown.")
  while (!isEnd(response) && isSignedIn(response)) {

    let htmlLines = response.split("\n")
    // let h4elements = htmlLines.filter(str => str.includes("<h5> <a href=") || str.includes("<h4> <a href="))
    let questionHrefs = htmlLines.filter(str => str.includes("https://www.cset-foretell.com/questions/"))
    // console.log(questionHrefs)
    

    if (process.env.DEBUG_MODE == "on" || DEBUG_MODE == "on") {
      //console.log(response)
      console.log("questionHrefs: ")
      console.log(questionHrefs)
    }

    //console.log("")
    //console.log("")
    //console.log(h4elements)

    for (let questionHref of questionHrefs) {
      //console.log(h4element)

      let elementSplit = questionHref.split('"><span>')
      let url = elementSplit[0].split('<a href="')[1]
      let title = elementSplit[1].replace('</h4>', "").replace('</h5>', "").replace("</span></a>", "")
      await sleep(Math.random() * SLEEP_TIME_RANDOM + SLEEP_TIME_EXTRA) // don't be as noticeable

      try {
        let moreinfo = await fetchStats(url, cookie)
        let question = ({
          "title": title,
          "url": url,
          "platform": "CSET-foretell",
          ...moreinfo
        })
        if (i % 30 == 0 && !(process.env.DEBUG_MODE == "on" || DEBUG_MODE == "on")) {
          console.log(`Page #${i}` && !(process.env.DEBUG_MODE == "on" || DEBUG_MODE == "on"))
          console.log(question)
        }
        results.push(question)
        if (process.env.DEBUG_MODE == "on" || DEBUG_MODE == "on") {
          console.log(url)
          console.log(question)
        }

      } catch (error) {
        console.log(error)
        console.log(`We encountered some error when fetching the URL: ${url}, so it won't appear on the final json`)
      }
    }

    i++
    //i=Number(i)+1

    console.log("Sleeping for ~5secs so as to not be as noticeable to the cset-foretell servers")
    await sleep(Math.random() * SLEEP_TIME_RANDOM + SLEEP_TIME_EXTRA) // don't be as noticeable

    try {
      response = await fetchPage(i, cookie)
    } catch (error) {
      console.log(error)
      console.log(`The program encountered some error when fetching page #${i}, so it won't appear on the final json. It is possible that this page wasn't actually a prediction question pages`)
    }
  }
  // let string = JSON.stringify(results,null,  2)
  // fs.writeFileSync('./data/csetforetell-questions.json', string);
  // console.log(results)
  if (results.length > 0) {
    await upsert(results, "csetforetell-questions")
  } else {
    console.log("Not updating results, as process was not signed in")
  }

  let end = Date.now()
  let difference = end - init
  console.log(`Took ${difference / 1000} seconds, or ${difference / (1000 * 60)} minutes.`)
}


export async function csetforetell() {
  let cookie = process.env.CSETFORETELL_COOKIE || getCookie("csetforetell")
  await applyIfCookieExists(cookie, csetforetell_inner)
}
