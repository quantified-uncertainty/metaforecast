/* Imports */
import fs from "fs"
import axios from "axios"
import toMarkdown from "./toMarkdown.js"
import { calculateStars } from "./stars.js"

/* Definitions */
let locationData = "./data/"

/* Support functions */
async function fetchPage(url) {
  let response = await axios({
    url: url,
    method: 'GET',
    headers: ({
      'Content-Type': 'text/html',
    }),
  })
    .then(res => res.data)
  //console.log(response)
  return response
}

/* Body */

async function main() {
  let rawdata = fs.readFileSync("./data/givewell-urls.txt")
  let data = rawdata.toString().split("\n").filter(url => url != "");
  console.log(data)
  let results = []
  for (let url of data) {
    console.log(url)
    let page = await fetchPage(url)

    // Title
    let titleraw = page.split('<meta name="twitter:title" content="')[1]
    let title = titleraw.split('" />')[0]

    // Description
    let internalforecasts = page.split("<h2").filter(section => section.includes("Internal forecast") || section.includes("internal forecast"))
    let description = "<h2 " + internalforecasts[1]

    let result = {
      "title": title,
      "url": url,
      "platform": "GiveWell",
      "description": description,
      "stars": calculateStars("GiveWell/OpenPhilanthropy", ({})),
    } // Note: This requires some processing afterwards
    console.log(result)
    results.push(result)
  }
  let string = JSON.stringify(results, null, 2)
  fs.writeFileSync('./data/givewell-questions-unprocessed.json', string);
}
main()
