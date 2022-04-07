import { pgRead, pgUpsert } from "../../database/pg-wrapper";

export async function updateHistory() {
  let latest = await pgRead({ tableName: "questions" });
  await pgUpsert({
    contents: latest,
    tableName: "history",
  });
}
