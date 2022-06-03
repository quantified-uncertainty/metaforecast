import { FetchedQuestion, Platform } from "..";
import { average } from "../../../utils";
import { Robot, RobotJob } from "../../robot";
import {
  ApiCommon,
  ApiPredictable,
  ApiQuestion,
  prepareApiQuestions,
  prepareSingleApiQuestion,
} from "./api";

const platformName = "metaculus";
const now = new Date().toISOString();
const SLEEP_TIME = 1000;

type Context =
  | {
      type: "apiIndex";
    }
  | {
      type: "apiQuestion";
    };

const skip = (q: ApiPredictable): boolean => {
  if (q.publish_time > now || now > q.resolve_time) {
    return true;
  }
  if (q.number_of_predictions < 10) {
    return true;
  }
  return false;
};

async function processApiQuestion(
  apiQuestion: ApiQuestion
): Promise<FetchedQuestion[]> {
  // one item can expand:
  // - to 0 questions if we don't want it;
  // - to 1 question if it's a simple forecast
  // - to multiple questions if it's a group (see https://github.com/quantified-uncertainty/metaforecast/pull/84 for details)

  const buildFetchedQuestion = (
    q: ApiPredictable & ApiCommon
  ): Omit<FetchedQuestion, "url" | "description" | "title"> => {
    const isBinary = q.possibilities.type === "binary";
    let options: FetchedQuestion["options"] = [];
    if (isBinary) {
      const probability = q.community_prediction.full.q2;
      if (probability !== undefined) {
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
    return (apiQuestion.sub_questions || [])
      .filter((q) => !skip(q))
      .map((sq) => {
        const tmp = buildFetchedQuestion(sq);
        return {
          ...tmp,
          title: `${apiQuestion.title} (${sq.title})`,
          description: apiQuestion.description || "",
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

    const tmp = buildFetchedQuestion(apiQuestion);
    return [
      {
        ...tmp,
        title: apiQuestion.title,
        description: apiQuestion.description || "",
        url: "https://www.metaculus.com" + apiQuestion.page_url,
      },
    ];
  } else {
    console.log(
      `Unknown metaculus question type: ${apiQuestion.type}, skipping`
    );
    return [];
  }
}

async function processApiIndexQuestion(
  apiQuestion: ApiQuestion,
  robot: Robot<Context>
): Promise<void> {
  if (apiQuestion.type === "group" || apiQuestion.type === "forecast") {
    if (apiQuestion.type === "forecast" && skip(apiQuestion)) {
      return;
    }
    await robot.schedule({
      url: `https://www.metaculus.com/api2/questions/${apiQuestion.id}/`,
      context: {
        type: "apiQuestion",
      },
    });
  }
}

export const metaculus: Platform<"id" | "debug", Context> = {
  name: platformName,
  label: "Metaculus",
  color: "#006669",
  version: "v3",
  fetcherArgs: ["id", "debug"],
  async fetcher({ robot, storage }) {
    await robot.schedule({
      url: "https://www.metaculus.com/api2/questions/",
      context: {
        type: "apiIndex",
      },
    });

    for (
      let job: RobotJob<Context> | undefined;
      (job = await robot.nextJob());

    ) {
      const data = await job.fetch();

      if (job.context.type === "apiIndex") {
        const apiIndex = await prepareApiQuestions(data);
        if (apiIndex.next) {
          await robot.schedule({
            url: apiIndex.next,
            context: {
              type: "apiIndex",
            },
          });
        }

        for (const apiQuestion of apiIndex.results) {
          await processApiIndexQuestion(apiQuestion, robot);
          // for (const question of questions) {
          //   console.log(`- ${question.title}`);
          //   allQuestions.push(question);
          // }
        }
      } else if (job.context.type === "apiQuestion") {
        const apiQuestion = await prepareSingleApiQuestion(data);
        const fetchedQuestions = await processApiQuestion(apiQuestion);
        for (const q of fetchedQuestions) {
          await storage.upsert(q);
        }
      } else {
        console.warn(`Unknown context type ${(job.context as any).type}`);
      }
      await job.done();
    }
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
