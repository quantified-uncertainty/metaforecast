import { mongoRead, upsert } from "./mongo-wrapper.js"

/* Merge everything */
let sets = ["csetforetell", "elicit", "estimize", "fantasyscotus", "foretold", "givewellopenphil", "goodjudgment","goodjudmentopen", "hypermind", "ladbrokes", "metaculus", "polymarket", "predictit", "omen", "smarkets", "williamhill", "xrisk"]
let suffix = "-questions"

export async function mergeEverything(){
    let merged = []
    for(let set of sets){
      let json = await mongoRead(set+suffix)
      merged = merged.concat(json)
    }
    let mergedprocessed = merged.map(element => ({...element, optionsstringforsearch: element.options.map(option => option.name).join(", ")}))
    await upsert( mergedprocessed,"metaforecasts")
    console.log("Done")
  }
  
