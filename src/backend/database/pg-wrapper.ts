import { Pool, PoolClient } from "pg";

import { Forecast, platforms } from "../platforms";
import { hash } from "../utils/hash";
import { measureTime } from "../utils/measureTime";
import { roughSizeOfObject } from "../utils/roughSize";

const platformTableNames = platforms.map((platform) => platform.name);

const forecastTableNames = [...platformTableNames, "combined", "history"];

const allTableNames = [...forecastTableNames, "dashboards", "frontpage"];

/* Postgres database connection code */
const databaseURL = process.env.DIGITALOCEAN_POSTGRES;
export const readWritePool = new Pool({
  connectionString: databaseURL,
  ssl: process.env.POSTGRES_NO_SSL
    ? false
    : {
        rejectUnauthorized: false,
      },
});

const readOnlyDatabaseURL =
  "postgresql://public_read_only_user:gOcihnLhqRIQUQYt@postgres-red-do-user-10290909-0.b.db.ondigitalocean.com:25060/metaforecastpg?sslmode=require" ||
  process.env.DIGITALOCEAN_POSTGRES_PUBLIC;
const readOnlyPool = new Pool({
  // never used
  connectionString: readOnlyDatabaseURL,
  ssl: process.env.POSTGRES_NO_SSL
    ? false
    : {
        rejectUnauthorized: false,
      },
});

// Helpers
export const runPgCommand = async ({
  command,
  pool,
}: {
  command: string;
  pool: Pool;
}) => {
  console.log(command);
  const client = await pool.connect();
  let result;
  try {
    let response = await client.query(command);
    result = { results: response ? response.rows : null };
  } catch (error) {
    console.log(error);
  } finally {
    client.release();
  }
  return result;
};

// Initialize
let dropTable = (table: string) => `DROP TABLE IF EXISTS ${table}`;
let createIndex = (table: string) =>
  `CREATE INDEX ${table}_id_index ON ${table} (id);`;
let createUniqueIndex = (table: string) =>
  `CREATE UNIQUE INDEX ${table}_id_index ON ${table} (id);`;

async function pgInitializeScaffolding() {
  async function setPermissionsForPublicUser() {
    let initCommands = [
      "REVOKE ALL ON DATABASE metaforecastpg FROM public_read_only_user;",
      "GRANT CONNECT ON DATABASE metaforecastpg TO public_read_only_user;",
    ];
    for (let command of initCommands) {
      await runPgCommand({ command, pool: readWritePool });
    }

    await runPgCommand({
      command:
        "GRANT SELECT ON ALL TABLES IN SCHEMA public TO public_read_only_user",
      pool: readWritePool,
    });

    await runPgCommand({
      command:
        "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO public_read_only_user",
      pool: readWritePool,
    });
  }
  let YOLO = false;
  if (YOLO) {
    console.log("Set public user permissions");
    await setPermissionsForPublicUser();
    console.log("");
  } else {
    console.log(
      "pgInitializeScaffolding: This command is dangerous, set YOLO to true in the code to invoke it"
    );
  }
}

let buildMetaforecastTable = (table: string) => `CREATE TABLE ${table} (
    id text, 
    title text, 
    url text, 
    platform text, 
    description text, 
    options json, 
    timestamp timestamp, 
    stars int, 
    qualityindicators json, 
    extra json
  );`;

async function pgInitializeLatest() {
  let YOLO = false;
  if (YOLO) {
    console.log("Create tables & their indexes");
    for (const table of platformTableNames) {
      await runPgCommand({
        command: dropTable(table),
        pool: readWritePool,
      });
      await runPgCommand({
        command: buildMetaforecastTable(table),
        pool: readWritePool,
      });
      await runPgCommand({
        command: createUniqueIndex(table),
        pool: readWritePool,
      });
    }
    console.log("");
  } else {
    console.log(
      "pgInitializeLatest: This command is dangerous, set YOLO to true in the code to invoke it"
    );
  }
}

