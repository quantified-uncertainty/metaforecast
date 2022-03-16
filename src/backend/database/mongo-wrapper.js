import pkg from "mongodb";
import { getSecret } from "../utils/getSecrets.js";
import { roughSizeOfObject } from "../utils/roughSize.js";
const { MongoClient } = pkg;

export async function mongoUpsert(
  contents,
  documentName,
  collectionName = "metaforecastCollection",
  databaseName = "metaforecastDatabase"
) {
  const url = process.env.MONGODB_URL || getSecret("mongodb");
  const client = new MongoClient(url);
  try {
    await client.connect();
    console.log("Connected correctly to server");
    const db = client.db(databaseName);

    // Use the collection "data"
    const collection = db.collection(collectionName);

    // Construct a document
    let document = {
      name: documentName,
      timestamp: new Date().toISOString(),
      contentsArray: contents,
    };

    // Create a filter
    const filter = { name: documentName };

    // Insert a single document, wait for promise so we can read it back
    // const p = await collection.insertOne(metaforecastDocument);
    await collection.replaceOne(filter, document, { upsert: true });
    console.log(
      `Pushed document ${documentName} in collection ${collectionName} in database ${databaseName} with approximate size ${roughSizeOfObject(
        document
      )} MB`
    );

    // Find one document
    const myDocument = await collection.findOne(filter);
    // Print to the console
    console.log(
      `Received document ${documentName} in collection ${collectionName} in database ${databaseName} with approximate size ${roughSizeOfObject(
        contents
      )} MB`
    );
    console.log("Sample: ");
    console.log(JSON.stringify(myDocument.contentsArray.slice(0, 1), null, 4));
  } catch (err) {
    console.log(err.stack);
  } finally {
    await client.close();
  }
}

export async function mongoRead(
  documentName,
  collectionName = "metaforecastCollection",
  databaseName = "metaforecastDatabase"
) {
  const url = process.env.MONGODB_URL || getSecret("mongodb");

  const client = new MongoClient(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  let documentContents = [];
  try {
    await client.connect();
    console.log(`Connected correctly to server to read ${documentName}`);
    const db = client.db(databaseName);

    // Use the collection "data"
    const collection = db.collection(collectionName);

    // Search options
    const query = { name: documentName };
    const options = {
      // sort matched documents in descending order by rating
      sort: { rating: -1 },
    };

    // Insert a single document, wait for promise so we can read it back
    // const p = await collection.insertOne(metaforecastDocument);
    const document = await collection.findOne(query, options);
    documentContents = document.contentsArray;
  } catch (err) {
    console.log(err.stack);
  } finally {
    await client.close();
  }
  console.log(documentContents.slice(0, 1));
  return documentContents;
}

export async function mongoReadWithReadCredentials(
  documentName,
  collectionName = "metaforecastCollection",
  databaseName = "metaforecastDatabase"
) {
  const url =
    "mongodb+srv://metaforecast-frontend:hJr5c9kDhbutBtF1@metaforecastdatabaseclu.wgk8a.mongodb.net/?retryWrites=true&w=majority&useNewUrlParser=true&useUnifiedTopology=true"; // This user only has read permissions, so I'm not excessively worried, and would even be pleased, if someone read this and decided to do something cool with the database.

  const client = new MongoClient(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  let documentContents;
  try {
    await client.connect();
    // console.log(`Connected correctly to server to read ${documentName}`);
    const db = client.db(databaseName);

    // Use the collection "data"
    const collection = db.collection(collectionName);

    // Search options
    const query = { name: documentName };
    const options = {
      // sort matched documents in descending order by rating
      sort: { rating: -1 },
    };

    // Insert a single document, wait for promise so we can read it back
    // const p = await collection.insertOne(metaforecastDocument);
    const document = await collection.findOne(query, options);
    documentContents = document.contentsArray;
  } catch (err) {
    console.log(err.stack);
  } finally {
    await client.close();
  }
  // console.log(documentContents.slice(0,1));
  return documentContents;
}

export async function mongoGetAllElements(
  databaseName = "metaforecastDatabase",
  collectionName = "metaforecastCollection"
) {
  const url = process.env.MONGODB_URL || getSecret("mongodb");
  const client = new MongoClient(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    console.log(`Connected correctly to server`);
    const db = client.db(databaseName);

    // Use the collection "data"
    const collection = db.collection(collectionName);

    // Search options
    const query = {};
    const options = {};

    // Insert a single document, wait for promise so we can read it back
    // const p = await collection.insertOne(metaforecastDocument);
    const documents = await collection.find().toArray();
    let documentNames = documents.map((document) => ({
      name: document.name,
      roughSizeMBs: roughSizeOfObject(document),
    }));
    console.log(documentNames);
  } catch (error) {
    console.log(error);
  } finally {
    await client.close();
  }
}
//mongoGetAllElements()
//mongoGetAllElements("metaforecastDatabase", "metaforecastHistory")
