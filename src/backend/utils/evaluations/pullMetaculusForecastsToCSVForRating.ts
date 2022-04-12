/* Imports */
import fs from "fs";

import { pgRead } from "../../database/pg-wrapper";

/* Definitions */

/* Utilities */

/* Support functions */
let getQualityIndicators = (question) =>
  Object.entries(question.qualityindicators)
    .map((entry) => `${entry[0]}: ${entry[1]}`)
    .join("; ");

let shuffleArray = (array) => {
  // See: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

/* Body */

let main = async () => {
  let highQualityPlatforms = ["Metaculus"]; // ['CSET-foretell', 'Foretold', 'Good Judgment Open', 'Metaculus', 'PredictIt', 'Rootclaim']
  let json = await pgRead({ tableName: "questions" });
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
