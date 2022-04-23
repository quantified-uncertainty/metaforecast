/* Imports */
import fs from "fs";

import { shuffleArray } from "../../../utils";
import { prisma } from "../../database/prisma";

/* Definitions */

/* Utilities */

/* Support functions */
let getQualityIndicators = (question) =>
  Object.entries(question.qualityindicators)
    .map((entry) => `${entry[0]}: ${entry[1]}`)
    .join("; ");

/* Body */

let main = async () => {
  let highQualityPlatforms = ["Metaculus"]; // ['CSET-foretell', 'Foretold', 'Good Judgment Open', 'Metaculus', 'PredictIt', 'Rootclaim']
  let json = await prisma.question.findMany({});
  console.log(json.length);
  //let uniquePlatforms = [...new Set(json.map(question => question.platform))]
  //console.log(uniquePlatforms)

  let questionsFromGoodPlatforms = json.filter((question) =>
    highQualityPlatforms.includes(question.platform)
  );
  let questionsFromGoodPlatformsShuffled = shuffleArray(
    questionsFromGoodPlatforms
  );
  let tsv =
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
  fs.writeFileSync("metaforecasts_metaculus_v2.tsv", tsv);
};
main();
