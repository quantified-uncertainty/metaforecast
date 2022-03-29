import { databaseUpsert } from "../database/database-wrapper";
import { betfair } from "./betfair-fetch";
import { fantasyscotus } from "./fantasyscotus-fetch";
import { foretold } from "./foretold-fetch";
import { goodjudgment } from "./goodjudgment-fetch";
import { goodjudmentopen } from "./goodjudmentopen-fetch";
import { infer } from "./infer-fetch";
import { kalshi } from "./kalshi-fetch";
import { manifoldmarkets } from "./manifoldmarkets-fetch";
import { metaculus } from "./metaculus-fetch";
import { polymarket } from "./polymarket-fetch";
import { predictit } from "./predictit-fetch";
import { rootclaim } from "./rootclaim-fetch";
import { smarkets } from "./smarkets-fetch";
import { wildeford } from "./wildeford-fetch";

export interface Forecast {
  id: string;
  title: string;
  url: string;
  description: string;
  platform: string;
  options: any[];
  timestamp: string;
  qualityindicators: any;
  extra?: any;
}

export type PlatformFetcher = () => Promise<Forecast[] | null>;

interface Platform {
  name: string;
  fetcher: PlatformFetcher;
}

// draft for the future callback-based streaming/chunking API:
// interface FetchOptions {
//   since?: string; // some kind of cursor, Date object or opaque string?
//   save: (forecasts: Forecast[]) => Promise<void>;
// }

// export type PlatformFetcher = (options: FetchOptions) => Promise<void>;

// interface Platform {
//   name: string;
//   color?: string;
//   longName: string;
//   fetcher: PlatformFetcher;
// }

export const platforms: Platform[] = [
  betfair,
  fantasyscotus,
  foretold,
  goodjudgment,
  goodjudmentopen, // note the typo! current table name is without `g`, `goodjudmentopen`
  infer,
  kalshi,
  manifoldmarkets,
  metaculus,
  polymarket,
  predictit,
  rootclaim,
  smarkets,
  wildeford,
].map((fun) => ({ name: fun.name, fetcher: fun }));

export const processPlatform = async (platform: Platform) => {
  let results = await platform.fetcher();
  if (results && results.length) {
    await databaseUpsert({ contents: results, group: platform.name });
    console.log("Done");
  } else {
    console.log(`Platform ${platform.name} didn't return any results`);
  }
};
