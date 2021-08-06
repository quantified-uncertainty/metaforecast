import fs from "fs"

import { mongoReadWithReadCredentials } from "./mongo-wrapper.js"

let main = async () => {
  let json = await mongoReadWithReadCredentials("metaforecasts")
  let string = JSON.stringify(json, null, 2)
  fs.writeFileSync('metaforecasts.json', string);
}
// main()

let extractQualityIndicators = async () => {
  let json = await mongoReadWithReadCredentials("metaforecasts")
  let qualityIndicators = []
  json.forEach(forecast => qualityIndicators.push(...Object.keys(forecast.qualityindicators)))
  qualityIndicators = [...new Set(qualityIndicators)]
  console.log(qualityIndicators)
  // let string = JSON.stringify(json, null, 2)
  // fs.writeFileSync('metaforecasts.json', string);
}
extractQualityIndicators()