/*
import {MongoClient} from 'mongodb';
// import pkg from 'mongodb';
// const {MongoClient} = pkg;

async function mongoRead (documentName, collectionName="metaforecastCollection", databaseName="metaforecastDatabase"){
  const url = "mongodb+srv://metaforecast-frontend:hJr5c9kDhbutBtF1@metaforecastdatabaseclu.wgk8a.mongodb.net/?retryWrites=true&w=majority&useNewUrlParser=true&useUnifiedTopology=true"; // This user only has read permissions, so I'm not excessively worried, and would even be pleased, if someone read this and decided to do something cool with the database.

  const client = new MongoClient(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  let documentContents
  try {
      await client.connect();
      // console.log(`Connected correctly to server to read ${documentName}`);
      const db = client.db(databaseName);
  
      // Use the collection "data"
      const collection = db.collection(collectionName);
  
      // Search options
      const query = { "name": documentName };
      const options = {
        // sort matched documents in descending order by rating
        sort: { rating: -1 },
      };
  
      // Insert a single document, wait for promise so we can read it back
      // const p = await collection.insertOne(metaforecastDocument);
      const document = await collection.findOne(query, options);
      documentContents = document.contentsArray
    } catch (err) {
      console.log(err.stack);
    }
    finally {
      await client.close();
    }
    // console.log(documentContents.slice(0,10));
    return documentContents
}

export async function getForecasts() {
  const mongodbDocument = await mongoRead("metaforecasts")
  // console.log(mongodbDocument)
  return mongodbDocument
}

// getForecasts()

//---------------------------------------//

//- Previous methods: Graphql -//
import { GraphQLClient } from "graphql-request";
// import { request } from 'graphql-request'

const graphcms = new GraphQLClient(
  "https://api.baseql.com/airtable/graphql/apptDvDsHzSDEDARC"
);

export async function getForecasts0() {
  return await graphcms.request(
    `
        query {
            metaforecasts{
              id
              title
              url
              platform
              binaryQuestion
              percentage
              forecasts
              description
              stars
            }
          }`
  );
}

//- Previous methods: Github JSON -//
import axios from "axios"

export async function getForecasts1() {
  const { data } = await axios.get(`https://raw.githubusercontent.com/QURIresearch/metaforecasts/master/data/metaforecasts.json?ver=${Math.random().toFixed(10)}`) // this is, for now, a hack
  //console.log(data)
  return data
}

*/
