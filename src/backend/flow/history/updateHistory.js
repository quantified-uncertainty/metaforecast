import {
  databaseReadWithReadCredentials,
  databaseUpsert,
} from "../../database/database-wrapper.js";

export async function updateHistory() {
  let latest = await databaseReadWithReadCredentials({ group: "combined" });
  await databaseUpsert({
    contents: latest,
    group: "history",
  });
}
