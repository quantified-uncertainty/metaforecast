import algoliasearch from 'algoliasearch';
import fs from "fs"
import {getCookie} from "./getCookies.js"
import { databaseReadWithReadCredentials } from "../database/database-wrapper.js"
import { mergeEverythingInner } from '../flow/mergeEverything.js';

let cookie = process.env.ALGOLIA_MASTER_API_KEY || getCookie("algolia")
const client = algoliasearch('96UD3NTQ7L', cookie); 
const index = client.initIndex('metaforecast');


export async function rebuildAlgoliaDatabaseTheHardWay(){
  console.log("Doing this the hard way")
  let records = await mergeEverythingInner()
  records = records.map((record, index) => ({...record, has_numforecasts: record.numforecasts ? true : false, objectID: index}) )
  // this is necessary to filter by missing attributes https://www.algolia.com/doc/guides/managing-results/refine-results/filtering/how-to/filter-by-null-or-missing-attributes/  
  
  if(index.exists()){
    console.log("Index exists")
    index.replaceAllObjects(records, { safe:true }).catch(error => console.log(error))
    console.log(`Pushed ${records.length} records. Algolia will update asynchronously`)
  }
}

export async function rebuildAlgoliaDatabaseTheEasyWay(){
  let records = await databaseReadWithReadCredentials("metaforecasts")
  records = records.map((record, index) => ({...record, has_numforecasts: record.numforecasts ? true : false, objectID: index}) )
  // this is necessary to filter by missing attributes https://www.algolia.com/doc/guides/managing-results/refine-results/filtering/how-to/filter-by-null-or-missing-attributes/  
  
  if(index.exists()){
    console.log("Index exists")
    index.replaceAllObjects(records, { safe:true }).catch(error => console.log(error))
    console.log(`Pushed ${records.length} records. Algolia will update asynchronously`)
  }
}

export const rebuildAlgoliaDatabase = rebuildAlgoliaDatabaseTheEasyWay//rebuildAlgoliaDatabaseTheHardWay