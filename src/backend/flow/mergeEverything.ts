import { pgRead, pgUpsert } from "../database/pg-wrapper";
import { platforms } from "../platforms";

/* Merge everything */

export async function mergeEverythingInner() {
  let merged = [];
  for (let platform of platforms) {
    const platformName = platform.name;
    let json = await pgRead({ tableName: platformName });
    console.log(`${platformName} has ${json.length} questions\n`);
    merged = merged.concat(json);
  }
  let mergedprocessed = merged.map((element) => ({
    ...element,
    optionsstringforsearch: element.options
      .map((option) => option.name)
      .join(", "),
  }));
  console.log(`In total, there are ${mergedprocessed.length} questions`);
  return mergedprocessed;
}

export async function mergeEverything() {
  let merged = await mergeEverythingInner();
  await pgUpsert({ contents: merged, tableName: "combined" });
  console.log("Done");
}
