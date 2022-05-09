import { Question } from "@prisma/client";

import { prisma } from "../database/prisma";
import { betfair } from "./betfair";
import { fantasyscotus } from "./fantasyscotus";
import { foretold } from "./foretold";
import { givewellopenphil } from "./givewellopenphil";
import { goodjudgment } from "./goodjudgment";
import { goodjudgmentopen } from "./goodjudgmentopen";
import { guesstimate } from "./guesstimate";
import { infer } from "./infer";
import { kalshi } from "./kalshi";
import { manifold } from "./manifold";
import { metaculus } from "./metaculus";
import { polymarket } from "./polymarket";
import { predictit } from "./predictit";
import { rootclaim } from "./rootclaim";
import { smarkets } from "./smarkets";
import { wildeford } from "./wildeford";
import { xrisk } from "./xrisk";

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
  options: {
    name?: string;
    probability?: number;
    type: "PROBABILITY";
  }[]; // stronger type than Prisma's JsonValue
  qualityindicators: Omit<QualityIndicators, "stars">; // slightly stronger type than Prisma's JsonValue
};

// fetcher should return null if platform failed to fetch questions for some reason
export type PlatformFetcher = () => Promise<FetchedQuestion[] | null>;

export interface Platform {
  name: string; // short name for ids and `platform` db column, e.g. "xrisk"
  label: string; // longer name for displaying on frontend etc., e.g. "X-risk estimates"
  color: string; // used on frontend
  fetcher?: PlatformFetcher;
  calculateStars: (question: FetchedQuestion) => number;
}

// draft for the future callback-based streaming/chunking API:
// interface FetchOptions {
//   since?: string; // some kind of cursor, Date object or opaque string?
//   save: (questions: Question[]) => Promise<void>;
// }

// export type PlatformFetcher = (options: FetchOptions) => Promise<void>;

export const platforms: Platform[] = [
  betfair,
  fantasyscotus,
  foretold,
  givewellopenphil,
  goodjudgment,
  goodjudgmentopen,
  guesstimate,
  infer,
  kalshi,
  manifold,
  metaculus,
  polymarket,
  predictit,
  rootclaim,
  smarkets,
  wildeford,
  xrisk,
];

export const prepareQuestion = (
  q: FetchedQuestion,
  platform: Platform
): Question => {
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

export const processPlatform = async (platform: Platform) => {
  if (!platform.fetcher) {
    console.log(`Platform ${platform.name} doesn't have a fetcher, skipping`);
    return;
  }
  const fetchedQuestions = await platform.fetcher();
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

  const createdQuestions: Question[] = [];
  const updatedQuestions: Question[] = [];
  const deletedIds = oldIds.filter((id) => !fetchedIdsSet.has(id));

  for (const q of fetchedQuestions.map((q) => prepareQuestion(q, platform))) {
    if (oldIdsSet.has(q.id)) {
      updatedQuestions.push(q);
    } else {
      // TODO - check if question has changed for better performance
      createdQuestions.push(q);
    }
  }

  await prisma.question.createMany({
    data: createdQuestions,
  });

  for (const q of updatedQuestions) {
    await prisma.question.update({
      where: { id: q.id },
      data: q,
    });
  }

  await prisma.question.deleteMany({
    where: {
      id: {
        in: deletedIds,
      },
    },
  });

  console.log(
    `Done, ${deletedIds.length} deleted, ${updatedQuestions.length} updated, ${createdQuestions.length} created`
  );
};

export interface PlatformConfig {
  name: string;
  label: string;
  color: string;
}

// get frontend-safe version of platforms data
export const getPlatformsConfig = (): PlatformConfig[] => {
  const platformsConfig = platforms.map((platform) => ({
    name: platform.name,
    label: platform.label,
    color: platform.color,
  }));

  return platformsConfig;
};
