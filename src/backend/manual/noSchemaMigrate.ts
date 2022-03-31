import "dotenv/config";

import { readWritePool } from "../database/pg-wrapper";
import { platforms } from "../platforms";

const migrate = async () => {
  const client = await readWritePool.connect();

  const execQuery = async (q: string) => {
    console.log(q);
    await client.query(q);
  };

  try {
    await client.query("BEGIN");
    const copyTable = async (from: string, to: string) => {
      await execQuery(`DROP TABLE IF EXISTS ${to}`);
      await execQuery(`CREATE TABLE ${to} (LIKE ${from} INCLUDING ALL)`);
      await execQuery(`INSERT INTO ${to} SELECT * FROM ${from}`);
    };

    for (const platform of platforms) {
      await copyTable(`latest.${platform.name}`, platform.name);
    }
    await copyTable("latest.dashboards", "dashboards");
    await copyTable("latest.combined", "combined");
    await copyTable("latest.frontpage", "frontpage");
    await copyTable("history.h2022", "history");
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
};

migrate();
