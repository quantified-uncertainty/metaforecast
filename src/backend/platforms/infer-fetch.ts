/* Imports */
import axios from 'axios';
import { Tabletojson } from 'tabletojson';

import { databaseUpsert } from '../database/database-wrapper';
import { applyIfSecretExists } from '../utils/getSecrets';
import { calculateStars } from '../utils/stars';
import toMarkdown from '../utils/toMarkdown';

/* Definitions */
let htmlEndPoint = "https://www.infer-pub.com/questions";
String.prototype.replaceAll = function replaceAll(search, replace) {
  return this.split(search).join(replace);
};
const DEBUG_MODE: "on" | "off" = "off"; // "off"
const SLEEP_TIME_RANDOM = 7000; // miliseconds
const SLEEP_TIME_EXTRA = 2000;
/* Support functions */

async function fetchPage(page, cookie) {
  console.log(`Page #${page}`);
  if (page == 1) {
    cookie = cookie.split(";")[0]; // Interesting that it otherwise doesn't work :(
  }
  let urlEndpoint = `${htmlEndPoint}/?page=${page}`;
  console.log(urlEndpoint);
  let response = await axios({
    url: urlEndpoint,
    method: "GET",
    headers: {
      "Content-Type": "text/html",
      Cookie: cookie,
    },
  }).then((res) => res.data);
  // console.log(response)
  return response;
}

async function fetchStats(questionUrl, cookie) {
  let response = await axios({
    url: questionUrl + "/stats",
    method: "GET",
    headers: {
      "Content-Type": "text/html",
      Cookie: cookie,
      Referer: questionUrl,
    },
  }).then((res) => res.data);

  if (response.includes("Sign up or sign in to forecast")) {
    throw Error("Not logged in");
  }

  // Is binary?
  let isbinary = response.includes("binary?&quot;:true");
  // console.log(`is binary? ${isbinary}`)
  let options = [];
  if (isbinary) {
    // Crowd percentage
    let htmlElements = response.split("\n");
    // DEBUG_MODE == "on" ? htmlLines.forEach(line => console.log(line)) : id()
    let h3Element = htmlElements.filter((str) => str.includes("<h3>"))[0];
    // DEBUG_MODE == "on" ? console.log(h5elements) : id()
    let crowdpercentage = h3Element.split(">")[1].split("<")[0];
    let probability = Number(crowdpercentage.replace("%", "")) / 100;
    options.push(
      {
        name: "Yes",
        probability: probability,
        type: "PROBABILITY",
      },
      {
        name: "No",
        probability: +(1 - probability).toFixed(2), // avoids floating point shenanigans
        type: "PROBABILITY",
      }
    );
  } else {
    try {
      let optionsBody = response.split("tbody")[1]; // Previously [1], then previously [3] but they added a new table.
      // console.log(optionsBody)
      let optionsHtmlElement = "<table" + optionsBody + "table>";
      let tablesAsJson = Tabletojson.convert(optionsHtmlElement);
      let firstTable = tablesAsJson[0];
      options = firstTable.map((element) => ({
        name: element["0"],
        probability: Number(element["1"].replace("%", "")) / 100,
        type: "PROBABILITY",
      }));
    } catch (error) {
      let optionsBody = response.split("tbody")[3]; // Catch if the error is related to table position
      let optionsHtmlElement = "<table" + optionsBody + "table>";
      let tablesAsJson = Tabletojson.convert(optionsHtmlElement);
      let firstTable = tablesAsJson[0];
      if (firstTable) {
        options = firstTable.map((element) => ({
          name: element["0"],
          probability: Number(element["1"].replace("%", "")) / 100,
          type: "PROBABILITY",
        }));
      } else {
        // New type of question, tricky to parse the options
        // Just leave options = [] for now.
        // https://www.cset-foretell.com/blog/rolling-question-formats
      }
    }
  }
  // Description
  let descriptionraw = response.split(`<meta name="description" content="`)[1];
  let descriptionprocessed1 = descriptionraw.split(`">`)[0];
  let descriptionprocessed2 = descriptionprocessed1.replace(">", "");
  let descriptionprocessed3 = descriptionprocessed2.replace(
    "To suggest a change or clarification to this question, please select Request Clarification from the green gear-shaped dropdown button to the right of the question.",
    ``
  );
  // console.log(descriptionprocessed3)
  let descriptionprocessed4 = descriptionprocessed3.replaceAll(
    "\r\n\r\n",
    "\n"
  );
  let descriptionprocessed5 = descriptionprocessed4.replaceAll("\n\n", "\n");
  let descriptionprocessed6 = descriptionprocessed5.replaceAll("&quot;", `"`);
  let descriptionprocessed7 = descriptionprocessed6.replaceAll("&#39;", "'");
  let descriptionprocessed8 = toMarkdown(descriptionprocessed7);
  let description = descriptionprocessed8;

  // Number of forecasts
  //console.log(response)
  //console.log(response.split("prediction_sets_count&quot;:")[1])
  let numforecasts = response
    .split("prediction_sets_count&quot;:")[1]
    .split(",")[0];
  // console.log(numforecasts)

  // Number of predictors
  let numforecasters = response
    .split("predictors_count&quot;:")[1]
    .split(",")[0];
  // console.log(numpredictors)

  let result = {
    description: description,
    options: options,
    timestamp: new Date().toISOString(),
    qualityindicators: {
      numforecasts: Number(numforecasts),
      numforecasters: Number(numforecasters),
      stars: calculateStars("Infer", { numforecasts }),
    },
  };

  return result;
}

