import axios from "axios";

import { Question } from "@prisma/client";

import { AlgoliaQuestion, questionToAlgoliaQuestion } from "../utils/algolia";
import { FetchedQuestion, Platform, prepareQuestion, upsertSingleQuestion } from "./";

/* Definitions */
const searchEndpoint =
  "https://m629r9ugsg-dsn.algolia.net/1/indexes/Space_production/query?x-algolia-agent=Algolia%20for%20vanilla%20JavaScript%203.32.1&x-algolia-application-id=M629R9UGSG&x-algolia-api-key=4e893740a2bd467a96c8bfcf95b2809c";

const apiEndpoint = "https://guesstimate.herokuapp.com";

const modelToQuestion = (model: any): ReturnType<typeof prepareQuestion> => {
  const { description } = model;
  // const description = model.description
  //   ? model.description.replace(/\n/g, " ").replace(/  /g, " ")
  //   : "";
  // const timestamp = parseISO(model.created_at);
  const fq: FetchedQuestion = {
    id: `guesstimate-${model.id}`,
    title: model.name,
    url: `https://www.getguesstimate.com/models/${model.id}`,
    // timestamp,
    description,
    options: [],
    qualityindicators: {
      numforecasts: 1,
      numforecasters: 1,
    },
    extra: {
      visualization: model.big_screenshot,
    },
    // ranking: 10 * (index + 1) - 0.5, //(model._rankingInfo - 1*index)// hack
  };
  const q = prepareQuestion(fq, guesstimate);
  return q;
};

async function search(query: string): Promise<AlgoliaQuestion[]> {
  const response = await axios({
    url: searchEndpoint,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: `{\"params\":\"query=${query.replace(
      / /g,
      "%20"
    )}&hitsPerPage=20&page=0&getRankingInfo=true\"}`,
    method: "POST",
  });

  const models: any[] = response.data.hits;
  const mappedModels: AlgoliaQuestion[] = models.map((model) => {
    const q = modelToQuestion(model);
    return questionToAlgoliaQuestion({
      ...q,
      fetched: new Date(),
      firstSeen: new Date(),
    });
  });

  // filter for duplicates. Surprisingly common.
  let uniqueTitles: string[] = [];
  let uniqueModels: AlgoliaQuestion[] = [];
  for (let model of mappedModels) {
    if (!uniqueTitles.includes(model.title) && !model.title.includes("copy")) {
      uniqueModels.push(model);
      uniqueTitles.push(model.title);
    }
  }

  return uniqueModels;
}

const fetchQuestion = async (id: number): Promise<Question> => {
  const response = await axios({ url: `${apiEndpoint}/spaces/${id}` });
  const q = modelToQuestion(response.data);
  return await upsertSingleQuestion(q);
};

export const guesstimate: Platform & {
  search: typeof search;
  fetchQuestion: typeof fetchQuestion;
} = {
  name: "guesstimate",
  label: "Guesstimate",
  color: "#223900",
  search,
  version: "v1",
  fetchQuestion,
  calculateStars: (q) => (q.description.length > 250 ? 2 : 1),
};
