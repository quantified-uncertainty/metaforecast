/* Imports */
import axios from "axios";
import fs from "fs";
import { calculateStars } from "../utils/stars.js";
import { databaseUpsert } from "../utils/database-wrapper.js";

/* Definitions */
let endpointPolitics = `https://ss-aka-ori.ladbrokes.com/openbet-ssviewer/Drilldown/2.31/EventToOutcomeForClass/302,301,300?simpleFilter=event.siteChannels:contains:M&simpleFilter=event.eventSortCode:intersects:TNMT,TR01,TR02,TR03,TR04,TR05,TR06,TR07,TR08,TR09,TR10,TR11,TR12,TR13,TR14,TR15,TR16,TR17,TR18,TR19,TR20&simpleFilter=event.suspendAtTime:greaterThan:${new Date().toISOString()}.000Z&limitRecords=outcome:1&limitRecords=market:1&translationLang=en&responseFormat=json&prune=event&prune=market`;
let enpointDrillDown = (id) =>
  `https://ss-aka-ori.ladbrokes.com/openbet-ssviewer/Drilldown/2.31/EventToOutcomeForEvent/${id}?&translationLang=en&responseFormat=json`;

// <header class="header-dropdown header-dropdown--large -expanded" data-id="

/* Support functions */
async function fetchUrl(url) {
  let response = await axios(url, {
    credentials: "include",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:86.0) Gecko/20100101 Firefox/86.0",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
      "Upgrade-Insecure-Requests": "1",
      "Cache-Control": "max-age=0",
    },
    method: "GET",
    mode: "cors",
  }).then((response) => response.data);
  return response;
}

let processResults = async (json) => {
  let results = [];
  let children = json.SSResponse.children;
  children.pop();
  let ids = children.map((child) => child.event.id);
  let markets = [];
  for (let id of ids) {
    let marketsContainer = await fetchUrl(enpointDrillDown(id));
    let marketsObj = marketsContainer.SSResponse.children[0].event;
    let newMarkets = marketsObj.children;
    newMarkets = newMarkets.map((market) => ({
      ...market.market,
      parent: marketsObj.name,
    }));
    markets.push(...newMarkets);
  }
  let normalMarkets = markets.filter(
    (market) => !market.name.includes("Specials")
  );
  //console.log(normalMarkets)

  for (let normalMarket of normalMarkets) {
    let title = normalMarket.parent + ": " + normalMarket.name;
    title = title.replace("Boris Johnson Specials", "Boris Johnson"); // small kludge
    let options = normalMarket.children.map((child) => {
      let name = child.outcome.name;

      let priceData = child.outcome.children[0].price;
      let priceDecimal = Number(priceData.priceDec);
      let probability = 1 / priceDecimal;
      let option = {
        name: name,
        probability: probability,
        type: "PROBABILITY",
      };
      return option;
    });
    // normalize probabilities
    let totalValue = options
      .map((element) => Number(element.probability))
      .reduce((a, b) => a + b, 0);
    options = options.map((element) => ({
      ...element,
      probability: Number(element.probability) / totalValue,
    }));

    // Filter very unlikely probabilities: Not here, but on the front end
    // options = options.filter(element => element.probability > 0.02)

    let obj = {
      title: title,
      url: "https://sports.ladbrokes.com/sport/politics/outrights",
      platform: "Ladbrokes",
      description: "",
      options: options,
      timestamp: new Date().toISOString(),
      qualityindicators: {
        stars: calculateStars("Ladbrokes", {}),
      },
    };
    results.push(obj);
  }

  let specialMarkets = markets.filter((market) =>
    market.name.includes("Specials")
  );
  for (let specialMarket of specialMarkets) {
    //let title = specialMarket.parent + ": " + specialMarket.name
    //console.log(title)
    specialMarket.children.forEach((child) => {
      let name = specialMarket.parent.includes("Specials")
        ? child.outcome.name
        : specialMarket.parent + ": " + child.outcome.name;
      name = name.replace("Boris Johnson Specials", "Boris Johnson"); // small kludge
      let priceData = child.outcome.children[0].price;
      let priceDecimal = Number(priceData.priceDec);
      let probability = 1 / priceDecimal;
      let obj = {
        title: name,
        url: "https://sports.ladbrokes.com/sport/politics/outrights",
        platform: "LadBrokes",
        options: [
          {
            name: "Yes",
            probability: probability,
            type: "PROBABILITY",
          },
          {
            name: "No",
            probability: 1 - probability,
            type: "PROBABILITY",
          },
        ],
        qualityindicators: {
          stars: calculateStars("Ladbrokes", {}),
        },
      };
      results.push(obj);
    });
  }
  return results;
};

/* Body */
export async function ladbrokes() {
  let response = await fetchUrl(endpointPolitics);
  let results = await processResults(response);
  // console.log(results)
  // let string = JSON.stringify(results, null, 2)
  // fs.writeFileSync('./data/ladbrokes-questions.json', string);
  await databaseUpsert(results, "ladbrokes-questions");
  console.log("Done");
}
//ladbrokes()
