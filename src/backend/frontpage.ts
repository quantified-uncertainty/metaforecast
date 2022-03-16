import fs from 'fs';

import { pgRead } from './database/pg-wrapper';

// TODO - move to global `constants.ts` config
const location = "/Users/berekuk/coding/quri/metaforecast-backend/data";

export async function getFrontpageRaw() {
  let frontpageSlicedLocation = `${location}/frontpage_sliced.json`;
  return JSON.parse(
    fs.readFileSync(frontpageSlicedLocation, { encoding: "utf-8" })
  ); // TODO - async, no reason to lock
}

export async function getFrontpageFullRaw() {
  let frontpageSlicedLocation = `${location}/frontpage_full.json`;
  return JSON.parse(
    fs.readFileSync(frontpageSlicedLocation, { encoding: "utf-8" })
  ); // TODO - async, no reason to lock
}

export async function getFrontpage() {
  let frontPageForecastsCompatibleWithFuse = [];
  try {
    let data = await getFrontpageRaw();
    frontPageForecastsCompatibleWithFuse = data.map((result) => ({
      item: result,
      score: 0,
    }));
    return frontPageForecastsCompatibleWithFuse;
  } catch (error) {
    console.log(error);
  } finally {
    return frontPageForecastsCompatibleWithFuse;
  }
}

// Helpers
let shuffle = (array) => {
  // https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
};

// Main
export async function downloadFrontpage() {
  let init = Date.now();

  let response = await pgRead({ schema: "latest", tableName: "combined" });
  fs.writeFileSync(
    `${location}/frontpage_full.json`,
    JSON.stringify(response, null, 4)
  );
  console.log(`frontpage_full.json written to ${location}`);

  let responseFiltered = response.filter(
    (forecast) =>
      forecast.qualityindicators &&
      forecast.qualityindicators.stars >= 3 &&
      forecast.options &&
      forecast.options.length > 0 &&
      forecast.description != ""
  );
  let responseFilteredAndRandomized = shuffle(responseFiltered).slice(0, 50);
  fs.writeFileSync(
    `${location}/frontpage_sliced.json`,
    JSON.stringify(responseFilteredAndRandomized, null, 4)
  );
  console.log(`frontpage_sliced.json written to ${location}`);

  let end = Date.now();
  let difference = end - init;
  console.log(
    `Took ${difference / 1000} seconds, or ${difference / (1000 * 60)} minutes.`
  );

  /*
    # (run code)
    sleep 10
    cp /home/azrael/server/data/frontpage_freshly_sliced.json /home/azrael/server/data/frontpage_sliced.json
    date > /home/azrael/server/data/frontpage_slicetime.txt
    cat /home/azrael/server/data/frontpage_freshly_sliced.json >> /home/azrael/server/data/frontpage_slicetime.txt
  */
}
// TODO: call /api/cron/update-frontpage from github actions every 6 hours
// TODO: store frontpage_sliced copy somewhere
