/* Imports */
import fs from "fs";
import { databaseReadWithReadCredentials } from "../database-wrapper.js";

/* Definitions */

/* Utilities */

/* Support functions */
let getQualityIndicators = (forecast) =>
  Object.entries(forecast.qualityindicators)
    .map((entry) => `${entry[0]}: ${entry[1]}`)
    .join("; ");

/* Body */

let main = async () => {
  let highQualityPlatforms = [
    "CSET-foretell",
    "Foretold",
    "Good Judgment Open",
    "Metaculus",
    "PredictIt",
    "Rootclaim",
  ];
  let json = await databaseReadWithReadCredentials({ group: "combined" });
  console.log(json.length);
  //let uniquePlatforms = [...new Set(json.map(forecast => forecast.platform))]
  //console.log(uniquePlatforms)

  let forecastsFromGoodPlatforms = json.filter((forecast) =>
    highQualityPlatforms.includes(forecast.platform)
  );
  let tsv =
    "index\ttitle\turl\tqualityindicators\n" +
    forecastsFromGoodPlatforms
      .map((forecast, index) => {
        let row = `${index}\t${forecast.title}\t${
          forecast.url
        }\t${getQualityIndicators(forecast)}`;
        console.log(row);
        return row;
      })
      .join("\n");
  //console.log(tsv)

  // let string = JSON.stringify(json, null, 2)
  fs.writeFileSync("metaforecasts.tsv", tsv);
};
main();
