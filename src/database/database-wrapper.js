import { mongoUpsert, mongoRead, mongoReadWithReadCredentials, mongoGetAllElements } from "./mongo-wrapper.js"
import { pgUpsert } from "./pg-wrapper.js"

export async function databaseUpsert({ contents, group }) {
    // (contents, documentName, collectionName = "metaforecastCollection", databaseName = "metaforecastDatabase"){
    let mongoDocName;
    switch (group) {
        case 'combined':
            mongoDocName = "metaforecasts"
            await mongoUpsert(contents, mongoDocName, "metaforecastCollection", "metaforecastDatabase")
            await pgUpsert({contents, schema: "latest", tableName: "combined"})
            break;
        case 'history':
            let currentDate = new Date()
            let dateUpToMonth = currentDate.toISOString().slice(0, 7).replace("-", "_")
            mongoDocName = `metaforecast_history_${dateUpToMonth}`
            await mongoUpsert(data, mongoDocName, "metaforecastHistory", "metaforecastDatabase")
            await pgUpsert({contents, schema: "history", tableName: "combined"})
            break;
        default:
            mongoDocName = `${group}-questions`
            await mongoUpsert(contents, mongoDocName, "metaforecastCollection", "metaforecastDatabase")
            await pgUpsert({contents, schema: "latest", tableName: group})
    }

}
// databaseUpsert(contents, documentName, collectionName = "metaforecastCollection", databaseName = "metaforecastDatabase")

export const databaseRead = mongoRead;
// databaseRead(documentName, collectionName = "metaforecastCollection", databaseName = "metaforecastDatabase")

export const databaseReadWithReadCredentials = mongoReadWithReadCredentials;
// databaseReadWithReadCredentials(documentName, collectionName = "metaforecastCollection", databaseName = "metaforecastDatabase")

export const databaseGetAllElements = mongoGetAllElements;
// databaseGetAllElements(databaseName = "metaforecastDatabase", collectionName = "metaforecastCollection")