import fs from "fs";

import { databaseUpsert } from "../database/database-wrapper";

/* This is necessary for estimize, the database of x-risk estimates, and for the OpenPhil/GiveWell predictions. Unlike the others, I'm not fetching them constantly, but only once. */

let pushManualFiles = ["givewellopenphil"]; // ["estimize", "givewellopenphil", "xrisk"]
let suffixFiles = "-questions.json";

let main = async () => {
  for (let file of pushManualFiles) {
    let fileRaw = fs.readFileSync(`./input/${file + suffixFiles}`, {
      encoding: "utf-8",
    });
    let fileContents = JSON.parse(fileRaw);
    console.log(fileContents);
    await databaseUpsert({ contents: fileContents, group: file });
  }
};
main();
