import fs from "fs"

import { mongoReadWithReadCredentials } from "./mongo-wrapper.js"

let main = async () => {
  let json = await mongoReadWithReadCredentials("metaforecasts")
  let string = JSON.stringify(json, null, 2)
  let filename = 'metaforecasts.json'
  fs.writeFileSync(filename, string);
  console.log(`File downloaded to ./${filename}`)
}
main()