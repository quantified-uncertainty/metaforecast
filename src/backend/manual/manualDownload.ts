import "dotenv/config";

import fs from "fs";

import { pgRead } from "../database/pg-wrapper";

let main = async () => {
  let json = await pgRead({ tableName: "questions" });
  let string = JSON.stringify(json, null, 2);
  let filename = "metaforecasts.json";
  fs.writeFileSync(filename, string);
  console.log(`File downloaded to ./${filename}`);
};
main();
