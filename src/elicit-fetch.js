/* Imports */
import fs from "fs"
import axios from "axios"
import Papa from "papaparse"
import open from "open"
import readline from "readline"
import { calculateStars } from "./stars.js"

/* Definitions */
let elicitEndpoint = "https://elicit.org/api/v1/binary-questions/csv?binaryQuestions.resolved=false&binaryQuestions.search=&binaryQuestions.sortBy=popularity&predictors=community"

/* Support functions */
let avg = (array) => array.reduce((a, b) => Number(a) + Number(b)) / array.length;
let unique = arr => [...new Set(arr)]
let sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function processArray(arrayQuestions) {
  let questions = arrayQuestions.map(question => question.questionTitle)
  let uniqueQuestions = unique(questions)
  let questionsObj = ({})
  uniqueQuestions.forEach((questionTitle) => {

    questionsObj[questionTitle] = {
      title: questionTitle,
      forecasters: [],
      forecasts: []
    }
  })
  arrayQuestions.forEach(question => {
    // console.log(question.questionTitle)
    let questionTitle = question.questionTitle
    let correspondingQuestion = questionsObj[questionTitle]
    let forecasters = (correspondingQuestion.forecasters).concat(question.predictionCreator)
    let forecasts = (correspondingQuestion.forecasts).concat(question.prediction)
    questionsObj[questionTitle] = {
      forecasters,
      forecasts
    }
  })
  let onlyQuestionsWithMoreThan

  let results = []
  for (let question in questionsObj) {
    let title = question

    let forecasters = questionsObj[question].forecasters

    let numforecasters = (unique(forecasters)).length
    if (numforecasters >= 10) {
      let url = `https://elicit.org/binary?binaryQuestions.search=${title.replace(/ /g, "%20")}&binaryQuestions.sortBy=popularity&limit=20&offset=0`
      let forecasts = questionsObj[question].forecasts

      //console.log(forecasts)
      //console.log(avg(forecasts))
      let probability = avg(forecasts) / 100
      let numforecasts = forecasts.length;
      let standardObj = ({
        "title": title,
        "url": url,
        "platform": "Elicit",
        "options": [
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
        ],
        "numforecasts": numforecasts,
        "numforecasters": numforecasters,
        "stars": calculateStars("Elicit", ({}))
      })
      results.push(standardObj)
    }

  }
  let string = JSON.stringify(results, null, 2)
  fs.writeFileSync('./data/elicit-questions.json', string);
  console.log("Done")
}

async function awaitdownloadconfirmation(message, callback) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question(message, (answer) => {
    //console.log("Received");
    rl.close();

    callback()
  });

}


/* Body */
let filePath = "./data/elicit-binary_export.csv"

export async function elicit() {
  let csvContent = await axios.get(elicitEndpoint)
    .then(query => query.data)
  await Papa.parse(csvContent, {
    header: true,
    complete: results => {
      console.log('Downloaded', results.data.length, 'records.');
      //resolve(results.data);
      //console.log(results.data)
      processArray(results.data)
    }
  });
}
//elicit()
