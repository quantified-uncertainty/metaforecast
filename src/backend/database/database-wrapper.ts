import { pgRead, pgReadWithReadCredentials, pgUpsert } from "./pg-wrapper";

export async function databaseUpsert({ contents, group }) {
  // No, this should be more rational, ({contents, group, schema})? Or should this be managed by this layer? Unclear.
  // (contents, documentName, collectionName = "metaforecastCollection", databaseName = "metaforecastDatabase"){
  const tableName = group === "history" ? "h2022" : group;
  await pgUpsert({ contents, tableName });
}

const readWithReader = async (
  group: string,
  reader: (opts: { tableName: string }) => Promise<any>
) => {
  const tableName = group === "history" ? "h2022" : group;
  const response = await reader({ tableName });

  console.log("Postgres: ");
  console.log(response.slice(0, 2));
  console.log("");

  return response;
};

export async function databaseRead({ group }) {
  return await readWithReader(group, pgRead);
}

export async function databaseReadWithReadCredentials({ group }) {
  return await readWithReader(group, pgReadWithReadCredentials);
}
