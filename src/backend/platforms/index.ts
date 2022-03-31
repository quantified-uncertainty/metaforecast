import { databaseUpsert } from "../database/database-wrapper";
import { betfair } from "./betfair";
import { fantasyscotus } from "./fantasyscotus";
import { foretold } from "./foretold";
import { givewellopenphil } from "./givewellopenphil";
import { goodjudgment } from "./goodjudgment";
import { goodjudmentopen } from "./goodjudmentopen";
import { infer } from "./infer";
import { kalshi } from "./kalshi";
import { manifoldmarkets } from "./manifoldmarkets";
import { metaculus } from "./metaculus";
import { polymarket } from "./polymarket";
import { predictit } from "./predictit";
import { rootclaim } from "./rootclaim";
import { smarkets } from "./smarkets";
import { wildeford } from "./wildeford";
import { xrisk } from "./xrisk";

export interface Forecast {
  id: string;
  // "fantasyscotus-580"

  title: string;
  // "In Wooden v. U.S., the SCOTUS will affirm the lower court's decision"

  url: string;
  // "https://fantasyscotus.net/user-predictions/case/wooden-v-us/"

  description: string;
  // "62.50% (75 out of 120) of FantasySCOTUS players predict that the lower court's decision will be affirmed. FantasySCOTUS overall predicts an outcome of Affirm 6-3. Historically, FantasySCOTUS has chosen the correct side 50.00% of the time."
  platform: string;
  // "FantasySCOTUS"

  options: any[];
  /*
  [
    {
      "name": "Yes",
      "probability": 0.625,
      "type": "PROBABILITY"
    },
    {
      "name": "No",
      "probability": 0.375,
      "type": "PROBABILITY"
    }
  ]
  */

  timestamp: string;
  // "2022-02-11T21:42:19.291Z"

  stars?: number;
  // 2

  qualityindicators: any;
  /*
  {
    "numforecasts": 120,
    "stars": 2
  }
  */
  extra?: any;
}

// fetcher should return null if platform failed to fetch forecasts for some reason
export type PlatformFetcher = () => Promise<Forecast[] | null>;

export interface Platform {
  name: string;
  fetcher?: PlatformFetcher;
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
  givewellopenphil,
  goodjudgment,
  goodjudmentopen,
  infer,
  kalshi,
  manifoldmarkets,
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
  let results = await platform.fetcher();
  if (results && results.length) {
    await databaseUpsert({ contents: results, group: platform.name });
    console.log("Done");
  } else {
    console.log(`Platform ${platform.name} didn't return any results`);
  }
};
