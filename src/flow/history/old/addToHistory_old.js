import { writeFileSync } from "fs"
import { mongoReadWithReadCredentials, upsert } from "../mongo-wrapper.js"
let mongoRead = mongoReadWithReadCredentials
let isEmptyArray = arr => arr.length == 0

export async function addToHistory(){
  // throw new Error("Not today")
  let currentJSON = await mongoRead("metaforecasts")
  // console.log(currentJSON)
  let historyJSON = await mongoRead("metaforecast_history")
  // console.log(historyJSON)

  let currentForecastsWithAHistory = currentJSON.filter(element => !isEmptyArray(historyJSON.filter(historyElement => historyElement.title == element.title && historyElement.url == element.url )))
  // console.log(currentForecastsWithAHistory)

  let currentForecastsWithoutAHistory = currentJSON.filter(element => isEmptyArray(historyJSON.filter(historyElement => historyElement.title == element.title && historyElement.url == element.url )))
  // console.log(currentForecastsWithoutAHistory)
  
  // Add both types of forecast
  let newHistoryJSON = []
  for(let historyElement of historyJSON){
    let correspondingNewElementArray = currentForecastsWithAHistory.filter(element => historyElement.title == element.title && historyElement.url == element.url )
    // console.log(correspondingNewElement)
    if(!isEmptyArray(correspondingNewElementArray)){
      let correspondingNewElement = correspondingNewElementArray[0]
      let timeStampOfNewElement = correspondingNewElement.timestamp
      let doesHistoryAlreadyContainElement = historyElement.history.map(element => element.timestamp).includes(timeStampOfNewElement)
      if(!doesHistoryAlreadyContainElement){
          let historyWithNewElement = historyElement["history"].concat({
              "timestamp": correspondingNewElement.timestamp,
              "options": correspondingNewElement.options,
              "qualityindicators": correspondingNewElement.qualityindicators
            })
          let newHistoryElement = {...correspondingNewElement, "history": historyWithNewElement}
            // If some element (like the description) changes, we keep the new one.
          newHistoryJSON.push(newHistoryElement)
      }else{
          newHistoryJSON.push(historyElement)
      }
    }else{
      // console.log(historyElement)
      newHistoryJSON.push(historyElement)
    }
  }

  for(let currentForecast of currentForecastsWithoutAHistory){
    let newHistoryElement = ({...currentForecast, "history": [{
      "timestamp": currentForecast.timestamp,
      "options": currentForecast.options,
      "qualityindicators": currentForecast.qualityindicators
    }]})
    delete newHistoryElement.timestamp
    delete newHistoryElement.options
    delete newHistoryElement.qualityindicators
    newHistoryJSON.push(newHistoryElement)
  }

  upsert(newHistoryJSON, "metaforecast_history")
  // console.log(newHistoryJSON.slice(0,5))
  // writeFileSync("metaforecast_history.json", JSON.stringify(newHistoryJSON, null, 2))
  // writefile(JSON.stringify(newHistoryJSON, null, 2), "metaforecasts_history", "", ".json")
  //console.log(newHistoryJSON)
  /*
  let forecastsAlreadyInHistory = currentJSON.filter(element => !isEmptyArray(historyJSON.filter(historyElement => historyElement.title == element.title && historyElement.url == element.url )))
  */
  console.log(new Date().toISOString())
}
// addToHistory()
