import { mongoRead, upsert } from "./mongo-wrapper.js";
import { platformNames } from "./platforms.js"
/* Merge everything */
let suffix = "-questions";

export async function mergeEverythingInner() {
  let merged = [];
  for (let platformName of platformNames) {
    let json = await mongoRead(platformName + suffix);
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
  await upsert(merged, "metaforecasts");
  console.log("Done");
}
