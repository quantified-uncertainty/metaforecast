import {csetforetell} from "../platforms/csetforetell-fetch.js"
import {elicit} from "../platforms/elicit-fetch.js"
import {estimize} from "../platforms/estimize-fetch.js"
import {fantasyscotus} from "../platforms/fantasyscotus-fetch.js"
import {foretold} from "../platforms/foretold-fetch.js"
import {goodjudgment} from "../platforms/goodjudgment-fetch.js"
import {goodjudgmentopen} from "../platforms/goodjudmentopen-fetch.js"
import {hypermind} from "../platforms/hypermind-fetch.js"
import {ladbrokes} from "../platforms/ladbrokes-fetch.js"
import {metaculus} from "../platforms/metaculus-fetch.js"
import {polymarket} from "../platforms/polymarket-fetch.js"
import {predictit} from "../platforms/predictit-fetch.js"
import {omen} from "../platforms/omen-fetch.js"
import {smarkets} from "../platforms/smarkets-fetch.js"
import {williamhill} from "../platforms/williamhill-fetch.js"
import {mergeEverything} from "./mergeEverything.js"
import {rebuildNetlifySiteWithNewData} from "./rebuildNetliftySiteWithNewData.js"

/* Do everything */

export async function tryCatchTryAgain (fun) {
    try{
        console.log("Initial try")
        await fun()
    }catch (error) {
        console.log("Second try")
        console.log(error)
        try{
            await fun()
        }catch (error){
            console.log(error)
        }
    }
}
export async function doEverything(){
    let functions = [csetforetell, elicit, /* estimize, */ fantasyscotus,  foretold, goodjudgment, goodjudgmentopen, hypermind, ladbrokes, metaculus, polymarket, predictit, omen, smarkets, williamhill, mergeEverything, rebuildNetlifySiteWithNewData]

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

    for(let fun of functions){
        console.log("")
        console.log("")
        console.log("****************************")
        console.log(fun.name)
        console.log("****************************")
        await tryCatchTryAgain(fun)
        console.log("****************************")
    }
}