function isSignedIn(html) {
  let isSignedInBool = !(
    html.includes("You need to sign in or sign up before continuing") ||
    html.includes("Sign up")
  );
  if (!isSignedInBool) {
    console.log("Error: Not signed in.");
  }
  console.log(`Signed in? ${isSignedInBool}`);
  return isSignedInBool;
}

function isEnd(html) {
  let isEndBool = html.includes("No questions match your filter");
  if (isEndBool) {
    //console.log(html)
  }
  console.log(`IsEnd? ${isEndBool}`);
  return isEndBool;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* Body */

async function infer_inner(cookie) {
  let i = 1;
  let response = await fetchPage(i, cookie);
  let results = [];
  let init = Date.now();
  // console.log("Downloading... This might take a couple of minutes. Results will be shown.")
  while (!isEnd(response) && isSignedIn(response)) {
    let htmlLines = response.split("\n");
    // let h4elements = htmlLines.filter(str => str.includes("<h5> <a href=") || str.includes("<h4> <a href="))
    let questionHrefs = htmlLines.filter((str) =>
      str.includes("https://www.infer-pub.com/questions/")
    );
    // console.log(questionHrefs)

    if (process.env.DEBUG_MODE == "on" || DEBUG_MODE == "on") {
      //console.log(response)
      console.log("questionHrefs: ");
      console.log(questionHrefs);
    }

    //console.log("")
    //console.log("")
    //console.log(h4elements)

    for (let questionHref of questionHrefs) {
      //console.log(h4element)

      let elementSplit = questionHref.split('"><span>');
      let url = elementSplit[0].split('<a href="')[1];
      let title = elementSplit[1]
        .replace("</h4>", "")
        .replace("</h5>", "")
        .replace("</span></a>", "");
      await sleep(Math.random() * SLEEP_TIME_RANDOM + SLEEP_TIME_EXTRA); // don't be as noticeable

      try {
        let moreinfo = await fetchStats(url, cookie);
        let questionNumRegex = new RegExp("questions/([0-9]+)");
        let questionNum = url.match(questionNumRegex)[1]; //.split("questions/")[1].split("-")[0];
        let id = `infer-${questionNum}`;
        let question = {
          id: id,
          title: title,
          url: url,
          platform: "Infer",
          ...moreinfo,
        };
        if (
          i % 30 == 0 &&
          !(process.env.DEBUG_MODE == "on" || DEBUG_MODE == "on")
        ) {
          console.log(`Page #${i}`);
          console.log(question);
        }
        results.push(question);
        if (process.env.DEBUG_MODE == "on" || DEBUG_MODE == "on") {
          console.log(url);
          console.log(question);
        }
      } catch (error) {
        console.log(error);
        console.log(
          `We encountered some error when fetching the URL: ${url}, so it won't appear on the final json`
        );
      }
    }

    i++;
    //i=Number(i)+1

    console.log(
      "Sleeping for ~5secs so as to not be as noticeable to the infer servers"
    );
    await sleep(Math.random() * SLEEP_TIME_RANDOM + SLEEP_TIME_EXTRA); // don't be as noticeable

    try {
      response = await fetchPage(i, cookie);
    } catch (error) {
      console.log(error);
      console.log(
        `The program encountered some error when fetching page #${i}, so it won't appear on the final json. It is possible that this page wasn't actually a prediction question pages`
      );
    }
  }
  if (results.length > 0) {
    await databaseUpsert({ contents: results, group: "infer" });
  } else {
    console.log("Not updating results, as process was not signed in");
  }

  let end = Date.now();
  let difference = end - init;
  console.log(
    `Took ${difference / 1000} seconds, or ${difference / (1000 * 60)} minutes.`
  );
}

export async function infer() {
  let cookie = process.env.INFER_COOKIE;
  await applyIfSecretExists(cookie, infer_inner);
}
