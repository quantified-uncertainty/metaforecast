import 'dotenv/config';

import fs from 'fs';

import { databaseReadWithReadCredentials } from '../database/database-wrapper';

let main = async () => {
  let json = await databaseReadWithReadCredentials({ group: "combined" });
  let string = JSON.stringify(json, null, 2);
  let filename = "metaforecasts.json";
  fs.writeFileSync(filename, string);
  console.log(`File downloaded to ./${filename}`);
};
main();
