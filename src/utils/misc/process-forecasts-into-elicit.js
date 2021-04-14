/* Imports */
import fs from "fs";
import { mongoReadWithReadCredentials } from "../mongo-wrapper.js";

/* Definitions */
let locationData = "./data/";

/* Body */
// let rawdata =  fs.readFileSync("./data/merged-questions.json") // run from topmost folder, not from src
async function main() {
  let data = await mongoReadWithReadCredentials("metaforecasts"); //JSON.parse(rawdata)
  let processDescription = (description) => {
    if (description == null || description == undefined || description == "") {
      return "";
    } else {
      description =
        description == null
          ? ""
          : description
              .replaceAll("] (", "](")
              .replaceAll(") )", "))")
              .replaceAll("( [", "([")
              .replaceAll(") ,", "),")
              .replaceAll("\n", " ");
      if (description.length > 1000) {
        return description.slice(0, 1000) + "...";
      } else {
        return description;
      }
    }
  };

  let results = [];
  for (let datum of data) {
    // do something
    let description = processDescription(datum["description"]);
    let forecasts = datum["qualityindicators"]
      ? datum["qualityindicators"].numforecasts
      : "unknown";
    let stars = datum["qualityindicators"]
      ? datum["qualityindicators"].stars
      : 2;
    results.push("Title: " + datum["title"]);
    results.push("URL: " + datum["url"]);
    results.push("Description: " + description);
    results.push("Platform: " + datum["platform"]);
    results.push("Number of forecasts: " + forecasts);
    results.push("Stars: " + stars);
    results.push("\n");
  }

  let string = results.join("\n");
  string = string.replaceAll("\n\n", "\n");

  fs.writeFileSync("elicit-output.txt", string);
}
main();
