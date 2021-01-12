/* Imports */
import fs from 'fs'
import axios from "axios"

/* Support functions */
async function fetchmarkets(){
  let response = await axios({
    method: 'get',
    url: 'https://www.predictit.org/api/marketdata/all/'

  })
  return response.data.markets
}


/* Body */
export async function predictit(){
  let response = await fetchmarkets()
  //console.log(response)
  let result = response.map(x=> {
    let isbinary = x.contracts.length == 1
    let output = ({
      Title: x["name"],
      URL: x.url,
      Platform: "PredictIt",
      "Binary question?": isbinary,
      "Percentage": isbinary? Number(Number(x.contracts[0].lastTradePrice)*100).toFixed(0)+"%" : "none"
      //"qualityindicators": {}
    })
    return output
  })
  //console.log(result)
  let string = JSON.stringify(result,null,  2)
  fs.writeFileSync('./data/predictit-questions.json', string);
  console.log("Done")
}
