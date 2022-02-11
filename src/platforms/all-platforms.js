import { betfair } from "./betfair-fetch.js";
import { fantasyscotus } from "./fantasyscotus-fetch.js";
import { foretold } from "./foretold-fetch.js";
import { goodjudgment } from "./goodjudgment-fetch.js";
import { goodjudgmentopen } from "./goodjudmentopen-fetch.js";
import { infer } from "./infer-fetch.js";
import { kalshi } from "./kalshi-fetch.js";
import { manifoldmarkets } from "./manifoldmarkets-fetch.js";
import { metaculus } from "./metaculus-fetch.js";
import { polymarket } from "./polymarket-fetch.js";
import { predictit } from "./predictit-fetch.js";
import { rootclaim } from "./rootclaim-fetch.js";
import { smarkets } from "./smarkets-fetch.js";
import { wildeford } from "./wildeford-fetch.js";

/* Deprecated
import { astralcodexten } from "../platforms/astralcodexten-fetch.js"
import { coupcast } from "../platforms/coupcast-fetch.js"
import { csetforetell } from "../platforms/csetforetell-fetch.js"
import { elicit } from "../platforms/elicit-fetch.js"
import { estimize } from "../platforms/estimize-fetch.js"
import { hypermind } from "../platforms/hypermind-fetch.js"
import { ladbrokes } from "../platforms/ladbrokes-fetch.js";
import { williamhill } from "../platforms/williamhill-fetch.js";
*/

export const platformFetchers = [
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
];
export const platformNames = [
  "betfair",
  "fantasyscotus",
  "foretold",
  "givewellopenphil",
  "goodjudgment",
  "goodjudmentopen",
  "infer",
  "kalshi",
  "manifoldmarkets",
  "metaculus",
  "polymarket",
  "predictit",
  "rootclaim",
  "smarkets",
  "wildeford",
  "xrisk",
];
// deprecated: "astralcodexten", "csetforetell", "coupcast", "elicit", "estimize", "hypermind", "ladbrokes", "omen", "williamhill", etc
