import {mongoUpsert, mongoRead, mongoReadWithReadCredentials, mongoGetAllElements} from "./mongo-wrapper.js"

export const databaseUpsert = mongoUpsert; 
// databaseUpsert(contents, documentName, collectionName = "metaforecastCollection", databaseName = "metaforecastDatabase")

export const databaseRead = mongoRead;
// databaseRead(documentName, collectionName = "metaforecastCollection", databaseName = "metaforecastDatabase")

export const databaseReadWithReadCredentials = mongoReadWithReadCredentials;
// databaseReadWithReadCredentials(documentName, collectionName = "metaforecastCollection", databaseName = "metaforecastDatabase")

export const databaseGetAllElements = mongoGetAllElements;
// databaseGetAllElements(databaseName = "metaforecastDatabase", collectionName = "metaforecastCollection")