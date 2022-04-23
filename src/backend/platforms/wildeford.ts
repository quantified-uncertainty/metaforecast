/* Imports */
import { GoogleSpreadsheet } from "google-spreadsheet";

import { applyIfSecretExists } from "../utils/getSecrets";
import { hash } from "../utils/hash";
import { calculateStars } from "../utils/stars";
import { FetchedQuestion, Platform } from "./";

/* Definitions */
const platformName = "wildeford";
const SHEET_ID = "1xcgYF7Q0D95TPHLLSgwhWBHFrWZUGJn7yTyAhDR4vi0"; // spreadsheet key is the long id in the sheets URL
const endpoint = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit#gid=0`;
// https://docs.google.com/spreadsheets/d/1xcgYF7Q0D95TPHLLSgwhWBHFrWZUGJn7yTyAhDR4vi0/edit#gid=0
/* Support functions */

const formatRow = (row) => {
  let colNames = [
    "Prediction Date",
    "Prediction",
    "Odds",
    "Actual",
    "Resolution Date",
    "Prediction Right?",
    "Brier Score",
    "Notes",
  ];
  let result = {};
  row.forEach((col, i) => {
    result[colNames[i]] = col;
  });
  return result;
};

async function fetchGoogleDoc(google_api_key) {
  // https://gist.github.com/micalevisk/9bc831bd4b3e5a3f62b9810330129c59
  let results = [];
  const doc = new GoogleSpreadsheet(SHEET_ID);
  doc.useApiKey(google_api_key);

  await doc.loadInfo(); // loads document properties and worksheets
  console.log(">>", doc.title);

  const sheet = doc.sheetsByIndex[0];
  const rows = await sheet.getRows({ offset: 0 });

  console.log("# " + rows[0]._sheet.headerValues.join(","));
  let isEnd = false;
  for (let i in rows) {
    let data = rows[i]._rawData;
    if (data.length == 0) isEnd = true;
    if (!isEnd) {
      let result = {
        ...formatRow(data),
        url: endpoint + `&range=A${Number(i) + 2}`,
      };
      // +2: +1 for the header row, +1 for starting at 1 and not at 0.
      // console.log(result)
      results.push(result);

      // console.log(rows[i])
      // console.log(rows[i]._rawData)
      // console.log(rows[i]["Prediction"])
    }
    // console.log(row._rawData.join(','))
    // console.log(row._rawData.join(','))
  }
  // console.log(results)
  return results;
}

async function processPredictions(predictions) {
  let currentPredictions = predictions.filter(
    (prediction) => prediction["Actual"] == "Unknown"
  );
  let results = currentPredictions.map((prediction) => {
    let title = prediction["Prediction"].replace(" [update]", "");
    let id = `${platformName}-${hash(title)}`;
    let probability = Number(prediction["Odds"].replace("%", "")) / 100;
    let options = [
      {
        name: "Yes",
        probability: probability,
        type: "PROBABILITY",
      },
      {
        name: "No",
        probability: 1 - probability,
        type: "PROBABILITY",
      },
    ];
    let result: FetchedQuestion = {
      id,
      title,
      url: prediction["url"],
      platform: platformName,
      description: prediction["Notes"] || "",
      options,
      timestamp: new Date(Date.parse(prediction["Prediction Date"] + "Z")),
      qualityindicators: {
        stars: calculateStars(platformName, null),
      },
    };
    return result;
  });

  results = results.reverse();
  let uniqueTitles = [];
  let uniqueResults = [];
  results.forEach((result) => {
    if (!uniqueTitles.includes(result.title)) uniqueResults.push(result);
    uniqueTitles.push(result.title);
  });
  return uniqueResults;
}

export async function wildeford_inner(google_api_key) {
  let predictions = await fetchGoogleDoc(google_api_key);
  return await processPredictions(predictions);
}

export const wildeford: Platform = {
  name: platformName,
  label: "Peter Wildeford",
  color: "#984158",
  async fetcher() {
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY; // See: https://developers.google.com/sheets/api/guides/authorizing#APIKey
    return await applyIfSecretExists(GOOGLE_API_KEY, wildeford_inner);
  },
};
