/* Imports */
import fs from "fs"
import axios from "axios"
import Papa from "papaparse"
import open from "open"
import readline from "readline"
import {calculateStars} from "../utils/stars.js"
import {upsert} from "../utils/mongo-wrapper.js"

/* Definitions */
let coupCastEndpoint = "https://www.oneearthfuture.org/sites/all/themes/stability/stability_sub/data/dashboard_2021_code_06.csv"
var datenow = new Date(); 
var currentmonth = datenow.getMonth() + 1; 
dd
/* Support functions */
let unique = arr => [...new Set(arr)]
let sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let sanitizeCountryName = (country_name) => {
  let sanitized_name
  switch(country_name) {
    case "Cen African Rep":
      sanitized_name = "Central African Republic"
      break;
    case "Congo-Brz":
      sanitized_name = "Republic of the Congo"
      break;
    case "Congo/Zaire":
      sanitized_name = "Democratic Republic of the Congo"
      break;
    case "Czech Rep":
      sanitized_name = "Czech Republic"
      break;
    case "Dominican Rep":
      sanitized_name = "Dominican Republic"
      break;
    case "Korea North":
      sanitized_name = "North Korea"
      break;
    case "Korea South":
      sanitized_name = "South Korea"
      break;
    case "UKG":
      sanitized_name = "UK"
      break;
    default:
      sanitized_name = country_name
  }
  return sanitized_name
}


async function processArray(countryArray) {
  let results = []
  for (let country of countryArray) {
    let url = `https://www.oneearthfuture.org/activities/coup-cast`

    // We don't really want the prediction for all months; one is enough
    // console.log(country.month)
    if(Number(country.month) == currentmonth){
      // Monthly
      country.country_name = sanitizeCountryName(country.country_name)
      let processedPrediction1 = ({
        "title": `Will there be a coup in ${country.country_name} in the next month (as of ${country.month}/${country.year})?`,
        "url": url,
        "platform": "CoupCast",
        "description": `The current leader of ${country.country_name} is ${country.leader_name}, who has been in power for ${Number(country.leader_years).toFixed(1)} years.  ${country.country_name} has a ${(country.regime_type).toLowerCase()} regime type which has lasted for ${country.regime_years} years.`,
        "options": [
          {
            "name": "Yes",
            "probability": country.month_risk,
            "type": "PROBABILITY"
          },
          {
            "name": "No",
            "probability": 1 - country.month_risk,
            "type": "PROBABILITY"
          }
        ],
        "timestamp": new Date().toISOString(),
        "qualityindicators": {
          "stars": calculateStars("Coupcast", ({}))
        },
        "extra": {
          "country_name": country.country_name,
          "regime_type": country.regime_type,
          "month": country.month,
          "year": country.year,
          "leader_name": country.leader_name,
          "month_risk": country.month_risk,
          "annual_risk": country.annual_risk,
          "risk_change_percent": country.risk_change_percent,
          "regime_years": country.regime_years,
          "leader_years": country.leader_years,
          "country_code": country.country_code,
          "country_abb": country.country_abb
        }
      })
      
      // Yearly
      let processedPrediction2 = ({
        "title": `Will there be a coup in ${country.country_name} in the next year (as of ${country.month}/${country.year})?`,
        "url": url,
        "platform": "CoupCast",
        "description": `The current leader of ${country.country_name} is ${country.leader_name}, who has been in power for ${Number(country.leader_years).toFixed(1)} years. ${country.country_name} has a ${(country.regime_type).toLowerCase()} regime type which has lasted for ${country.regime_years} years`,
        "options": [
          {
            "name": "Yes",
            "probability": country.annual_risk,
            "type": "PROBABILITY"
          },
          {
            "name": "No",
            "probability": 1 - country.annual_risk,
            "type": "PROBABILITY"
          }
        ],
        "timestamp": new Date().toISOString(),
        "qualityindicators": {
          "stars": calculateStars("CoupCast", ({}))
        },
        "extra": {
          "country_name": country.country_name,
          "regime_type": country.regime_type,
          "month": country.month,
          "year": country.year,
          "leader_name": country.leader_name,
          "month_risk": country.month_risk,
          "annual_risk": country.annual_risk,
          "risk_change_percent": country.risk_change_percent,
          "regime_years": country.regime_years,
          "leader_years": country.leader_years,
          "country_code": country.country_code,
          "country_abb": country.country_abb
        }
      })

      // results.push(processedPrediction1)
      // Not pushing monthly 
      results.push(processedPrediction2)
    }
  }
  // let string = JSON.stringify(results, null, 2)
  // fs.writeFileSync('./data/elicit-questions.json', string);
  await upsert(results, "coupcast-questions")
  // console.log(results)
  console.log("Done")
}

/* Body */
let filePath = "./data/coupcast-raw-download.csv" // not used right now.

export async function coupcast() {
  let csvContent = await axios.get(coupCastEndpoint)
    .then(query => query.data)
  await Papa.parse(csvContent, {
    header: true,
    complete: async (results) => {
      console.log('Downloaded', results.data.length, 'records.');
      /* console.log(
        JSON.stringify(
          unique(results.data.map(country => country.country_name)),
          null, 
          4
        )
      )*/
      // console.log(results.data)
      await processArray(results.data)
    }
  });
  await sleep(1000) // needed to wait for Papaparse's callback to be executed. 
}
// coupcast()
