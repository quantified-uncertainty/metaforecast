import { mongoRead, mongoReadWithReadCredentials, mongoUpsert } from './mongo-wrapper';
import { pgRead, pgReadWithReadCredentials, pgUpsert } from './pg-wrapper';

export async function databaseUpsert({ contents, group }) {
  // No, this should be more rational, ({contents, group, schema})? Or should this be managed by this layer? Unclear.
  // (contents, documentName, collectionName = "metaforecastCollection", databaseName = "metaforecastDatabase"){
  let mongoDocName;
  switch (group) {
    case "combined":
      mongoDocName = "metaforecasts";
      await mongoUpsert(
        contents,
        mongoDocName,
        "metaforecastCollection",
        "metaforecastDatabase"
      );
      await pgUpsert({ contents, schema: "latest", tableName: "combined" });
      break;
    case "history":
      let currentDate = new Date();
      let dateUpToYear = currentDate.toISOString().slice(0, 4);
      let dateUpToMonth = currentDate
        .toISOString()
        .slice(0, 7)
        .replace("-", "_");
      mongoDocName = `metaforecast_history_${dateUpToMonth}`;
      await mongoUpsert(
        contents,
        mongoDocName,
        "metaforecastHistory",
        "metaforecastDatabase"
      );
      await pgUpsert({
        contents,
        schema: "history",
        tableName: `h${dateUpToYear}`,
      });
      await pgUpsert({
        contents,
        schema: "history",
        tableName: `h${dateUpToMonth}`,
      });
      break;
    default:
      mongoDocName = `${group}-questions`;
      await mongoUpsert(
        contents,
        mongoDocName,
        "metaforecastCollection",
        "metaforecastDatabase"
      );
      await pgUpsert({ contents, schema: "latest", tableName: group });
  }
}
// databaseUpsert(contents, documentName, collectionName = "metaforecastCollection", databaseName = "metaforecastDatabase")

export async function databaseRead({ group }) {
  let response, mongoDocName, responseMongo, responsePg;
  let currentDate = new Date();
  let dateUpToMonth = currentDate.toISOString().slice(0, 7).replace("-", "_"); // e.g., 2022_02

  let displayPossibleResponses = (response1, response2) => {
    console.log("Possible responses:");
    console.log("Mongo: ");
    console.log(response1.slice(0, 2));
    console.log("Postgres: ");
    console.log(response2.slice(0, 2));
    console.log("");
  };

  switch (group) {
    case "combined":
      mongoDocName = "metaforecasts";
      responseMongo = await mongoRead(
        mongoDocName,
        "metaforecastCollection",
        "metaforecastDatabase"
      );
      responsePg = await pgRead({ schema: "latest", tableName: "combined" });
      displayPossibleResponses(responseMongo, responsePg);
      break;
    case "history":
      mongoDocName = `metaforecast_history_${dateUpToMonth}`;
      responseMongo = await mongoRead(
        mongoDocName,
        "metaforecastHistory",
        "metaforecastDatabase"
      );
      responsePg = responseMongo; // await pgReadWithReadCredentials({ schema: "history", tableName: "combined" }) // fix, make dependent on month.
      break;
    default:
      mongoDocName = `${group}-questions`;
      responseMongo = mongoRead(
        mongoDocName,
        "metaforecastCollection",
        "metaforecastDatabase"
      );
      responsePg = await pgRead({ schema: "latest", tableName: group });
  }

  response = responsePg; // responseMongo;
  return response;
}
// databaseRead(documentName, collectionName = "metaforecastCollection", databaseName = "metaforecastDatabase")

export async function databaseReadWithReadCredentials({ group }) {
  let response, mongoDocName, responseMongo, responsePg;
  let currentDate = new Date();
  let dateUpToMonth = currentDate.toISOString().slice(0, 7).replace("-", "_"); // e.g., 2022_02

  let displayPossibleResponses = (response1, response2) => {
    console.log("Possible responses:");
    console.log("Mongo: ");
    console.log(response1.slice(0, 2));
    console.log("Postgres: ");
    console.log(response2.slice(0, 2));
    console.log("");
  };

  switch (group) {
    case "combined":
      mongoDocName = "metaforecasts";
      responseMongo = await mongoReadWithReadCredentials(
        mongoDocName,
        "metaforecastCollection",
        "metaforecastDatabase"
      );
      responsePg = await pgReadWithReadCredentials({
        schema: "latest",
        tableName: "combined",
      });
      displayPossibleResponses(responseMongo, responsePg);
      break;
    case "history":
      mongoDocName = `metaforecast_history_${dateUpToMonth}`;
      responseMongo = await mongoReadWithReadCredentials(
        mongoDocName,
        "metaforecastHistory",
        "metaforecastDatabase"
      );
      responsePg = responseMongo; // await pgReadWithReadCredentials({ schema: "history", tableName: "combined" }) // fix, make dependent on month.
      break;
    default:
      mongoDocName = `${group}-questions`;
      responseMongo = mongoRemongoReadWithReadCredentialsad(
        mongoDocName,
        "metaforecastCollection",
        "metaforecastDatabase"
      );
      responsePg = await pgReadWithReadCredentials({
        schema: "latest",
        tableName: group,
      });
      displayPossibleResponses(responseMongo, responsePg);
  }

  response = responsePg; // responseMongo;
  return response;
}
//= ;
// databaseReadWithReadCredentials(documentName, collectionName = "metaforecastCollection", databaseName = "metaforecastDatabase")
