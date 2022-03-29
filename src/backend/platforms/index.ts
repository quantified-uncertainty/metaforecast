import { databaseUpsert } from "../database/database-wrapper";
import { betfair } from "./betfair-fetch";
import { fantasyscotus } from "./fantasyscotus-fetch";
import { foretold } from "./foretold-fetch";
import { goodjudgment } from "./goodjudgment-fetch";
import { goodjudgmentopen } from "./goodjudmentopen-fetch";
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

export const platforms: Platform[] = [
  betfair,
  fantasyscotus,
  foretold,
  goodjudgment,
  goodjudgmentopen,
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
