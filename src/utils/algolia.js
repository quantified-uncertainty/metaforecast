import algoliasearch from 'algoliasearch';
import fs from "fs"

import { mongoReadWithReadCredentials } from "./mongo-wrapper.js"

const client = algoliasearch('96UD3NTQ7L', process.env.ALGOLIA_MASTER_API_KEY); // delete this when committing
const index = client.initIndex('metaforecast');

export async function rebuildAlgoliaDatabase(){
  let records = await mongoReadWithReadCredentials("metaforecasts")
  // let string = JSON.stringify(json, null, 2)
  // fs.writeFileSync('metaforecasts.json', string);
  records = records.map(record => ({...record, has_numforecasts: record.has_numforecasts ? true : false}) )
  // this is necessary to filter by missing attributes https://www.algolia.com/doc/guides/managing-results/refine-results/filtering/how-to/filter-by-null-or-missing-attributes/

  await index.clearObjects()
  index.saveObjects(records, { autoGenerateObjectIDIfNotExist: true }).then(() => 
    console.log("algolia search: done")
  ).catch(error => {
    console.log("algolia search: error", error)
  })
}
// main()
