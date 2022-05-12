/* Imports */
import axios from "axios";
import { Tabletojson } from "tabletojson";

import { average } from "../../utils";
import { applyIfSecretExists } from "../utils/getSecrets";
import { sleep } from "../utils/sleep";
import toMarkdown from "../utils/toMarkdown";
import { FetchedQuestion, Platform } from "./";

/* Definitions */
const platformName = "goodjudgmentopen";

const htmlEndPoint = "https://www.gjopen.com/questions?page=";
const annoyingPromptUrls = [
  "https://www.gjopen.com/questions/1933-what-forecasting-questions-should-we-ask-what-questions-would-you-like-to-forecast-on-gjopen",
  "https://www.gjopen.com/questions/1779-are-there-any-forecasting-tips-tricks-and-experiences-you-would-like-to-share-and-or-discuss-with-your-fellow-forecasters",
  "https://www.gjopen.com/questions/2246-are-there-any-forecasting-tips-tricks-and-experiences-you-would-like-to-share-and-or-discuss-with-your-fellow-forecasters-2022-thread",
  "https://www.gjopen.com/questions/2237-what-forecasting-questions-should-we-ask-what-questions-would-you-like-to-forecast-on-gjopen",
];
const DEBUG_MODE: "on" | "off" = "off"; // "on"
const id = () => 0;

/* Support functions */

async function fetchPage(page: number, cookie: string) {
  const response: string = await axios({
    url: htmlEndPoint + page,
    method: "GET",
    headers: {
      Cookie: cookie,
    },
  }).then((res) => res.data);
  //console.log(response)
  return response;
}

async function fetchStats(questionUrl: string, cookie: string) {
  let response: string = await axios({
    url: questionUrl + "/stats",
    method: "GET",
    headers: {
      Cookie: cookie,
      Referer: questionUrl,
    },
  }).then((res) => res.data);
  //console.log(response)

  // Is binary?
  let isbinary = response.includes("binary?&quot;:true");

  let options: FetchedQuestion["options"] = [];
  if (isbinary) {
    // Crowd percentage
    let htmlElements = response.split("\n");
    let h3Element = htmlElements.filter((str) => str.includes("<h3>"))[0];
    // console.log(h3Element)
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
    let optionsHtmlElement = "<table" + response.split("tbody")[1] + "table>";
    let tablesAsJson = Tabletojson.convert(optionsHtmlElement);
    let firstTable = tablesAsJson[0];
    options = firstTable.map((element: any) => ({
      name: element["0"],
      probability: Number(element["1"].replace("%", "")) / 100,
      type: "PROBABILITY",
    }));
    //console.log(optionsHtmlElement)
    //console.log(options)
  }

  // Description
  let descriptionraw = response.split(
    `<div id="question-background" class="collapse smb">`
  )[1];
  let descriptionprocessed1 = descriptionraw.split(`</div>`)[0];
  let descriptionprocessed2 = toMarkdown(descriptionprocessed1);
  let descriptionprocessed3 = descriptionprocessed2
    .split("\n")
    .filter((string) => !string.includes("Confused? Check our"))
    .join("\n");
  let description = descriptionprocessed3;

  // Number of forecasts
  let numforecasts = response
    .split("prediction_sets_count&quot;:")[1]
    .split(",")[0];
  //console.log(numforecasts)

  // Number of predictors
  let numforecasters = response
    .split("predictors_count&quot;:")[1]
    .split(",")[0];
  //console.log(numpredictors)

  let result = {
    description,
    options,
    qualityindicators: {
      numforecasts: Number(numforecasts),
      numforecasters: Number(numforecasters),
    },
    // this mismatches the code below, and needs to be fixed, but I'm doing typescript conversion and don't want to touch any logic for now
  } as any;

  return result;
}

function isSignedIn(html: string) {
  let isSignedInBool = !(
    html.includes("You need to sign in or sign up before continuing") ||
    html.includes("Sign up")
  );
  // console.log(html)
  if (!isSignedInBool) {
    console.log("Error: Not signed in.");
  }
  console.log(`is signed in? ${isSignedInBool ? "yes" : "no"}`);
  return isSignedInBool;
}

