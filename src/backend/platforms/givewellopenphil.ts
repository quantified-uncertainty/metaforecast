/* Imports */
import axios from "axios";
import fs from "fs";

import { databaseUpsert } from "../database/database-wrapper";
import { calculateStars } from "../utils/stars";
import { Platform } from "./";

/* Support functions */
async function fetchPage(url: string) {
  let response = await axios({
    url: url,
    method: "GET",
    headers: {
      "Content-Type": "text/html",
    },
  }).then((res) => res.data);
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

export const givewellopenphil: Platform = {
  name: "givewellopenphil",
  async fetcher() {
    // main1()
    return; // not necessary to refill the DB every time
    const rawdata = fs.readFileSync("./input/givewellopenphil-questions.json", {
      encoding: "utf-8",
    });
    const data = JSON.parse(rawdata);
    const dataWithDate = data.map((datum: any) => ({
      ...datum,
      timestamp: "2021-02-23",
    }));
    return dataWithDate;
  },
};
