/* Imports */
import fs from 'fs'
import readline from "readline"

import { platformFetchers } from "./platforms/all-platforms.js"
import { mergeEverything } from "./flow/mergeEverything.js"
import { updateHistory } from "./flow/history/updateHistory.js"
import { rebuildAlgoliaDatabase } from "./utils/algolia.js"
import { rebuildNetlifySiteWithNewData } from "./flow/rebuildNetliftySiteWithNewData.js"
import { pgInitialize } from "./database/pg-wrapper.js"
import { doEverything, tryCatchTryAgain } from "./flow/doEverything.js"

/* Support functions */
let functions = [...platformFetchers, mergeEverything, updateHistory, rebuildAlgoliaDatabase, pgInitialize, rebuildNetlifySiteWithNewData, doEverything]
let functionNames = functions.map(fun => fun.name)

let whattodoMessage = functionNames
	.slice(0, platformFetchers.length)
	.map((functionName, i) => `[${i}]: Download predictions from ${functionName}`)
	.join('\n') +
	`\n[${functionNames.length - 6}]: Merge jsons them into one big json (and push it to mongodb database)` +
	`\n[${functionNames.length - 5}]: Update history` +
	`\n[${functionNames.length - 4}]: Rebuild algolia database ("index")` +
	`\n[${functionNames.length - 3}]: Rebuild postgres database` +
	`\n[${functionNames.length - 2}]: Rebuild netlify site with new data` +
	// `\n[${functionNames.length-1}]: Add to history` +
	`\n[${functionNames.length - 1}]: All of the above` +
	`\nChoose one option, wisely: #`

/* BODY */
let commandLineUtility = async () => {
	let whattodo = async (message, callback) => {
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});
		rl.question(message, async (answer) => {
			rl.close();
			await callback(answer)
		});
	}

	let executeoption = async (option) => {
		option = Number(option)
		//console.log(functionNames[option])
		if (option < 0) {
			console.log(`Error, ${option} < 0 or ${option} < 0`)
		} else if (option < functions.length) {
			await tryCatchTryAgain(functions[option])
		}
	}

	if (process.argv.length == 3) {
		const option = process.argv[2] // e.g., npm start 15 <-
		const optionNum = Number(option)
		if (!isNaN(optionNum)) {
			await executeoption(optionNum)
		} else if (option == "all") {
			await executeoption(functions.length - 1) // 15 = execute all fetchers
		} else {
			await whattodo(whattodoMessage, executeoption)
		}
	} else (
		await whattodo(whattodoMessage, executeoption)
	)
}

// console.log("1")
// console.log(process.argv)
commandLineUtility()
// doEverything()
