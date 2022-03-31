import { platforms } from "../platforms";
import { executeJobByName } from "./jobs";

/* Do everything */
export async function doEverything() {
  let jobNames = [
    ...platforms.map((platform) => platform.name),
    "merge",
    "algolia",
    "history",
    "netlify",
  ];
  // Removed Good Judgment from the fetcher, doing it using cron instead because cloudflare blocks the utility on heroku.

  console.log("");
  console.log("");
  console.log("");
  console.log("");
  console.log("================================");
  console.log("STARTING UP");
  console.log("================================");
  console.log("");
  console.log("");
  console.log("");
  console.log("");

  for (let name of jobNames) {
    console.log("");
    console.log("");
    console.log("****************************");
    console.log(name);
    console.log("****************************");
    await executeJobByName(name);
    console.log("****************************");
  }
}
