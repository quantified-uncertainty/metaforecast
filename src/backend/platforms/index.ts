import { Question } from "@prisma/client";

import { prisma } from "../database/prisma";
import { betfair } from "./betfair";
import { fantasyscotus } from "./fantasyscotus";
import { foretold } from "./foretold";
import { givewellopenphil } from "./givewellopenphil";
import { goodjudgment } from "./goodjudgment";
import { goodjudgmentopen } from "./goodjudgmentopen";
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
}

export type FetchedQuestion = Omit<
  Question,
  "extra" | "qualityindicators" | "timestamp"
> & {
  timestamp?: Date;
  extra?: object; // required in DB but annoying to return empty; also this is slightly stricter than Prisma's JsonValue
  qualityindicators: QualityIndicators; // slightly stronger type than Prisma's JsonValue
};

// fetcher should return null if platform failed to fetch questions for some reason
export type PlatformFetcher = () => Promise<FetchedQuestion[] | null>;

export interface Platform {
  name: string; // short name for ids and `platform` db column, e.g. "xrisk"
  label: string; // longer name for displaying on frontend etc., e.g. "X-risk estimates"
  color: string; // used on frontend
  fetcher?: PlatformFetcher;
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

export const processPlatform = async (platform: Platform) => {
  if (!platform.fetcher) {
    console.log(`Platform ${platform.name} doesn't have a fetcher, skipping`);
    return;
  }
  const results = await platform.fetcher();
  if (results && results.length) {
    await prisma.$transaction([
      prisma.question.deleteMany({
        where: {
          platform: platform.name,
        },
      }),
      prisma.question.createMany({
        data: results.map((q) => ({
          extra: {},
          timestamp: new Date(),
          ...q,
          qualityindicators: q.qualityindicators as object, // fighting typescript
        })),
      }),
    ]);
    console.log("Done");
  } else {
    console.log(`Platform ${platform.name} didn't return any results`);
  }
};

export interface PlatformConfig {
  name: string;
  label: string;
  color: string;
}

// get frontend-safe version of platforms data
export const getPlatformsConfig = (options: {
  withGuesstimate: boolean;
}): PlatformConfig[] => {
  const platformsConfig = platforms.map((platform) => ({
    name: platform.name,
    label: platform.label,
    color: platform.color,
  }));
  if (options.withGuesstimate) {
    platformsConfig.push({
      name: "guesstimate",
      label: "Guesstimate",
      color: "223900",
    });
  }

  return platformsConfig;
};
