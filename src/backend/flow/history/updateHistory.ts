import { pgReadWithReadCredentials, pgUpsert } from "../../database/pg-wrapper";

export async function updateHistory() {
  let latest = await pgReadWithReadCredentials({ tableName: "combined" });
  await pgUpsert({
    contents: latest,
    tableName: "h2022",
  });
}
