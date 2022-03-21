import { pgRead, readWritePool } from './database/pg-wrapper';

// TODO - move to global `constants.ts` config
const location = "/Users/berekuk/coding/quri/metaforecast-backend/data";

export async function getFrontpageRaw() {
  const client = await readWritePool.connect();
  const res = await client.query(
    "SELECT frontpage_sliced FROM latest.frontpage ORDER BY id DESC LIMIT 1"
  );
  if (!res.rows.length) return [];
  return res.rows[0].frontpage_sliced;
}

export async function getFrontpageFullRaw() {
  const client = await readWritePool.connect();
  const res = await client.query(
    "SELECT frontpage_full FROM latest.frontpage ORDER BY id DESC LIMIT 1"
  );
  if (!res.rows.length) return [];
  return res.rows[0].frontpage_full;
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

  const frontpageFull = await pgRead({
    schema: "latest",
    tableName: "combined",
  });

  let frontpageFiltered = frontpageFull.filter(
    (forecast) =>
      forecast.qualityindicators &&
      forecast.qualityindicators.stars >= 3 &&
      forecast.options &&
      forecast.options.length > 0 &&
      forecast.description != ""
  );
  let frontpageSliced = shuffle(frontpageFiltered).slice(0, 50);

  const client = await readWritePool.connect();
  await client.query(
    "INSERT INTO latest.frontpage(frontpage_full, frontpage_sliced) VALUES($1, $2)",
    [JSON.stringify(frontpageFull), JSON.stringify(frontpageSliced)]
  );

  let end = Date.now();
  let difference = end - init;
  console.log(
    `Took ${difference / 1000} seconds, or ${difference / (1000 * 60)} minutes.`
  );
}
