import pkg from "pg";
import { platformNames } from "../platforms/all/platformNames";
import { hash } from "../utils/hash";
import { roughSizeOfObject } from "../utils/roughSize";
const { Pool } = pkg;

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
const tableNamesWhitelistLatest = ["combined", ...platformNames];
const tableNamesWhiteListHistory = [
  ...allowed_years,
  ...allowed_year_month_histories,
];
const tableNamesWhitelist = [
  ...tableNamesWhitelistLatest,
  ...tableNamesWhiteListHistory,
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
export const runPgCommand = async ({ command, pool }) => {
  console.log(command);
  const client = await pool.connect();
  let result;
  try {
    let response = await client.query(command);
    console.log(response);
    result = { results: response ? response.rows : null };
  } catch (error) {
    console.log(error);
  } finally {
    client.release();
  }
  // console.log(results)
  return result;
};

// Initialize
let dropTable = (schema, table) => `DROP TABLE IF EXISTS ${schema}.${table}`;
let createIndex = (schema, table) =>
  `CREATE INDEX ${schema}_${table}_id_index ON ${schema}.${table} (id);`;
let createUniqueIndex = (schema, table) =>
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

    let buildGrantSelectForSchema = (schema) =>
      `GRANT SELECT ON ALL TABLES IN SCHEMA ${schema} TO public_read_only_user`;
    for (let schema of schemas) {
      await runPgCommand({
        command: buildGrantSelectForSchema(schema),
        pool: readWritePool,
      });
    }

    let alterDefaultPrivilegesForSchema = (schema) =>
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
  schema,
  table
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

let buildHistoryTable = (schema, table) => `CREATE TABLE ${schema}.${table} (
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
async function pgReadWithPool({ schema, tableName, pool }) {
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

export async function pgRead({ schema, tableName }) {
  return await pgReadWithPool({ schema, tableName, pool: readWritePool });
}

export async function pgReadWithReadCredentials({ schema, tableName }) {
  // currently does not work.
  /* return await pgReadWithPool({
    schema,
    tableName,
    pool: readOnlyPool,
  });
	*/
  return await pgReadWithPool({ schema, tableName, pool: readWritePool });
}

export async function pgGetByIds({ ids, schema, table }) {
  let idstring = `( ${ids.map((id) => `'${id}'`).join(", ")} )`; // (1, 2, 3)
  let command = `SELECT * from ${schema}.${table} where id in ${idstring}`;
  // see: https://stackoverflow.com/questions/5803472/sql-where-id-in-id1-id2-idn
  let response = await runPgCommand({ command, pool: readWritePool });
  let results = response.results;
  console.log(results);
  return results;
}

export async function pgInsert({ datum, schema, tableName }) {
  if (tableWhiteList.includes(`${schema}.${tableName}`)) {
    let text = `INSERT INTO ${schema}.${tableName} VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`;
    let timestamp =
      datum.timestamp &&
      !!datum.timestamp.slice &&
      !isNaN(Date.parse(datum.timestamp))
        ? datum.timestamp
        : new Date().toISOString();
    timestamp = timestamp.slice(0, 19).replace("T", " ");
    let values = [
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
/* For reference:
pgInsert({
		"id": "fantasyscotus-580",
		"title": "In Wooden v. U.S., the SCOTUS will affirm the lower court's decision",
		"url": "https://fantasyscotus.net/user-predictions/case/wooden-v-us/",
		"platform": "FantasySCOTUS",
		"description": "62.50% (75 out of 120) of FantasySCOTUS players predict that the lower court's decision will be affirmed. FantasySCOTUS overall predicts an outcome of Affirm 6-3. Historically, FantasySCOTUS has chosen the correct side 50.00% of the time.",
		"options": [
			{
				"name": "Yes",
				"probability": 0.625,
				"type": "PROBABILITY"
			},
			{
				"name": "No",
				"probability": 0.375,
				"type": "PROBABILITY"
			}
		],
		"timestamp": "2022-02-11T21:42:19.291Z",
		"qualityindicators": {
			"numforecasts": 120,
			"stars": 2
		}
	}
)
*/
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
  if (tableWhiteList.includes(`${schema}.${tableName}`)) {
    let init = Date.now();
    if (schema == "latest") {
      await runPgCommand({
        command: dropTable(schema, tableName),
        pool: readWritePool,
      });
      await runPgCommand({
        command: buildMetaforecastTable(schema, tableName),
        pool: readWritePool,
      });
      await runPgCommand({
        command: createUniqueIndex(schema, tableName),
        pool: readWritePool,
      });
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
    let i = 0;
    for (let datum of contents) {
      await pgInsert({ datum, schema, tableName });
      if (i < 10) {
        console.log(`Inserted ${datum.id}`);
        i++;
      } else if (i == 10) {
        console.log("...");
        i++;
      }
    }
    console.log(
      `Inserted ${
        contents.length
      } rows with approximate cummulative size ${roughSizeOfObject(
        contents
      )} MB into ${schema}.${tableName}.`
    );
    let check = await pgRead({ schema, tableName });
    console.log(
      `Received ${
        check.length
      } rows with approximate cummulative size ${roughSizeOfObject(
        check
      )} MB from ${schema}.${tableName}.`
    );
    console.log("Sample: ");
    console.log(JSON.stringify(check.slice(0, 1), null, 4));

    let end = Date.now();
    let difference = end - init;
    console.log(
      `Took ${difference / 1000} seconds, or ${
        difference / (1000 * 60)
      } minutes.`
    );

    //console.log(JSON.stringify(check.slice(0, 1), null, 4));
  } else {
    console.log("tableWhiteList:");
    console.log(tableWhiteList);
    throw Error(
      `Table ${schema}.${tableName} not in whitelist; stopping to avoid tricky sql injections`
    );
  }
}
