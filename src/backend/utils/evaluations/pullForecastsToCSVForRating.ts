/* Imports */
import fs from "fs";

import { pgRead } from "../../database/pg-wrapper";

/* Definitions */

/* Utilities */

/* Support functions */
const getQualityIndicators = (question) =>
  Object.entries(question.qualityindicators)
    .map((entry) => `${entry[0]}: ${entry[1]}`)
    .join("; ");

/* Body */

const main = async () => {
  let highQualityPlatforms = [
    "CSET-foretell",
    "Foretold",
    "Good Judgment Open",
    "Metaculus",
    "PredictIt",
    "Rootclaim",
  ];
  const json = await pgRead({ tableName: "questions" });
  console.log(json.length);
  //let uniquePlatforms = [...new Set(json.map(forecast => forecast.platform))]
  //console.log(uniquePlatforms)

  const questionsFromGoodPlatforms = json.filter((question) =>
    highQualityPlatforms.includes(question.platform)
  );
  const tsv =
    "index\ttitle\turl\tqualityindicators\n" +
    questionsFromGoodPlatforms
      .map((question, index) => {
        let row = `${index}\t${question.title}\t${
          question.url
        }\t${getQualityIndicators(question)}`;
        console.log(row);
        return row;
      })
      .join("\n");
  //console.log(tsv)

  // let string = JSON.stringify(json, null, 2)
  fs.writeFileSync("metaforecasts.tsv", tsv);
};
main();
