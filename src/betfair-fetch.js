/* Imports */
import axios from "axios"
import fetch from "isomorphic-fetch"
import fs from "fs"
import https from "https"
import { calculateStars } from "./stars.js"

/* Definitions */
let restEndpoint = "https://api.betfair.com/exchange/betting/rest/v1.0/"
let loginEndpoint = "https://identitysso-cert.betfair.es/api/certlogin/"
let sessionToken="kSSpkmq+tYq0KrHU0WsLNLBodGqh3QTg8Dhp50H36a0="

const httpsAgent = new https.Agent({
  cert: fs.readFileSync('src/client-2048.crt'),
  key: fs.readFileSync('src/client-2048.key'),
});

/* Support functions */
function getcookie() {
  try {
    let rawcookie = fs.readFileSync("./src/privatekeys.json")
    let cookie = JSON.parse(rawcookie).betfair
    if (cookie == undefined) {
      throw new Error('No cookie for Betfair!');
    }
    return cookie
  } catch (error) {
    console.log("Error: No cookies for Betfair on src/privatekeys.json! See the README.md")
    process.exit()
  }
}

async function fetchLogin() {
  let cookie = getcookie()
  console.log(cookie)
  let data = `username=${cookie["username"]}&password=${cookie["password"]}`
  let response = await axios({
    url: loginEndpoint,
    method: 'POST',
    headers: ({
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Application': cookie["key-1.0-DELAY"]
    }),
    data: JSON.stringify(data),
    httpsAgent: httpsAgent
  })
    .then(res => res.data)
  //console.log(response)
  return response
}

async function fetchRest(method="listEventTypes/"){
  let cookie = getcookie()
  let data = {
    "filter" : { }
}
  let response  = await fetch(restEndpoint+method, ({
    method: 'POST',
    headers: ({
      'Content-Type': 'application/json',
      'X-Application': cookie["key-1.0-DELAY"],
      "X-Authentication": sessionToken
    }),
    body: JSON.stringify(data)
  }))
  .then(res => res.json())

  return response
  /*
  let response = await axios({
    url: restEndpoint+method,
    method: 'POST',
    headers: ({
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Application': cookie["key-1.0-DELAY"],
      "X-Authentication": "gikChnxyORcDwVWwEqnIfNmrmjILiIyf2G4mOP/tGXQ="
    }),
    data: JSON.stringify(data),
    httpsAgent: httpsAgent
  })
    .then(res => res.data)
  //console.log(response)
  return response
*/
  
}

async function fetchRCP(method="listEventTypes/"){
  let cookie = getcookie()
  let data = 
  [
    {
        "jsonrpc": "2.0",
        "method": "SportsAPING/v1.0/listEventTypes",
        "params": {
            "filter": {}
        },
        "id": 1
    }
]
  let response  = await fetch(restEndpoint+method, ({
    method: 'POST',
    headers: ({
      'Content-Type': 'application/json',
      'X-Application': cookie["key-1.0-DELAY"],
      "X-Authentication": sessionToken
    }),
    body: JSON.stringify(data)
  }))
  .then(res => res.json())

  return response
}

/* Body */
export async function betfair() {
  let results = []
  //let login = await fetchLogin()
  //console.log(login)

  let example = await fetchRest()
  console.log(example)
  // let example = await fetchRCP()
  // console.log(example)


  console.log(results)
  let string = JSON.stringify(results, null, 2)
  fs.writeFileSync('./data/betfair-questions.json', string);
  console.log("Done")
}
betfair()
