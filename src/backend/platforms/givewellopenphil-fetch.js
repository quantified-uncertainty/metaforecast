/* Imports */
import axios from "axios";
import fs from "fs";
import { databaseUpsert } from "../database/database-wrapper";
import { calculateStars } from "../utils/stars";

/* Support functions */
async function fetchPage(url) {
  let response = await axios({
    url: url,
    method: "GET",
    headers: {
      "Content-Type": "text/html",
    },
  }).then((res) => res.data);
  //console.log(response)
  return response;
}

/* Body */

async function main1() {
  let rawdata = fs.readFileSync("./input/givewellopenphil-urls.txt");
  let data = rawdata
    .toString()
    .split("\n")
    .filter((url) => url != "");
  // console.log(data)
  let results = [];
  for (let url of data) {
    // console.log(url)
    let page = await fetchPage(url);

    // Title
    let titleraw = page.split('<meta name="twitter:title" content="')[1];
    let title = titleraw.split('" />')[0];

    // Description
    let internalforecasts = page
      .split("<h2")
      .filter(
        (section) =>
          section.includes("Internal forecast") ||
          section.includes("internal forecast")
      );
    let description = "<h2 " + internalforecasts[1];

    let result = {
      title: title,
      url: url,
      platform: "GiveWell",
      description: description,
      timestamp: new Date().toISOString(),
      qualityindicators: {
        stars: calculateStars("GiveWell/OpenPhilanthropy", {}),
      },
    }; // Note: This requires some processing afterwards
    // console.log(result)
    results.push(result);
  }
  await databaseUpsert({
    contents: results,
    group: "givewell-questions-unprocessed",
  });
}
// main1()

async function main2() {
  let rawdata = fs.readFileSync("./input/givewellopenphil-questions.json");
  let data = JSON.parse(rawdata);
  let dataWithDate = data.map((datum) => ({
    ...datum,
    timestamp: "2021-02-23",
  }));
  await databaseUpsert({ group: "givewellopenphil", contents: dataWithDate });
}
main2();
