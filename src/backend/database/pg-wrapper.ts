import { Pool, PoolClient } from "pg";

import { Forecast, platforms } from "../platforms";
import { hash } from "../utils/hash";
import { measureTime } from "../utils/measureTime";
import { roughSizeOfObject } from "../utils/roughSize";

// Definitions
const schemas = ["latest", "history"];
const year = Number(new Date().toISOString().slice(0, 4));
const allowed_years = [year, year + 1].map((year) => `h${year}`); // tables can't begin with number
const allowed_months = [...Array(12).keys()]
  .map((x) => x + 1)
  .map((x) => (String(x).length == 1 ? `0${x}` : x));
const allowed_year_month_histories = [].concat(
  ...allowed_years.map((year) =>
    allowed_months.map((month) => `${year}_${month}`)
  )
); // h2022_01
const tableNamesWhitelistLatest = [
  "combined",
  ...platforms.map((platform) => platform.name),
];
const tableNamesWhiteListHistory = [
  ...allowed_years,
  ...allowed_year_month_histories,
];
const createFullName = (schemaName, namesArray) =>
  namesArray.map((name) => `${schemaName}.${name}`);
const tableWhiteList = [
  ...createFullName("latest", tableNamesWhitelistLatest),
  ...createFullName("history", tableNamesWhiteListHistory),
  "latest.dashboards",
];

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
let dropTable = (schema: string, table: string) =>
  `DROP TABLE IF EXISTS ${schema}.${table}`;
let createIndex = (schema: string, table: string) =>
  `CREATE INDEX ${schema}_${table}_id_index ON ${schema}.${table} (id);`;
let createUniqueIndex = (schema: string, table: string) =>
  `CREATE UNIQUE INDEX ${schema}_${table}_id_index ON ${schema}.${table} (id);`;

async function pgInitializeScaffolding() {
  async function setPermissionsForPublicUser() {
    let initCommands = [
      "REVOKE ALL ON DATABASE metaforecastpg FROM public_read_only_user;",
      "GRANT CONNECT ON DATABASE metaforecastpg TO public_read_only_user;",
    ];
    for (let command of initCommands) {
      await runPgCommand({ command, pool: readWritePool });
    }

    let buildGrantSelectForSchema = (schema: string) =>
      `GRANT SELECT ON ALL TABLES IN SCHEMA ${schema} TO public_read_only_user`;
    for (let schema of schemas) {
      await runPgCommand({
        command: buildGrantSelectForSchema(schema),
        pool: readWritePool,
      });
    }

    let alterDefaultPrivilegesForSchema = (schema: string) =>
      `ALTER DEFAULT PRIVILEGES IN SCHEMA ${schema} GRANT SELECT ON TABLES TO public_read_only_user`;
    for (let schema of schemas) {
      await runPgCommand({
        command: alterDefaultPrivilegesForSchema(schema),
        pool: readWritePool,
      });
    }
  }
  let YOLO = false;
  if (YOLO) {
    console.log("Create schemas");
    for (let schema of schemas) {
      await runPgCommand({
        command: `CREATE SCHEMA IF NOT EXISTS ${schema}`,
        pool: readWritePool,
      });
    }
    console.log("");

    console.log("Set search path");
    await runPgCommand({
      command: `SET search_path TO ${schemas.join(",")},public;`,
      pool: readWritePool,
    });
    console.log("");

    console.log("Set public user permissions");
    await setPermissionsForPublicUser();
    console.log("");
  } else {
    console.log(
      "pgInitializeScaffolding: This command is dangerous, set YOLO to true in the code to invoke it"
    );
  }
}

let buildMetaforecastTable = (
  schema: string,
  table: string
) => `CREATE TABLE ${schema}.${table} (
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
    let schema = "latest";
    for (let table of tableNamesWhitelistLatest) {
      await runPgCommand({
        command: dropTable(schema, table),
        pool: readWritePool,
      });
      await runPgCommand({
        command: buildMetaforecastTable(schema, table),
        pool: readWritePool,
      });
      /*
      if (schema == "history") {
        await runPgCommand({
          command: createIndex(schema, table),
          pool: readWritePool,
        });
      } else {
        */
      await runPgCommand({
        command: createUniqueIndex(schema, table),
        pool: readWritePool,
      });
      //}
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
    `CREATE TABLE latest.dashboards (
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
    await runPgCommand({
      command: `CREATE SCHEMA IF NOT EXISTS history;`,
      pool: readWritePool,
    });
    console.log("");

    console.log("Set search path");
    await runPgCommand({
      command: `SET search_path TO ${schemas.join(",")},public;`,
      pool: readWritePool,
    });
    console.log("");

    console.log("Create dashboard table and its index");

    await runPgCommand({
      command: dropTable("latest", "dashboards"),
      pool: readWritePool,
    });

    await runPgCommand({
      command: buildDashboard(),
      pool: readWritePool,
    });

    await runPgCommand({
      command: createUniqueIndex("latest", "dashboards"),
      pool: readWritePool,
    });
    console.log("");
  } else {
    console.log(
      "pgInitializeDashboard: This command is dangerous, set YOLO to true in the code to invoke it"
    );
  }
}

