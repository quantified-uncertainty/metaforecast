/* Imports */
import fs from "fs"
import Papa from "papaparse"
import open from "open"
import readline from "readline"

/* Definitions */
let downloadurl = 'https://elicit.org/binary?binaryQuestion&binaryQuestions.sortBy=popularity&limit=20&offset=0&predictors=community'

/* Support functions */
let avg = (array) => array.reduce((a, b) => Number(a) + Number(b)) / array.length;
let unique = arr => [...new Set(arr)]
let sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function processArray(arrayQuestions){
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
  for(let question in questionsObj){
    let title = question

    let forecasters = questionsObj[question].forecasters

    let numforecasters = (unique(forecasters)).length
    if(numforecasters >= 10){
      let url = `https://elicit.org/binary?binaryQuestions.search=${title.replace(" ", "%20")}&binaryQuestions.sortBy=popularity&limit=20&offset=0`
      let forecasts = questionsObj[question].forecasts

      //console.log(forecasts)
      //console.log(avg(forecasts))
      let percentage = avg(forecasts)
      let numforecasts = forecasts.length;
      let standardObj = ({
        "Title": title,
        "URL": url,
        "Platform": "Elicit",
        "Binary question?": true,
        "Percentage": percentage.toFixed(2) + "%",
        "# Forecasts": numforecasts,
        "# Forecasters": numforecasters
      })
      results.push(standardObj)
    }

  }
  let string = JSON.stringify(results,null,  2)
  fs.writeFileSync('./data/elicit-questions.json', string);
  console.log("Done")
}

async function awaitdownloadconfirmation(message,callback){
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

export async function elicit(){
  console.log('A browser tab will open. Please download the csv to /data/elicit-binary_export.csv by clicking on "Download CSV"')
  await sleep(3000)
  await open(downloadurl);
  await awaitdownloadconfirmation('Press enter when you have downloaded the csv to /data/elicit-binary_export.csv',async () => {
    let csvFile = fs.readFileSync(filePath, {encoding: 'utf8'})
    let csvData = csvFile.toString(csvFile)  
    //console.log(csvData)
    await Papa.parse(csvData, {
        header: true,
        complete: results => {
          console.log('Downloaded', results.data.length, 'records.'); 
          //resolve(results.data);
          //console.log(results.data)
          processArray(results.data)
        }
      });
  })
}
//elicit()
