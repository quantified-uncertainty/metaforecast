import { platforms } from "../platforms/registry";
import { executeJobByName } from "./jobs";

/* Do everything */
export async function doEverything() {
  let jobNames = [...platforms.map((platform) => platform.name), "algolia"];

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
