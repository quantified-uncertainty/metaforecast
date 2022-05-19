/* Imports */
import Ajv, { JTDDataType } from "ajv/dist/jtd";
import axios from "axios";

import { average } from "../../utils";
import { sleep } from "../utils/sleep";
import { FetchedQuestion, Platform } from "./";

/* Definitions */
const platformName = "metaculus";
const now = new Date().toISOString();
const SLEEP_TIME = 5000;

const apiQuestionSchema = {
  properties: {
    page_url: {
      type: "string",
    },
    title: {
      type: "string",
    },
    publish_time: {
      type: "string",
    },
    close_time: {
      type: "string",
    },
    resolve_time: {
      type: "string",
    },
    number_of_predictions: {
      type: "uint32",
    },
    possibilities: {
      properties: {
        type: {
          type: "string", // TODO - enum?
        },
      },
      additionalProperties: true,
    },
    community_prediction: {
      properties: {
        full: {
          properties: {
            q1: {
              type: "float64",
            },
            q2: {
              type: "float64",
            },
            q3: {
              type: "float64",
            },
          },
          additionalProperties: true,
        },
      },
      additionalProperties: true,
    },
  },
  additionalProperties: true,
} as const;

const apiMultipleQuestionsSchema = {
  properties: {
    results: {
      elements: apiQuestionSchema,
    },
    next: {
      type: "string",
      nullable: true,
    },
  },
  additionalProperties: true,
} as const;

type ApiQuestion = JTDDataType<typeof apiQuestionSchema>;
type ApiMultipleQuestions = JTDDataType<typeof apiMultipleQuestionsSchema>;

const validateApiQuestion = new Ajv().compile<ApiQuestion>(apiQuestionSchema);
const validateApiMultipleQuestions = new Ajv().compile<
  JTDDataType<typeof apiMultipleQuestionsSchema>
>(apiMultipleQuestionsSchema);

async function fetchWithRetries<T = unknown>(url: string): Promise<T> {
  try {
    const response = await axios.get<T>(url);
    return response.data;
  } catch (error) {
    console.log(`Error while fetching ${url}`);
    console.log(error);
    if (axios.isAxiosError(error)) {
      if (error.response?.headers["retry-after"]) {
        const timeout = error.response.headers["retry-after"];
        console.log(`Timeout: ${timeout}`);
        await sleep(Number(timeout) * 1000 + SLEEP_TIME);
      } else {
        await sleep(SLEEP_TIME);
      }
    }
  }
  const response = await axios.get<T>(url);
  return response.data;
}

/* Support functions */
async function fetchApiQuestions(next: string): Promise<ApiMultipleQuestions> {
  const data = await fetchWithRetries<object>(next);
  if (validateApiMultipleQuestions(data)) {
    return data;
  }
  throw new Error("Response validation failed");
}

async function fetchSingleApiQuestion(url: string): Promise<ApiQuestion> {
  const data = await fetchWithRetries<object>(url);
  if (validateApiQuestion(data)) {
    return data;
  }
  throw new Error("Response validation failed");
}

async function fetchQuestionHtml(slug: string) {
  return await fetchWithRetries<string>("https://www.metaculus.com" + slug);
}

async function fetchQuestionPage(slug: string) {
  const questionPage = await fetchQuestionHtml(slug);
  const isPublicFigurePrediction = questionPage.includes(
    "A public prediction by"
  );

  let description: string = "";
  if (!isPublicFigurePrediction) {
    const match = questionPage.match(
      /\s*window\.metacData\.question = (.+);\s*/
    );
    if (!match) {
      throw new Error("metacData not found");
    }
    description = JSON.parse(match[1]).description;
  }

  return {
    isPublicFigurePrediction,
    description,
  };
}

async function apiQuestionToFetchedQuestion(
  apiQuestion: ApiQuestion
): Promise<FetchedQuestion | null> {
  if (apiQuestion.publish_time > now || now > apiQuestion.resolve_time) {
    return null;
  }
  await sleep(SLEEP_TIME / 2);

  const questionPage = await fetchQuestionPage(apiQuestion.page_url);

  if (questionPage.isPublicFigurePrediction) {
    console.log("- [Skipping public prediction]");
    return null;
  }

  const isBinary = apiQuestion.possibilities.type === "binary";
  let options: FetchedQuestion["options"] = [];
  if (isBinary) {
    const probability = Number(apiQuestion.community_prediction.full.q2);
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
  const question: FetchedQuestion = {
    id: `${platformName}-${apiQuestion.id}`,
    title: apiQuestion.title,
    url: "https://www.metaculus.com" + apiQuestion.page_url,
    description: questionPage.description,
    options,
    qualityindicators: {
      numforecasts: apiQuestion.number_of_predictions,
    },
    extra: {
      resolution_data: {
        publish_time: apiQuestion.publish_time,
        resolution: apiQuestion.resolution,
        close_time: apiQuestion.close_time,
        resolve_time: apiQuestion.resolve_time,
      },
    },
    //"status": result.status,
    //"publish_time": result.publish_time,
    //"close_time": result.close_time,
    //"type": result.possibilities.type, // We want binary ones here.
    //"last_activity_time": result.last_activity_time,
  };
  if (apiQuestion.number_of_predictions < 10) {
    return null;
  }

  return question;
}

export const metaculus: Platform<"id" | "debug"> = {
  name: platformName,
  label: "Metaculus",
  color: "#006669",
  version: "v2",
  fetcherArgs: ["id", "debug"],
  async fetcher(opts) {
    let allQuestions: FetchedQuestion[] = [];

    if (opts.args?.id) {
      const apiQuestion = await fetchSingleApiQuestion(
        `https://www.metaculus.com/api2/questions/${opts.args?.id}`
      );
      const question = await apiQuestionToFetchedQuestion(apiQuestion);
      console.log(question);
      return {
        questions: question ? [question] : [],
        partial: true,
      };
    }

    let next: string | null = "https://www.metaculus.com/api2/questions/";
    let i = 1;
    while (next) {
      if (i % 20 === 0) {
        console.log("Sleeping for 500ms");
        await sleep(SLEEP_TIME);
      }
      console.log(`\nQuery #${i}`);

      const metaculusQuestions: ApiMultipleQuestions = await fetchApiQuestions(
        next
      );
      const results = metaculusQuestions.results;

      let j = false;

      for (const result of results) {
        const question = await apiQuestionToFetchedQuestion(result);
        if (!question) {
          continue;
        }
        console.log(`- ${question.title}`);
        if ((!j && i % 20 === 0) || opts.args?.debug) {
          console.log(question);
          j = true;
        }
        allQuestions.push(question);
      }

      next = metaculusQuestions.next;
      i = i + 1;
    }

    return {
      questions: allQuestions,
      partial: false,
    };
  },

  calculateStars(data) {
    const { numforecasts } = data.qualityindicators;
    const nuno = () =>
      (numforecasts || 0) > 300 ? 4 : (numforecasts || 0) > 100 ? 3 : 2;
    const eli = () => 3;
    const misha = () => 3;
    const starsDecimal = average([nuno(), eli(), misha()]);
    const starsInteger = Math.round(starsDecimal);
    return starsInteger;
  },
};
