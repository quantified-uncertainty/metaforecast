import fs from "fs";
import { databaseRead, databaseUpsert } from "../database/database-wrapper.js";

/* This is necessary for estimize, the database of x-risk estimates, and for the OpenPhil/GiveWell predictions. Unlike the others, I'm not fetching them constantly, but only once. */

let pushManualFiles = ["givewellopenphil"]; // ["estimize", "givewellopenphil", "xrisk"]
let suffixFiles = "-questions.json";
let suffixMongo = "-questions";

let main = async () => {
  for (let file of pushManualFiles) {
    let fileRaw = fs.readFileSync(`./src/input/${file + suffixFiles}`);
    let fileContents = JSON.parse(fileRaw);
    console.log(fileContents);
    await databaseUpsert({contents: fileContents, group: file });
  }
};
main();