function reachedEnd(html: string) {
  let reachedEndBool = html.includes("No questions match your filter");
  if (reachedEndBool) {
    //console.log(html)
  }
  console.log(`Reached end? ${reachedEndBool}`);
  return reachedEndBool;
}

/* Body */

async function goodjudgmentopen_inner(cookie: string) {
  let i = 1;
  let response = await fetchPage(i, cookie);

  let results = [];
  let init = Date.now();
  // console.log("Downloading... This might take a couple of minutes. Results will be shown.")
  while (!reachedEnd(response) && isSignedIn(response)) {
    let htmlLines = response.split("\n");
    DEBUG_MODE == "on" ? htmlLines.forEach((line) => console.log(line)) : id();
    let h5elements = htmlLines.filter((str) => str.includes("<h5> <a href="));
    DEBUG_MODE == "on" ? console.log(h5elements) : id();
    let j = 0;
    for (let h5element of h5elements) {
      let h5elementSplit = h5element.split('"><span>');
      let url = h5elementSplit[0].split('<a href="')[1];
      if (!annoyingPromptUrls.includes(url)) {
        let title = h5elementSplit[1].replace("</span></a></h5>", "");
        await sleep(1000 + Math.random() * 1000); // don't be as noticeable
        try {
          let moreinfo = await fetchStats(url, cookie);
          if (moreinfo.isbinary) {
            if (!moreinfo.crowdpercentage) {
              // then request again.
              moreinfo = await fetchStats(url, cookie);
            }
          }
          let questionNumRegex = new RegExp("questions/([0-9]+)");
          const questionNumMatch = url.match(questionNumRegex);
          if (!questionNumMatch) {
            throw new Error(`Couldn't find question num in ${url}`);
          }
          let questionNum = questionNumMatch[1];
          let id = `${platformName}-${questionNum}`;
          let question = {
            id: id,
            title: title,
            url: url,
            platform: platformName,
            ...moreinfo,
          };
          if (j % 30 == 0 || DEBUG_MODE == "on") {
            console.log(`Page #${i}`);
            console.log(question);
          }
          // console.log(question)
          results.push(question);
        } catch (error) {
          console.log(error);
          console.log(
            `We encountered some error when fetching the URL: ${url}, so it won't appear on the final json`
          );
        }
      }
      j = j + 1;
    }
    i = i + 1;
    // console.log("Sleeping for 5secs so as to not be as noticeable to the gjopen servers")
    await sleep(5000 + Math.random() * 1000); // don't be a dick to gjopen server

    try {
      response = await fetchPage(i, cookie);
    } catch (error) {
      console.log(error);
      console.log(
        `We encountered some error when fetching page #${i}, so it won't appear on the final json`
      );
    }
  }

  if (results.length === 0) {
    console.log("Not updating results, as process was not signed in");
    return;
  }

  let end = Date.now();
  let difference = end - init;
  console.log(
    `Took ${difference / 1000} seconds, or ${difference / (1000 * 60)} minutes.`
  );

  return results;
}

export const goodjudgmentopen: Platform = {
  name: platformName,
  label: "Good Judgment Open",
  color: "#002455",
  version: "v1",
  async fetcher() {
    let cookie = process.env.GOODJUDGMENTOPENCOOKIE;
    return (await applyIfSecretExists(cookie, goodjudgmentopen_inner)) || null;
  },
  calculateStars(data) {
    let minProbability = Math.min(
      ...data.options.map((option) => option.probability || 0)
    );
    let maxProbability = Math.max(
      ...data.options.map((option) => option.probability || 0)
    );

    let nuno = () => ((data.qualityindicators.numforecasts || 0) > 100 ? 3 : 2);
    let eli = () => 3;
    let misha = () =>
      minProbability > 0.1 || maxProbability < 0.9 ? 3.1 : 2.5;

    let starsDecimal = average([nuno(), eli(), misha()]);
    let starsInteger = Math.round(starsDecimal);
    return starsInteger;
  },
};
