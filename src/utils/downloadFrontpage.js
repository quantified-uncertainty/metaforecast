import fs from "fs"

import { mongoReadWithReadCredentials } from "./mongo-wrapper.js"

let filename = '/home/loki/Documents/core/software/fresh/js/metaforecasts/metaforecasts-mongo/data/frontpage.json'
let shuffle = (array) => {
  // https://stackoverflow.com/questions/2450954/how-to-randomi ze-shuffle-a-javascript-array
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

let main = async () => {
  let init = Date.now()

  let json = await mongoReadWithReadCredentials("metaforecasts")
  
  json = json.filter(forecast => (forecast.qualityindicators && forecast.qualityindicators.stars >= 3) && (forecast.options && forecast.options.length > 0 && forecast.platform != "AstralCodexTen"))
  json = shuffle(json)
  
  let string = JSON.stringify(json, null, 2)
  fs.writeFileSync(filename, string);
  console.log(`File downloaded to ${filename}`)

  let end = Date.now()
  let difference = end - init
  console.log(`Took ${difference / 1000} seconds, or ${difference / (1000 * 60)} minutes.`)

}
main()