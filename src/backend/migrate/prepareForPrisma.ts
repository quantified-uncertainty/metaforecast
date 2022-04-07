import "dotenv/config";

import { pool } from "../database/pg-wrapper";

const migrate = async () => {
  const client = await pool.connect();

  const execQuery = async (q: string) => {
    console.log(q);
    await client.query(q);
  };

  try {
    await client.query("BEGIN");

    const notNullColumn = async (table: string, column: string) => {
      await execQuery(
        `ALTER TABLE ${table} ALTER COLUMN ${column} SET NOT NULL`
      );
    };

    const jsonbColumn = async (table: string, column: string) => {
      await execQuery(
        `ALTER TABLE ${table} ALTER COLUMN ${column} SET DATA TYPE jsonb USING ${column}::jsonb`
      );
    };

    const t2c = {
      dashboards: [
        "id",
        "title",
        "description",
        "contents",
        "timestamp",
        "creator",
        "extra",
      ],
      frontpage: ["frontpage_sliced", "frontpage_full"],
      history: [
        "id",
        "title",
        "url",
        "platform",
        "description",
        "options",
        "timestamp",
        "stars",
        "qualityindicators",
        "extra",
      ],
      questions: [
        "id",
        "title",
        "url",
        "platform",
        "description",
        "options",
        "timestamp",
        "stars",
        "qualityindicators",
        "extra",
      ],
    };
    for (const [table, columns] of Object.entries(t2c)) {
      for (const column of columns) {
        await notNullColumn(table, column);
      }
    }

    await execQuery("ALTER TABLE history ADD COLUMN pk SERIAL PRIMARY KEY");
    await execQuery("ALTER TABLE dashboards ADD PRIMARY KEY (id)");
    await execQuery("ALTER TABLE questions ADD PRIMARY KEY (id)");

    await jsonbColumn("dashboards", "contents");
    await jsonbColumn("dashboards", "extra");

    for (const table of ["history", "questions"]) {
      await jsonbColumn(table, "options");
      await jsonbColumn(table, "qualityindicators");
      await jsonbColumn(table, "extra");
    }

    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
};

migrate();
