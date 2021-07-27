/* Imports */
import fs from "fs"
import { mongoReadWithReadCredentials } from "./mongo-wrapper.js"

/* Definitions */

/* Utilities */

/* Support functions */

/* Body */

let main = async () => {
  let highQualityPlatforms = ['CSET-foretell', 'Foretold', 'Good Judgment Open', 'Metaculus', 'PredictIt', 'Rootclaim']
  let json = await mongoReadWithReadCredentials("metaforecasts")
  console.log(json.length)
  //let uniquePlatforms = [...new Set(json.map(forecast => forecast.platform))]
  //console.log(uniquePlatforms)
  
  let forecastsFromGoodPlatforms = json.filter(forecast => highQualityPlatforms.includes(forecast.platform))
  let tsv = "index\ttitle\turl\tstars\n"+forecastsFromGoodPlatforms
    .map((forecast, index) => `${index}\t${forecast.title}\t${forecast.url}\t0`)
    .join("\n")
  //console.log(tsv)

  // let string = JSON.stringify(json, null, 2)
  fs.writeFileSync('evals/metaforecasts.tsv', tsv);
}
main()
