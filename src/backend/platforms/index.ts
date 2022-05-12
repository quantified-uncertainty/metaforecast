import { Question } from "@prisma/client";

import { QuestionOption } from "../../common/types";
import { prisma } from "../database/prisma";

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
  "extra" | "qualityindicators" | "timestamp" | "platform" | "options"
> & {
  timestamp?: Date;
  extra?: object; // required in DB but annoying to return empty; also this is slightly stricter than Prisma's JsonValue
  options: QuestionOption[]; // stronger type than Prisma's JsonValue
  qualityindicators: Omit<QualityIndicators, "stars">; // slightly stronger type than Prisma's JsonValue
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

export type PlatformFetcher<ArgNames extends string> =
  | PlatformFetcherV1
  | PlatformFetcherV2<ArgNames>;

// using "" as ArgNames default is technically incorrect, but shouldn't cause any real issues
// (I couldn't find a better solution for signifying an empty value, though there probably is one)
export type Platform<ArgNames extends string = ""> = {
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
);

// Typing notes:
// There's a difference between prisma's Question type (type returned from `find` and `findMany`) and its input types due to JsonValue vs InputJsonValue mismatch.
// On the other hand, we can't use Prisma.QuestionUpdateInput or Prisma.QuestionCreateManyInput either, because we use this question in guesstimate's code for preparing questions from guesstimate models...
// So here we build a new type which should be ok to use both in place of prisma's Question type and as an input to its update or create methods.
type PreparedQuestion = Omit<
  Question,
  "extra" | "qualityindicators" | "options"
> & {
  extra: NonNullable<Question["extra"]>;
  qualityindicators: NonNullable<Question["qualityindicators"]>;
  options: NonNullable<Question["options"]>;
};

export const prepareQuestion = (
  q: FetchedQuestion,
  platform: Platform<any>
): PreparedQuestion => {
  return {
    extra: {},
    timestamp: new Date(),
    ...q,
    platform: platform.name,
    qualityindicators: {
      ...q.qualityindicators,
      stars: platform.calculateStars(q),
    },
  };
};

export const processPlatform = async <T extends string = "">(
  platform: Platform<T>,
  args?: { [k in T]: string }
) => {
  if (!platform.fetcher) {
    console.log(`Platform ${platform.name} doesn't have a fetcher, skipping`);
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
      updatedQuestions.push(q);
    } else {
      // TODO - check if question has changed for better performance
      createdQuestions.push(q);
    }
  }

  const stats: { created?: number; updated?: number; deleted?: number } = {};

  await prisma.question.createMany({
    data: createdQuestions,
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
