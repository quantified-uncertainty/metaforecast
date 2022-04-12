import { pgRead, pool } from "./database/pg-wrapper";
import { Question } from "./platforms";

export async function getFrontpage(): Promise<Question[]> {
  const res = await pool.query(
    "SELECT frontpage_sliced FROM frontpage ORDER BY id DESC LIMIT 1"
  );
  if (!res.rows.length) return [];
  return res.rows[0].frontpage_sliced;
}

export async function getFrontpageFull(): Promise<Question[]> {
  const res = await pool.query(
    "SELECT frontpage_full FROM frontpage ORDER BY id DESC LIMIT 1"
  );
  if (!res.rows.length) return [];
  return res.rows[0].frontpage_full;
}

export async function rebuildFrontpage() {
  const frontpageFull = await pgRead({
    tableName: "questions",
  });

  const frontpageSliced = (
    await pool.query(`
    SELECT * FROM questions
    WHERE
      (qualityindicators->>'stars')::int >= 3
      AND description != ''
      AND JSONB_ARRAY_LENGTH(options) > 0
    ORDER BY RANDOM() LIMIT 50
  `)
  ).rows;

  const start = Date.now();
  await pool.query(
    "INSERT INTO frontpage(frontpage_full, frontpage_sliced) VALUES($1, $2)",
    [JSON.stringify(frontpageFull), JSON.stringify(frontpageSliced)]
  );

  const end = Date.now();
  const difference = end - start;
  console.log(
    `Took ${difference / 1000} seconds, or ${difference / (1000 * 60)} minutes.`
  );
}
