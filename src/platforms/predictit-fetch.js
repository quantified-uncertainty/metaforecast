/* Imports */
import fs from "fs";
import axios from "axios";
import toMarkdown from "../utils/toMarkdown.js";
import { calculateStars } from "../utils/stars.js";
import { databaseUpsert } from "../database/database-wrapper.js";

/* Support functions */
async function fetchmarkets() {
  let response = await axios({
    method: "get",
    url: "https://www.predictit.org/api/marketdata/all/",
  });
  let openMarkets = response.data.markets.filter(
    (market) => market.status == "Open"
  );
  return openMarkets;
}

async function fetchmarketrules(market_id) {
  let response = await axios({
    method: "get",
    url: "https://www.predictit.org/api/Market/" + market_id,
  });
  return response.data.rule;
}

async function fetchmarketvolumes() {
  let response = await axios({
    method: "get",
    url: "https://predictit-f497e.firebaseio.com/marketStats.json",
  });
  return response.data;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* Body */
export async function predictit() {
  let markets = await fetchmarkets();
  let marketVolumes = await fetchmarketvolumes();

  markets = markets.map((market) => ({
    ...market,
    TotalSharesTraded: marketVolumes[market.id]["TotalSharesTraded"],
  }));
  // console.log(markets)

  let results = [];
  for (let market of markets) {
    // console.log(market.name)
    let id = `predictit-${market.id}`;
    let isbinary = market.contracts.length == 1;
    await sleep(3000 * (1 + Math.random()));
    let descriptionraw = await fetchmarketrules(market.id);
    let descriptionprocessed1 = toMarkdown(descriptionraw);
    let description = descriptionprocessed1;
    let shares_volume = market["TotalSharesTraded"];
    // let percentageFormatted = isbinary ? Number(Number(market.contracts[0].lastTradePrice) * 100).toFixed(0) + "%" : "none"

    let options = market.contracts.map((contract) => ({
      name: contract.name,
      probability: contract.lastTradePrice,
      type: "PROBABILITY",
    }));
    let totalValue = options
      .map((element) => Number(element.probability))
      .reduce((a, b) => a + b, 0);

    if (options.length != 1 && totalValue > 1) {
      options = options.map((element) => ({
        ...element,
        probability: Number(element.probability) / totalValue,
      }));
    } else if (options.length == 1) {
      let option = options[0];
      let probability = option["probability"];
      options = [
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
      ];
    }

    let obj = {
      id: id,
      title: market["name"],
      url: market.url,
      platform: "PredictIt",
      description: description,
      options: options,
      timestamp: new Date().toISOString(),
      qualityindicators: {
        stars: calculateStars("PredictIt", {}),
        shares_volume: shares_volume,
      },
    };
    // console.log(obj)
    results.push(obj);
  }
  //console.log(results)
  // let string = JSON.stringify(results, null, 2)
  // fs.writeFileSync('./data/predictit-questions.json', string);
  await databaseUpsert({ contents: results, group: "predictit" });

  console.log("Done");
}
