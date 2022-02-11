import pkg from 'pg';
const { Pool } = pkg

/* Postgres database connection code */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const tableWhiteList = ["latest.combined"]

export async function pgRead(tableName="latest.combined"){
  if(tableWhiteList.includes(tableName)){
    const client = await pool.connect();
    const result = await client.query(`SELECT * from ${tableName}`);
    const results = { 'results': (result) ? result.rows : null};
    // response.render('pages/db', results );
    client.release();
    return results
  }else{
    throw Error("Table not in whitelist; stopping to avoid tricky sql injections")
  }
}

export async function pgInsert(data, tableName="latest.combined"){
  if(tableWhiteList.includes(tableName)){
		let text = `INSERT INTO ${tableName} VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`
		let values = [
			data.id,
			data.title,
			data.url,
			data.platform,
			data.description || '',
			data.options || [],
			data.timestamp || Date.now(), // fix
			data.stars || (data.qualityindicators ? data.qualityindicators.stars : 2),
			data.qualityindicators || [],
			data.extra || []
		]

		const client = await pool.connect();
		const result = await client.query(text, values);
		client.release();
	}else{
    throw Error("Table not in whitelist; stopping to avoid tricky sql injections")
	}
}
