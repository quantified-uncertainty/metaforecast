import algoliasearch from "algoliasearch";

import { pgRead } from "../database/pg-wrapper";
import { platforms } from "../platforms";

let cookie = process.env.ALGOLIA_MASTER_API_KEY;
const algoliaAppId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const client = algoliasearch(algoliaAppId, cookie);
const index = client.initIndex("metaforecast");

let getoptionsstringforsearch = (record: any) => {
  let result = "";
  if (!!record.options && record.options.length > 0) {
    result = record.options
      .map((option: any) => option.name || null)
      .filter((x: any) => x != null)
      .join(", ");
  }
  return result;
};

export async function rebuildAlgoliaDatabaseTheEasyWay() {
  let records: any[] = await pgRead({
    tableName: "questions",
  });

  const platformNameToLabel = Object.fromEntries(
    platforms.map((platform) => [platform.name, platform.label])
  );

  records = records.map((record, index: number) => ({
    ...record,
    platformLabel: platformNameToLabel[record.platform] || record.platform,
    has_numforecasts: record.numforecasts ? true : false,
    objectID: index,
    optionsstringforsearch: getoptionsstringforsearch(record),
  }));
  // this is necessary to filter by missing attributes https://www.algolia.com/doc/guides/managing-results/refine-results/filtering/how-to/filter-by-null-or-missing-attributes/

  if (index.exists()) {
    console.log("Index exists");
    await index.replaceAllObjects(records, { safe: true });
    console.log(
      `Pushed ${records.length} records. Algolia will update asynchronously`
    );
  }
}

export const rebuildAlgoliaDatabase = rebuildAlgoliaDatabaseTheEasyWay;
