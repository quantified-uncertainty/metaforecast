/* Imports */
import fs from 'fs'
// import axios from "axios"
import { GoogleSpreadsheet } from "google-spreadsheet"
import {getCookie, applyIfCookieExists} from "../utils/getCookies.js"
import toMarkdown from "../utils/toMarkdown.js"
import { calculateStars } from "../utils/stars.js"
import {upsert} from "../utils/mongo-wrapper.js"

/* Definitions */
const SHEET_ID = "1xcgYF7Q0D95TPHLLSgwhWBHFrWZUGJn7yTyAhDR4vi0" // spreadsheet key is the long id in the sheets URL
const endpoint = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit#gid=0`
// https://docs.google.com/spreadsheets/d/1xcgYF7Q0D95TPHLLSgwhWBHFrWZUGJn7yTyAhDR4vi0/edit#gid=0&range=C4

/* Support functions */

const formatRow = row => {
	let colNames = ["Prediction Date", "Prediction", "Odds", "Actual", "Resolution Date", "Prediction Right?", "Brier Score", "Notes"]
	let result = ({})
	row.forEach((col,i) => {
		result[colNames[i]] = col
	})
	return result
}

async function fetchGoogleDoc(google_api_key){
	// https://gist.github.com/micalevisk/9bc831bd4b3e5a3f62b9810330129c59
	let results = []
	const doc = new GoogleSpreadsheet(SHEET_ID)
	doc.useApiKey(google_api_key)

	await doc.loadInfo() // loads document properties and worksheets
	console.log('>>', doc.title)

	const sheet = doc.sheetsByIndex[0]
	const rows = await sheet.getRows({ offset:0, })

	console.log('# ' +
		rows[0]._sheet.headerValues.join(',')
	)
	let isEnd = false;
	for (let i in rows) {
		let data = rows[i]._rawData
		if(data.length == 0) isEnd = true;
		if(!isEnd){
			let result = ({...formatRow(data), "url": endpoint + `&range=A${(Number(i) + 2)}`})
			// +2: +1 for the header row, +1 for starting at 1 and not at 0.
			// console.log(result)
			results.push(result)

			// console.log(rows[i])
			// console.log(rows[i]._rawData)
			// console.log(rows[i]["Prediction"])
		}
		// console.log(row._rawData.join(','))
		// console.log(row._rawData.join(','))
	}
	// console.log(results)
	return(results)
}

async function processPredictions(predictions){
	let currentPredictions = predictions.filter(prediction => prediction["Actual"] == "Unknown" )
	let results = currentPredictions.map(prediction => {
		let probability = Number(prediction["Odds"].replace("%", ""))/100
		let options = [
			{
				"name": "Yes",
				"probability": probability,
				"type": "PROBABILITY"
			},
			{
				"name": "No",
				"probability": 1 - probability,
				"type": "PROBABILITY"
			}
		]
		let result = ({
			"title": prediction["Prediction"],
			"url": prediction["url"],
			"platform": "Peter Wildeford",
			"description": prediction["Notes"] || "",
			"options": options,
			"timestamp": new Date(Date.parse(prediction["Prediction Date"] + "Z")).toISOString(),
			"qualityindicators": {
				"stars": calculateStars("Peter Wildeford"),
			}
		})
		return result
	})
	results = results.map(result => ({...result, title: result.title.replace(" [update]", "")})).reverse()

	let uniqueTitles = []
	let uniqueResults = []
	results.forEach(result => {
		if(!uniqueTitles.includes(result.title)) uniqueResults.push(result)
		uniqueTitles.push(result.title)
	})
	return(uniqueResults)
	// console.log(results)
	// console.log(results.map(result => result.options))
}
// processPredictions()

/* Body */
export async function wildeford_inner(google_api_key) {
	let predictions = await fetchGoogleDoc(google_api_key)
	let results = await processPredictions(predictions) // somehow needed
	// console.log(results)
	// let string = JSON.stringify(results, null, 2)
	// fs.writeFileSync('polyprediction-questions.json', string);
	await upsert(results, "wildeford-questions")
	console.log("Done")
}
//example()

export async function wildeford(){
	const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || getCookie("google-api") // See: https://developers.google.com/sheets/api/guides/authorizing#APIKey
	await applyIfCookieExists(GOOGLE_API_KEY, wildeford_inner)
}

