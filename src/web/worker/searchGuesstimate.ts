/* Imports */
import axios from "axios";

import { AlgoliaQuestion } from "../../backend/utils/algolia";

/* Definitions */
const urlEndPoint =
  "https://m629r9ugsg-dsn.algolia.net/1/indexes/Space_production/query?x-algolia-agent=Algolia%20for%20vanilla%20JavaScript%203.32.1&x-algolia-application-id=M629R9UGSG&x-algolia-api-key=4e893740a2bd467a96c8bfcf95b2809c";

/* Body */

export default async function searchGuesstimate(
  query
): Promise<AlgoliaQuestion[]> {
  const response = await axios({
    url: urlEndPoint,
    // credentials: "omit",
    headers: {
      // "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:85.0) Gecko/20100101 Firefox/85.0",
      Accept: "application/json",
      "Accept-Language": "en-US,en;q=0.5",
      "content-type": "application/x-www-form-urlencoded",
    },
    data: `{\"params\":\"query=${query.replace(
      / /g,
      "%20"
    )}&hitsPerPage=20&page=0&getRankingInfo=true\"}`,
    method: "POST",
  });

  const models: any[] = response.data.hits;
  const mappedModels: AlgoliaQuestion[] = models.map((model, index) => {
    const description = model.description
      ? model.description.replace(/\n/g, " ").replace(/  /g, " ")
      : "";
    const stars = description.length > 250 ? 2 : 1;
    const q: AlgoliaQuestion = {
      id: `guesstimate-${model.id}`,
      title: model.name,
      url: `https://www.getguesstimate.com/models/${model.id}`,
      timestamp: model.created_at, // TODO - check that format matches
      platform: "guesstimate",
      description,
      options: [],
      qualityindicators: {
        stars: stars,
        numforecasts: 1,
        numforecasters: 1,
      },
      stars,
      extra: {
        visualization: model.big_screenshot,
      },
      // ranking: 10 * (index + 1) - 0.5, //(model._rankingInfo - 1*index)// hack
    };
    return q;
  });

  // filter for duplicates. Surprisingly common.
  let uniqueTitles = [];
  let uniqueModels: AlgoliaQuestion[] = [];
  for (let model of mappedModels) {
    if (!uniqueTitles.includes(model.title) && !model.title.includes("copy")) {
      uniqueModels.push(model);
      uniqueTitles.push(model.title);
    }
  }

  console.log(uniqueModels);
  return uniqueModels;
}

// searchGuesstimate("COVID-19").then(guesstimateModels => console.log(guesstimateModels))
