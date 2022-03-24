import { pgRead, readWritePool } from './database/pg-wrapper';

export async function getFrontpageRaw() {
  const client = await readWritePool.connect();
  const res = await client.query(`
    SELECT * FROM latest.combined
    WHERE
      (qualityindicators->>'stars')::int >= 3
      AND description != ''
      AND JSON_ARRAY_LENGTH(options) > 0
    ORDER BY RANDOM() LIMIT 50
  `);

  return res.rows;
}

export async function getFrontpageFullRaw() {
  return await pgRead({
    schema: "latest",
    tableName: "combined",
  });
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
