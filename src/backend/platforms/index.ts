import { Question } from "@prisma/client";
import { QuestionOption } from "../../common/types";
import { prisma } from "../database/prisma";
import { getRobot, Robot } from "../robot";

// This file includes comon types and functions for working with platforms.
// The registry of all platforms is in a separate file, ./registry.ts, to avoid circular dependencies.

export interface QualityIndicators {
  stars: number;
  numforecasts?: number | string;
  numforecasters?: number;
  liquidity?: number | string;
  volume?: number;
  volume7Days?: number;
  volume24Hours?: number;
  address?: number;
  tradevolume?: string;
  pool?: any;
  createdTime?: any;
  shares_volume?: any;
  yes_bid?: any;
  yes_ask?: any;
  spread?: any;
  open_interest?: any;
  trade_volume?: any;
}

export type FetchedQuestion = Omit<
  Question,
  | "extra"
  | "qualityindicators"
  | "fetched"
  | "firstSeen"
  | "platform"
  | "options"
> & {
  extra?: object; // required in DB but annoying to return empty; also this is slightly stricter than Prisma's JsonValue
  options: QuestionOption[]; // stronger type than Prisma's JsonValue
  qualityindicators: Omit<QualityIndicators, "stars">; // slightly stronger type than Prisma's JsonValue
};

type MFStorage = {
  upsert: (q: FetchedQuestion) => Promise<void>;
};

// fetcher should return null if platform failed to fetch questions for some reason
type PlatformFetcherV1 = () => Promise<FetchedQuestion[] | null>;

type PlatformFetcherV2Result = {
  questions: FetchedQuestion[];
  // if partial is true then we won't cleanup old questions from the database; this is useful when manually invoking a fetcher with arguments for updating a single question
  partial: boolean;
} | null;

type PlatformFetcherV2<ArgNames extends string> = (opts: {
  args?: { [k in ArgNames]: string };
}) => Promise<PlatformFetcherV2Result>;

type PlatformFetcherV3<
  ArgNames extends string,
  RobotContext = unknown
> = (opts: {
  args?: { [k in ArgNames]: string };
  robot: Robot<RobotContext>;
  storage: MFStorage;
}) => Promise<void>;

// using "" as ArgNames default is technically incorrect, but shouldn't cause any real issues
// (I couldn't find a better solution for signifying an empty value, though there probably is one)
export type Platform<ArgNames extends string = "", RobotContext = unknown> = {
  name: string; // short name for ids and `platform` db column, e.g. "xrisk"
  label: string; // longer name for displaying on frontend etc., e.g. "X-risk estimates"
  color: string; // used on frontend
  calculateStars: (question: FetchedQuestion) => number;
} & (
  | {
      version: "v1";
      fetcher?: PlatformFetcherV1;
    }
  | {
      version: "v2";
      fetcherArgs?: ArgNames[];
      fetcher?: PlatformFetcherV2<ArgNames>;
    }
  | {
      version: "v3";
      fetcherArgs?: ArgNames[];
      fetcher?: PlatformFetcherV3<ArgNames, RobotContext>;
    }
);

// Typing notes:
// There's a difference between prisma's Question type (type returned from `find` and `findMany`) and its input types due to JsonValue vs InputJsonValue mismatch.
// On the other hand, we can't use Prisma.QuestionUpdateInput or Prisma.QuestionCreateManyInput either, because we use this question in guesstimate's code for preparing questions from guesstimate models...
// So here we build a new type which should be ok to use both in place of prisma's Question type and as an input to its update or create methods.
type PreparedQuestion = Omit<
  Question,
  "extra" | "qualityindicators" | "options" | "fetched" | "firstSeen"
> & {
  fetched: Date;
  extra: NonNullable<Question["extra"]>;
  qualityindicators: NonNullable<Question["qualityindicators"]>;
  options: NonNullable<Question["options"]>;
};

export const prepareQuestion = (
  q: FetchedQuestion,
  platform: Platform<any, any>
): PreparedQuestion => {
  return {
    extra: {},
    ...q,
    fetched: new Date(),
    platform: platform.name,
    qualityindicators: {
      ...q.qualityindicators,
      stars: platform.calculateStars(q),
    },
  };
};

export const upsertSingleQuestion = async (
  q: PreparedQuestion
): Promise<Question> => {
  return await prisma.question.upsert({
    where: { id: q.id },
    create: {
      ...q,
      firstSeen: new Date(),
    },
    update: q,
  });
  // TODO - update history?
};

export const processPlatform = async <T extends string = "", RC = unknown>(
  platform: Platform<T, RC>,
  args?: { [k in T]: string }
) => {
  if (!platform.fetcher) {
    console.log(`Platform ${platform.name} doesn't have a fetcher, skipping`);
    return;
  }

  if (platform.version === "v3") {
    const robot = getRobot(platform);
    const storage: MFStorage = {
      async upsert(q) {
        await upsertSingleQuestion(prepareQuestion(q, platform));
      },
    };
    await platform.fetcher({
      robot,
      storage,
    });
    return;
  }

  const result =
    platform.version === "v1"
      ? { questions: await platform.fetcher(), partial: false } // this is not exactly PlatformFetcherV2Result, since `questions` can be null
      : await platform.fetcher({ args });

  if (!result) {
    console.log(`Platform ${platform.name} didn't return any results`);
    return;
  }

  const { questions: fetchedQuestions, partial } = result;

  if (!fetchedQuestions || !fetchedQuestions.length) {
    console.log(`Platform ${platform.name} didn't return any results`);
    return;
  }

  const oldQuestions = await prisma.question.findMany({
    where: {
      platform: platform.name,
    },
  });

  const fetchedIds = fetchedQuestions.map((q) => q.id);
  const oldIds = oldQuestions.map((q) => q.id);

  const fetchedIdsSet = new Set(fetchedIds);
  const oldIdsSet = new Set(oldIds);

  const createdQuestions: PreparedQuestion[] = [];
  const updatedQuestions: PreparedQuestion[] = [];
  const deletedIds = oldIds.filter((id) => !fetchedIdsSet.has(id));

  for (const q of fetchedQuestions.map((q) => prepareQuestion(q, platform))) {
    if (oldIdsSet.has(q.id)) {
      // TODO - check if question has changed for better performance
      updatedQuestions.push(q);
    } else {
      createdQuestions.push(q);
    }
  }

  const stats: { created?: number; updated?: number; deleted?: number } = {};

  await prisma.question.createMany({
    data: createdQuestions.map((q) => ({
      ...q,
      firstSeen: new Date(),
    })),
  });
  stats.created = createdQuestions.length;

  for (const q of updatedQuestions) {
    await prisma.question.update({
      where: { id: q.id },
      data: q,
    });
    stats.updated ??= 0;
    stats.updated++;
  }

  if (!partial) {
    await prisma.question.deleteMany({
      where: {
        id: {
          in: deletedIds,
        },
      },
    });
    stats.deleted = deletedIds.length;
  }

  await prisma.history.createMany({
    data: [...createdQuestions, ...updatedQuestions].map((q) => ({
      ...q,
      idref: q.id,
    })),
  });

  console.log(
    "Done, " +
      Object.entries(stats)
        .map(([k, v]) => `${v} ${k}`)
        .join(", ")
  );
};

export interface PlatformConfig {
  name: string;
  label: string;
  color: string;
}
