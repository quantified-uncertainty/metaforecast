
import { mergeEverything } from "./mergeEverything.js"
import { updateHistory } from "./history/updateHistory.js"
import { rebuildAlgoliaDatabase } from "./algolia.js"
import { rebuildNetlifySiteWithNewData } from "./rebuildNetliftySiteWithNewData.js"
import { platformFetchers } from "./platforms.js"

/* Do everything */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function tryCatchTryAgain(fun) {
    try {
        console.log("Initial try")
        await fun()
    } catch (error) {
        sleep(10000)
        console.log("Second try")
        console.log(error)
        try {
            await fun()
        } catch (error) {
            console.log(error)
        }
    }
}

export async function doEverything() {
    let functions = [...platformFetchers, mergeEverything, updateHistory, rebuildAlgoliaDatabase, rebuildNetlifySiteWithNewData]
    // Removed Good Judgment from the fetcher, doing it using cron instead because cloudflare blocks the utility on heroku.

    console.log("")
    console.log("")
    console.log("")
    console.log("")
    console.log("================================")
    console.log("STARTING UP")
    console.log("================================")
    console.log("")
    console.log("")
    console.log("")
    console.log("")

    for (let fun of functions) {
        console.log("")
        console.log("")
        console.log("****************************")
        console.log(fun.name)
        console.log("****************************")
        await tryCatchTryAgain(fun)
        console.log("****************************")
    }
}
