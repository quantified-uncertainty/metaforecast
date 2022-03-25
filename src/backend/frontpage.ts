import { pgRead, readWritePool } from './database/pg-wrapper';

export async function getFrontpageRaw() {
  const client = await readWritePool.connect();
  const res = await client.query(
    "SELECT frontpage_sliced FROM latest.frontpage ORDER BY id DESC LIMIT 1"
  );
  if (!res.rows.length) return [];
  console.log(res.rows[0].frontpage_sliced);
  return res.rows[0].frontpage_sliced;
}

export async function getFrontpageFullRaw() {
  const client = await readWritePool.connect();
  const res = await client.query(
    "SELECT frontpage_full FROM latest.frontpage ORDER BY id DESC LIMIT 1"
  );
  if (!res.rows.length) return [];
  console.log(res.rows[0]);
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

export async function rebuildFrontpage() {
  const frontpageFull = await pgRead({
    schema: "latest",
    tableName: "combined",
  });

  const client = await readWritePool.connect();
  const frontpageSliced = (
    await client.query(`
    SELECT * FROM latest.combined
    WHERE
      (qualityindicators->>'stars')::int >= 3
      AND description != ''
      AND JSON_ARRAY_LENGTH(options) > 0
    ORDER BY RANDOM() LIMIT 50
  `)
  ).rows;

  const start = Date.now();
  await client.query(
    "INSERT INTO latest.frontpage(frontpage_full, frontpage_sliced) VALUES($1, $2)",
    [JSON.stringify(frontpageFull), JSON.stringify(frontpageSliced)]
  );

  const end = Date.now();
  const difference = end - start;
  console.log(
    `Took ${difference / 1000} seconds, or ${difference / (1000 * 60)} minutes.`
  );
}
