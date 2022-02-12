import pkg from 'pg';
const { Pool } = pkg;
import { platformNames } from "../platforms/all/platformNames.js"
import { getSecret } from '../utils/getSecrets.js';
import { roughSizeOfObject } from "../utils/roughSize.js"

// Definitions
const schemas = ["latest", "history"]
const tableNamesWhitelist = ["combined", ...platformNames]
const createFullName = (schemaName, namesArray) => namesArray.map(name => `${schemaName}.${name}`)
const tableWhiteList = [...createFullName("latest", tableNamesWhitelist), ...createFullName("history", tableNamesWhitelist)]


/* Postgres database connection code */
const pool = new Pool({
	connectionString: process.env.DATABASE_URL || getSecret("heroku-postgres"),
	ssl: {
		rejectUnauthorized: false
	}
});


// Helpers
const runPgCommand = async (query) => {
	console.log(query)
	const client = await pool.connect();
	const result = await client.query(query);
	const results = { 'results': (result) ? result.rows : null };
	client.release();
	// console.log(results)
	return results
}

// Initialize
let dropTable = (schema, table) => `DROP TABLE IF EXISTS ${schema}.${table}`
let buildMetaforecastTable = (schema, table) => `CREATE TABLE ${schema}.${table} (
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
	);`
let createIndex = (schema, table) => `CREATE INDEX ${schema}_${table}_id_index ON ${schema}.${table} (id);`
let createUniqueIndex = (schema, table) => `CREATE UNIQUE INDEX ${schema}_${table}_id_index ON ${schema}.${table} (id);`

export async function pgInitialize() {

	for (let schema of schemas) {
		runPgCommand(`CREATE SCHEMA IF NOT EXISTS ${schema}`)
	}
	runPgCommand(`SET search_path TO ${schemas.join(",")},public;`)

	for (let schema of schemas) {
		for (let table of tableNamesWhitelist) {
			await runPgCommand(dropTable(schema, table))
			await runPgCommand(buildMetaforecastTable(schema, table))
			if (schema == "history") {
				await runPgCommand(createIndex(schema, table))
			} else {
				await runPgCommand(createUniqueIndex(schema, table))
			}
		}
	}

}
// pgInitialize()

// Read
export async function pgRead({schema, tableName}) {
	if (tableWhiteList.includes(`${schema}.${tableName}`)) {
		let command = `SELECT * from ${schema}.${tableName}`
		let response = await runPgCommand(command)
		let results = response. results
		return results
	} else {
		throw Error(`Table ${schema}.${tableName} not in whitelist; stopping to avoid tricky sql injections`)
	}
}

export async function pgInsert({ datum, schema, tableName }) {
	if (tableWhiteList.includes(`${schema}.${tableName}`)) {
		let text = `INSERT INTO ${schema}.${tableName} VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`
		let timestamp = datum.timestamp || new Date().toISOString()
		timestamp = timestamp.slice(0, 19).replace("T", " ")
		let values = [
			datum.id,
			datum.title,
			datum.url,
			datum.platform,
			datum.description || '',
			JSON.stringify(datum.options || []),
			timestamp, // fix
			datum.stars || (datum.qualityindicators ? datum.qualityindicators.stars : 2),
			JSON.stringify(datum.qualityindicators || []),
			JSON.stringify(datum.extra || [])
		]

		const client = await pool.connect();
		const result = await client.query(text, values);
		client.release();
		// console.log(result)
		return result
	} else {
		throw Error(`Table ${schema}.${tableName} not in whitelist; stopping to avoid tricky sql injections`)
	}
}

/*
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

export async function pgUpsert({ contents, schema, tableName }) {


	if (tableWhiteList.includes(`${schema}.${tableName}`)) {
		if (schema == "latest") {
			await dropTable(schema, tableName);
			await buildMetaforecastTable(schema, tableName);
			await createUniqueIndex(schema, tableName)
		}
		console.log(`Inserting into postgres table ${schema}.${tableName}`)
		let i = 0
		for (let datum of contents) {
			await pgInsert({ datum, schema, tableName })
			if (i < 10) {
				console.log(`Inserted ${datum.id}`)
				i++
			} else if (i == 10) {
				console.log("...")
				i++
			}
		}
		console.log(`Inserted rows with approximate cummulative size ${roughSizeOfObject(contents)} MB into ${schema}.${tableName}.`)
		let check = await pgRead({schema, tableName})
		console.log(`Received rows with approximate cummulative size ${roughSizeOfObject(check)} MB from ${schema}.${tableName}.`)
		console.log("Sample: ")
		console.log(JSON.stringify(check.slice(0,1), null, 4));

		//console.log(JSON.stringify(check.slice(0, 1), null, 4));

	} else {
		throw Error(`Table ${schema}.${tableName} not in whitelist; stopping to avoid tricky sql injections`)
	}
}