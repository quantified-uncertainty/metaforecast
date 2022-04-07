import { Pool, PoolClient } from "pg";

import { Forecast } from "../platforms";
import { hash } from "../utils/hash";
import { measureTime } from "../utils/measureTime";
import { roughSizeOfObject } from "../utils/roughSize";

const forecastTableNames = ["questions", "history"];

const allTableNames = [...forecastTableNames, "dashboards", "frontpage"];

/* Postgres database connection code */
const databaseURL = process.env.DIGITALOCEAN_POSTGRES;
export const pool = new Pool({
  connectionString: databaseURL,
  ssl: process.env.POSTGRES_NO_SSL
    ? false
    : {
        rejectUnauthorized: false,
      },
});

// Read
export async function pgRead({ tableName }: { tableName: string }) {
  if (!allTableNames.includes(tableName)) {
    throw Error(
      `Table ${tableName} not in whitelist; stopping to avoid tricky sql injections`
    );
  }
  let command = `SELECT * from ${tableName}`;
  return (await pool.query(command)).rows;
}

export async function pgGetByIds({
  ids,
  table,
}: {
  ids: string[];
  table: string;
}) {
  let idstring = `( ${ids.map((id: string) => `'${id}'`).join(", ")} )`; // (1, 2, 3)
  let command = `SELECT * from ${table} where id in ${idstring}`;
  // see: https://stackoverflow.com/questions/5803472/sql-where-id-in-id1-id2-idn
  let results = (await pool.query(command)).rows;
  console.log(results);
  return results;
}

export async function pgBulkInsert({
  data,
  tableName,
  client,
}: {
  data: Forecast[];
  tableName: string;
  client: PoolClient;
}) {
  if (!forecastTableNames.includes(tableName)) {
    throw Error(
      `Table ${tableName} not in whitelist; stopping to avoid tricky sql injections`
    );
  }

  const generateQuery = (rows: number) => {
    let text = `INSERT INTO ${tableName} VALUES`;
    const cols = 10;
    const parts: string[] = [];
    for (let r = 0; r < rows; r++) {
      const bits = [];
      for (let c = 1; c <= cols; c++) {
        bits.push(`$${cols * r + c}`);
      }
      parts.push("(" + bits.join(", ") + ")");
    }

    text += parts.join(", ");
    return text;
  };

  let from = 0;
  const chunkSize = 20;
  while (from < data.length - 1) {
    const take = Math.min(chunkSize, data.length - from);
    const query = generateQuery(take);

    const chunk = [];
    for (let i = from; i < from + take; i++) {
      const datum = data[i];
      let timestamp =
        datum.timestamp &&
        !!datum.timestamp.slice &&
        !isNaN(Date.parse(datum.timestamp))
          ? datum.timestamp
          : new Date().toISOString();
      timestamp = timestamp.slice(0, 19).replace("T", " ");
      const values = [
        datum.id,
        datum.title,
        datum.url,
        datum.platform,
        datum.description || "",
        JSON.stringify(datum.options || []),
        timestamp, // fix
        datum.stars ||
          (datum.qualityindicators ? datum.qualityindicators.stars : 2),
        JSON.stringify(datum.qualityindicators || []),
        JSON.stringify(datum.extra || []),
      ];
      chunk.push(...values);
    }

    console.log(`Inserting ${from + 1}..${from + take}`);
    from += take;
    await client.query(query, chunk);
  }
}

export async function pgInsertIntoDashboard({ datum }) {
  let text = `INSERT INTO dashboards VALUES($1, $2, $3, $4, $5, $6, $7)`;
  let timestamp = datum.timestamp || new Date().toISOString();
  timestamp = timestamp.slice(0, 19).replace("T", " ");
  let values = [
    hash(JSON.stringify(datum.contents)),
    datum.title || "",
    datum.description || "",
    JSON.stringify(datum.contents || []),
    timestamp, // fixed
    datum.creator || "",
    JSON.stringify(datum.extra || []),
  ];
  const client = await pool.connect();
  let result;
  try {
    result = await client.query(text, values);
  } catch (error) {
    console.log(error);
  } finally {
    client.release();
  }
  // console.log(result)
  return result;
}
/* For reference
	  id text,
		title text,
		description text,
		contents json,
		timestamp timestamp,
		creator text,
		extra json
 */
/*
pgInsertIntoDashboard({
  datum: {
    title: "Test dashboard",
    description: "A test dashboard",
    contents: [
      "rootclaim-did-former-new-england-patriots-tight-end-aaron-hernandez-commit-suicide-19060",
      "metaculus-3912",
      "givewellopenphil-2021-133",
      "rootclaim-what-happened-to-barry-and-honey-sherman-19972",
      "rootclaim-what-caused-the-disappearance-of-malaysia-airlines-flight-370",
    ],
    creator: "Nuño Sempere",
  },
  tableName: "dashboards",
});
*/
export async function pgUpsert({
  contents,
  tableName,
  replacePlatform,
}: {
  contents: Forecast[];
  tableName: string;
  replacePlatform?: string;
}) {
  if (!forecastTableNames.includes(tableName)) {
    throw Error(
      `Table ${tableName} not in whitelist; stopping to avoid tricky sql injections`
    );
  }

  await measureTime(async () => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      if (replacePlatform) {
        await client.query(`DELETE FROM ${tableName} WHERE platform = $1`, [
          replacePlatform,
        ]);
      }
      console.log(
        `Upserting ${contents.length} rows into postgres table ${tableName}.`
      );

      await pgBulkInsert({ data: contents, tableName, client });
      console.log(
        `Inserted ${
          contents.length
        } rows with approximate cummulative size ${roughSizeOfObject(
          contents
        )} MB into ${tableName}.`
      );

      console.log("Sample: ");
      console.log(
        JSON.stringify(
          // only show the first three options
          contents.slice(0, 1).map((question) => ({
            ...question,
            options: question.options
              ? question.options.length > 3
                ? question.options.slice(0, 3).concat("...")
                : question.options
              : null,
          })),
          null,
          4
        )
      );
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  });
}
