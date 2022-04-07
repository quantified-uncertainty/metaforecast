import "dotenv/config";

import { pool } from "../database/pg-wrapper";

const migrate = async () => {
  const client = await pool.connect();

  const execQuery = async (q: string) => {
    console.log(q);
    await client.query(q);
  };

  const platformTitleToName = {
    Betfair: "betfair",
    FantasySCOTUS: "fantasyscotus",
    Foretold: "foretold",
    "GiveWell/OpenPhilanthropy": "givewellopenphil",
    "Good Judgment": "goodjudgement",
    "Good Judgment Open": "goodjudgmentopen",
    Infer: "infer",
    Kalshi: "kalshi",
    "Manifold Markets": "manifold",
    Metaculus: "metaculus",
    "Peter Wildeford": "wildeford",
    PolyMarket: "polymarket",
    PredictIt: "predictit",
    Rootclaim: "rootclaim",
    Smarkets: "smarkets",
    "X-risk estimates": "xrisk",
  };

  try {
    await client.query("BEGIN");
    const copyTable = async (from: string, to: string) => {
      await execQuery(`DROP TABLE IF EXISTS ${to}`);
      await execQuery(`CREATE TABLE ${to} (LIKE ${from} INCLUDING ALL)`);
      await execQuery(`INSERT INTO ${to} SELECT * FROM ${from}`);
    };

    await copyTable("latest.dashboards", "dashboards");
    await copyTable("latest.combined", "questions");
    await copyTable("latest.frontpage", "frontpage");
    await copyTable("history.h2022", "history");

    for (const [title, name] of Object.entries(platformTitleToName)) {
      console.log(`Updating ${title} -> ${name}`);
      for (const table of ["questions", "history"]) {
        await client.query(
          `UPDATE ${table} SET platform=$1 WHERE platform=$2`,
          [name, title]
        );
      }
    }

    console.log("Fixing GJOpen ids in questions and history");
    for (const table of ["questions", "history"]) {
      await client.query(
        `UPDATE ${table} SET id=REPLACE(id, 'goodjudmentopen-', 'goodjudgmentopen-') WHERE id LIKE 'goodjudmentopen-%'`
      );
    }

    const fixId = (id: string) =>
      id.replace("goodjudmentopen-", "goodjudgmentopen-");

    console.log(
      "Please rebuild frontpage manually - current version includes invalid GJOpen and xrisk ids"
    );

    const updateDashboards = async () => {
      const res = await client.query("SELECT id, contents FROM dashboards");
      for (const row of res.rows) {
        let { id, contents } = row;
        contents = contents.map(fixId);
        await client.query(
          "UPDATE dashboards SET contents = $1 WHERE id = $2",
          [JSON.stringify(contents), id]
        );
      }
    };
    console.log("Updating dashboards");
    await updateDashboards();

    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
};

migrate();
