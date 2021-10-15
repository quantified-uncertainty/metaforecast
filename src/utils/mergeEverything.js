import { mongoRead, upsert } from "./mongo-wrapper.js"

/* Merge everything */
let sets = ["astralcodexten", "betfair", "coupcast", "csetforetell", "elicit", /* "estimize" ,*/ "fantasyscotus", "foretold", "givewellopenphil", "goodjudgment","goodjudmentopen", "hypermind", "kalshi", "ladbrokes", "metaculus", "omen", "polymarket", "predictit", "rootclaim", "smarkets", "wildeford", "williamhill", "xrisk"]
let suffix = "-questions"

export async function mergeEverythingInner(){
  let merged = []
  for(let set of sets){
    let json = await mongoRead(set+suffix)
    console.log(`${set} has ${json.length} questions`)
    merged = merged.concat(json)
  }
  let mergedprocessed = merged.map(element => ({...element, optionsstringforsearch: element.options.map(option => option.name).join(", ")}))
  console.log(`In total, there are ${mergedprocessed.length} questions`)
  return mergedprocessed
}

export async function mergeEverything(){
  let merged = await mergeEverythingInner()
  await upsert( merged,"metaforecasts")
  console.log("Done")
}