async function pgInitializeDashboards() {
  let buildDashboard = () =>
    `CREATE TABLE dashboards (
	  id text,
		title text,
		description text,
		contents json,
		timestamp timestamp,
		creator text,
		extra json
	);`;
  let YOLO = false;
  if (YOLO) {
    console.log("Create dashboard table and its index");

    await runPgCommand({
      command: dropTable("dashboards"),
      pool: readWritePool,
    });

    await runPgCommand({
      command: buildDashboard(),
      pool: readWritePool,
    });

    await runPgCommand({
      command: createUniqueIndex("dashboards"),
      pool: readWritePool,
    });
    console.log("");
  } else {
    console.log(
      "pgInitializeDashboard: This command is dangerous, set YOLO to true in the code to invoke it"
    );
  }
}

let buildHistoryTable = (table: string) => `CREATE TABLE ${table} (
    id text, 
    title text, 
    url text, 
    platform text, 
    description text, 
    options json, 
    timestamp timestamp, 
    stars int, 
    qualityindicators json, 
    extra json
  );`;
export async function pgInitializeHistories() {
  let YOLO = false;
  if (YOLO) {
    console.log("Create history table & index");
    await runPgCommand({
      command: dropTable("history"),
      pool: readWritePool,
    });
    await runPgCommand({
      command: buildHistoryTable("history"),
      pool: readWritePool,
    });
    await runPgCommand({
      command: createIndex("history"), // Not unique!!
      pool: readWritePool,
    });
    console.log("");
  } else {
    console.log(
      "pgInitializeHistories: This command is dangerous, set YOLO to true in the code to invoke it"
    );
  }
}

async function pgInitializeFrontpage() {
  let YOLO = false;
  if (YOLO) {
    await runPgCommand({
      command: dropTable("frontpage"),
      pool: readWritePool,
    });
    await runPgCommand({
      command: `CREATE TABLE frontpage (
        id serial primary key,
        frontpage_full jsonb,
        frontpage_sliced jsonb
      );`,
      pool: readWritePool,
    });
  } else {
    console.log(
      "pgInitializeFrontpage: This command is dangerous, set YOLO to true in the code to invoke it"
    );
  }
}

export async function pgInitialize() {
  await pgInitializeScaffolding();
  await pgInitializeLatest();
  await pgInitializeHistories();
  await pgInitializeDashboards();
  await pgInitializeFrontpage();
}

// Read
async function pgReadWithPool({
  tableName,
  pool,
}: {
  tableName: string;
  pool: Pool;
}) {
  if (!allTableNames.includes(tableName)) {
    throw Error(
      `Table ${tableName} not in whitelist; stopping to avoid tricky sql injections`
    );
  }
  let command = `SELECT * from ${tableName}`;
  let response = await runPgCommand({ command, pool });
  let results = response.results;
  return results;
}

export async function pgRead({ tableName }: { tableName: string }) {
  return await pgReadWithPool({ tableName, pool: readWritePool });
}

export async function pgReadWithReadCredentials({
  tableName,
}: {
  tableName: string;
}) {
  // currently does not work.
  /* return await pgReadWithPool({
    tableName,
    pool: readOnlyPool,
  });
	*/
  return await pgReadWithPool({ tableName, pool: readWritePool });
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
  let response = await runPgCommand({ command, pool: readWritePool });
  let results = response.results;
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
  const client = await readWritePool.connect();
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
  replace,
}: {
  contents: Forecast[];
  tableName: string;
  replace: boolean;
}) {
  if (!forecastTableNames.includes(tableName)) {
    throw Error(
      `Table ${tableName} not in whitelist; stopping to avoid tricky sql injections`
    );
  }

  await measureTime(async () => {
    const client = await readWritePool.connect();
    try {
      await client.query("BEGIN");
      if (replace) {
        client.query(`DELETE FROM ${tableName}`);
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
      console.log(JSON.stringify(contents.slice(0, 1), null, 4));
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  });
}
