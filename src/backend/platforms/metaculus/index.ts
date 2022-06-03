import { FetchedQuestion, Platform } from "..";
import { average } from "../../../utils";
import { sleep } from "../../utils/sleep";
import {
  ApiCommon,
  ApiMultipleQuestions,
  ApiPredictable,
  ApiQuestion,
  fetchApiQuestions,
  fetchSingleApiQuestion,
} from "./api";

const platformName = "metaculus";
const now = new Date().toISOString();
const SLEEP_TIME = 2500;

async function apiQuestionToFetchedQuestions(
  apiQuestion: ApiQuestion
): Promise<FetchedQuestion[]> {
  // one item can expand:
  // - to 0 questions if we don't want it;
  // - to 1 question if it's a simple forecast
  // - to multiple questions if it's a group (see https://github.com/quantified-uncertainty/metaforecast/pull/84 for details)

  await sleep(SLEEP_TIME);

  const skip = (q: ApiPredictable): boolean => {
    if (q.publish_time > now || now > q.resolve_time) {
      return true;
    }
    if (q.number_of_predictions < 10) {
      return true;
    }
    return false;
  };

  const buildFetchedQuestion = (
    q: ApiPredictable & ApiCommon
  ): Omit<FetchedQuestion, "url" | "description" | "title"> => {
    const isBinary = q.possibilities.type === "binary";
    let options: FetchedQuestion["options"] = [];
    if (isBinary) {
      const probability = Number(q.community_prediction.full.q2);
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
    return {
      id: `${platformName}-${q.id}`,
      options,
      qualityindicators: {
        numforecasts: q.number_of_predictions,
      },
      extra: {
        resolution_data: {
          publish_time: apiQuestion.publish_time,
          resolution: apiQuestion.resolution,
          close_time: apiQuestion.close_time,
          resolve_time: apiQuestion.resolve_time,
        },
      },
    };
  };

  if (apiQuestion.type === "group") {
    const apiQuestionDetails = await fetchSingleApiQuestion(apiQuestion.id);
    return apiQuestion.sub_questions
      .filter((q) => !skip(q))
      .map((sq) => {
        const tmp = buildFetchedQuestion(sq);
        return {
          ...tmp,
          title: `${apiQuestion.title} (${sq.title})`,
          description: apiQuestionDetails.description || "",
          url: `https://www.metaculus.com${apiQuestion.page_url}?sub-question=${sq.id}`,
        };
      });
  } else if (apiQuestion.type === "forecast") {
    if (apiQuestion.group) {
      return []; // sub-question, should be handled on the group level
    }
    if (skip(apiQuestion)) {
      return [];
    }

    const apiQuestionDetails = await fetchSingleApiQuestion(apiQuestion.id);
    const tmp = buildFetchedQuestion(apiQuestion);
    return [
      {
        ...tmp,
        title: apiQuestion.title,
        description: apiQuestionDetails.description || "",
        url: "https://www.metaculus.com" + apiQuestion.page_url,
      },
    ];
  } else {
    if (apiQuestion.type !== "claim") {
      // should never happen, since `discriminator` in JTD schema causes a strict runtime check
      console.log(
        `Unknown metaculus question type: ${
          (apiQuestion as any).type
        }, skipping`
      );
    }
    return [];
  }
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
      const id = Number(opts.args.id);
      const apiQuestion = await fetchSingleApiQuestion(id);
      const questions = await apiQuestionToFetchedQuestions(apiQuestion);
      console.log(questions);
      return {
        questions,
        partial: true,
      };
    }

    let next: string | null = "https://www.metaculus.com/api2/questions/";
    let i = 1;
    while (next) {
      if (i % 20 === 0) {
        console.log(`Sleeping for ${SLEEP_TIME}ms`);
        await sleep(SLEEP_TIME);
      }
      console.log(`\nQuery #${i} - ${next}`);

      const apiQuestions: ApiMultipleQuestions = await fetchApiQuestions(next);
      const results = apiQuestions.results;

      let j = false;

      for (const result of results) {
        const questions = await apiQuestionToFetchedQuestions(result);
        for (const question of questions) {
          console.log(`- ${question.title}`);
          if ((!j && i % 20 === 0) || opts.args?.debug) {
            console.log(question);
            j = true;
          }
          allQuestions.push(question);
        }
      }

      next = apiQuestions.next;
      i += 1;
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
