import { astralcodexten } from "../platforms/astralcodexten-fetch.js"
import { betfair } from "../platforms/betfair-fetch.js"
import { coupcast } from "../platforms/coupcast-fetch.js"
import { csetforetell } from "../platforms/csetforetell-fetch.js"
import { elicit } from "../platforms/elicit-fetch.js"
import { estimize } from "../platforms/estimize-fetch.js"
import { fantasyscotus } from "../platforms/fantasyscotus-fetch.js"
import { foretold } from "../platforms/foretold-fetch.js"
import { goodjudgment } from "../platforms/goodjudgment-fetch.js"
import { goodjudgmentopen } from "../platforms/goodjudmentopen-fetch.js"
import { hypermind } from "../platforms/hypermind-fetch.js"
import { kalshi } from "../platforms/kalshi-fetch.js"
import { ladbrokes } from "../platforms/ladbrokes-fetch.js"
import { manifoldmarkets } from "../platforms/manifoldmarkets-fetch.js"
import { metaculus } from "../platforms/metaculus-fetch.js"
import { omen } from "../platforms/omen-fetch.js"
import { polymarket } from "../platforms/polymarket-fetch.js"
import { predictit } from "../platforms/predictit-fetch.js"
import { rootclaim } from "../platforms/rootclaim-fetch.js"
import { smarkets } from "../platforms/smarkets-fetch.js"
import { wildeford } from "../platforms/wildeford-fetch.js"
import { williamhill } from "../platforms/williamhill-fetch.js"
import { mergeEverything } from "./mergeEverything.js"
import { updateHistory } from "./history/updateHistory.js"
import { rebuildAlgoliaDatabase } from "./algolia.js"
import { rebuildNetlifySiteWithNewData } from "./rebuildNetliftySiteWithNewData.js"

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
    let functions = [betfair, coupcast, csetforetell, elicit, /* estimize, */ fantasyscotus, foretold, /* goodjudgment, */ goodjudgmentopen, hypermind, ladbrokes, kalshi, manifoldmarkets, metaculus, omen, polymarket, predictit, rootclaim, smarkets, wildeford, williamhill, mergeEverything, updateHistory, rebuildAlgoliaDatabase, rebuildNetlifySiteWithNewData]
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