let buildHistoryTable = (
  schema: string,
  table: string
) => `CREATE TABLE ${schema}.${table} (
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
    console.log("Drop all previous history tables (Danger!)");
    await runPgCommand({
      command: `DROP SCHEMA history CASCADE;`,
      pool: readWritePool,
    });
    console.log("");

    console.log("Create schemas");
    for (let schema of schemas) {
      await runPgCommand({
        command: `CREATE SCHEMA IF NOT EXISTS ${schema}`,
        pool: readWritePool,
      });
    }
    console.log("");

    console.log("Set search path");
    await runPgCommand({
      command: `SET search_path TO ${schemas.join(",")},public;`,
      pool: readWritePool,
    });
    console.log("");

    console.log("Create tables & their indexes");
    let schema = "history";
    for (let table of tableNamesWhiteListHistory) {
      await runPgCommand({
        command: dropTable(schema, table),
        pool: readWritePool,
      });
      await runPgCommand({
        command: buildHistoryTable(schema, table),
        pool: readWritePool,
      });
      await runPgCommand({
        command: createIndex(schema, table), // Not unique!!
        pool: readWritePool,
      });
    }
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
      command: dropTable("latest", "frontpage"),
      pool: readWritePool,
    });
    await runPgCommand({
      command: `CREATE TABLE latest.frontpage (
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
  schema,
  tableName,
  pool,
}: {
  schema: string;
  tableName: string;
  pool: Pool;
}) {
  if (tableWhiteList.includes(`${schema}.${tableName}`)) {
    let command = `SELECT * from ${schema}.${tableName}`;
    let response = await runPgCommand({ command, pool });
    let results = response.results;
    return results;
  } else {
    throw Error(
      `Table ${schema}.${tableName} not in whitelist; stopping to avoid tricky sql injections`
    );
  }
}

export async function pgRead({
  schema,
  tableName,
}: {
  schema: string;
  tableName: string;
}) {
  return await pgReadWithPool({ schema, tableName, pool: readWritePool });
}

export async function pgReadWithReadCredentials({
  schema,
  tableName,
}: {
  schema: string;
  tableName: string;
}) {
  // currently does not work.
  /* return await pgReadWithPool({
    schema,
    tableName,
    pool: readOnlyPool,
  });
	*/
  return await pgReadWithPool({ schema, tableName, pool: readWritePool });
}

export async function pgGetByIds({
  ids,
  schema,
  table,
}: {
  ids: string[];
  schema: string;
  table: string;
}) {
  let idstring = `( ${ids.map((id: string) => `'${id}'`).join(", ")} )`; // (1, 2, 3)
  let command = `SELECT * from ${schema}.${table} where id in ${idstring}`;
  // see: https://stackoverflow.com/questions/5803472/sql-where-id-in-id1-id2-idn
  let response = await runPgCommand({ command, pool: readWritePool });
  let results = response.results;
  console.log(results);
  return results;
}

export async function pgBulkInsert({
  data,
  schema,
  tableName,
  client,
}: {
  data: Forecast[];
  schema: string;
  tableName: string;
  client: PoolClient;
}) {
  if (!tableWhiteList.includes(`${schema}.${tableName}`)) {
    throw Error(
      `Table ${schema}.${tableName} not in whitelist; stopping to avoid tricky sql injections`
    );
  }

  const generateQuery = (rows: number) => {
    let text = `INSERT INTO ${schema}.${tableName} VALUES`;
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

export async function pgInsertIntoDashboard({ datum, schema, tableName }) {
  if (tableWhiteList.includes(`${schema}.${tableName}`)) {
    let text = `INSERT INTO ${schema}.${tableName} VALUES($1, $2, $3, $4, $5, $6, $7)`;
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
  } else {
    throw Error(
      `Table ${schema}.${tableName} not in whitelist; stopping to avoid tricky sql injections`
    );
  }
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
  schema: "latest",
  tableName: "dashboards",
});
*/
export async function pgUpsert({ contents, schema, tableName }) {
  if (!tableWhiteList.includes(`${schema}.${tableName}`)) {
    console.log("tableWhiteList:");
    console.log(tableWhiteList);
    throw Error(
      `Table ${schema}.${tableName} not in whitelist; stopping to avoid tricky sql injections`
    );
  }

  await measureTime(async () => {
    const client = await readWritePool.connect();
    try {
      await client.query("BEGIN");
      if (schema === "latest") {
        client.query(`DELETE FROM latest.${tableName}`);
      }
      console.log(
        `Upserting ${contents.length} rows into postgres table ${schema}.${tableName}.`
      );
      console.log(
        `Expected to take ${Number((contents.length * 831.183) / 4422).toFixed(
          2
        )} seconds or ${Number((contents.length * 13.85305) / 4422).toFixed(
          2
        )} minutes`
      );

      await pgBulkInsert({ data: contents, schema, tableName, client });
      console.log(
        `Inserted ${
          contents.length
        } rows with approximate cummulative size ${roughSizeOfObject(
          contents
        )} MB into ${schema}.${tableName}.`
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
