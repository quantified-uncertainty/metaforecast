import { pgRead, pgReadWithReadCredentials, pgUpsert } from './pg-wrapper';

const dateUpToYear = () => new Date().toISOString().slice(0, 4);
const dateUpToMonth = () =>
  new Date().toISOString().slice(0, 7).replace("-", "_");

export async function databaseUpsert({ contents, group }) {
  // No, this should be more rational, ({contents, group, schema})? Or should this be managed by this layer? Unclear.
  // (contents, documentName, collectionName = "metaforecastCollection", databaseName = "metaforecastDatabase"){
  switch (group) {
    case "combined":
      await pgUpsert({ contents, schema: "latest", tableName: "combined" });
      break;
    case "history":
      await pgUpsert({
        contents,
        schema: "history",
        tableName: `h${dateUpToYear()}`,
      });
      await pgUpsert({
        contents,
        schema: "history",
        tableName: `h${dateUpToMonth()}`,
      });
      break;
    default:
      await pgUpsert({ contents, schema: "latest", tableName: group });
  }
}

const readWithReader = async (
  group: string,
  reader: (opts: { schema: string; tableName: string }) => Promise<any>
) => {
  const schema = group === "history" ? "history" : "latest";
  const tableName = group === "history" ? `h${dateUpToMonth()}` : group;
  const response = await reader({
    schema,
    tableName,
  });

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
