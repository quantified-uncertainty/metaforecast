import { pgReadWithReadCredentials, pgUpsert } from "../../database/pg-wrapper";

export async function updateHistory() {
  let latest = await pgReadWithReadCredentials({ tableName: "questions" });
  await pgUpsert({
    contents: latest,
    tableName: "history",
  });
}
