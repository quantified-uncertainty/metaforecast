import "dotenv/config";

import fs from "fs";

import { pgReadWithReadCredentials } from "../database/pg-wrapper";

let main = async () => {
  let json = await pgReadWithReadCredentials({ tableName: "combined" });
  let string = JSON.stringify(json, null, 2);
  let filename = "metaforecasts.json";
  fs.writeFileSync(filename, string);
  console.log(`File downloaded to ./${filename}`);
};
main();
