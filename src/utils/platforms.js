import { betfair } from "../platforms/betfair-fetch.js"
import { fantasyscotus } from "../platforms/fantasyscotus-fetch.js"
import { foretold } from "../platforms/foretold-fetch.js"
import { goodjudgment } from "../platforms/goodjudgment-fetch.js"
import { goodjudgmentopen } from "../platforms/goodjudmentopen-fetch.js"
import { infer } from "../platforms/infer-fetch.js"
import { kalshi } from "../platforms/kalshi-fetch.js"
import { ladbrokes } from "../platforms/ladbrokes-fetch.js"
import { manifoldmarkets } from "../platforms/manifoldmarkets-fetch.js"
import { metaculus } from "../platforms/metaculus-fetch.js"
import { polymarket } from "../platforms/polymarket-fetch.js"
import { predictit } from "../platforms/predictit-fetch.js"
import { rootclaim } from "../platforms/rootclaim-fetch.js"
import { smarkets } from "../platforms/smarkets-fetch.js"
import { wildeford } from "../platforms/wildeford-fetch.js"
import { williamhill } from "../platforms/williamhill-fetch.js"

/* Deprecated
import { astralcodexten } from "../platforms/astralcodexten-fetch.js"
import { csetforetell } from "../platforms/csetforetell-fetch.js"
import { elicit } from "../platforms/elicit-fetch.js"
import { estimize } from "../platforms/estimize-fetch.js"
import { hypermind } from "../platforms/hypermind-fetch.js"
import { coupcast } from "../platforms/coupcast-fetch.js"
*/

export const platformFetchers = [betfair, fantasyscotus, foretold, goodjudgment, goodjudgmentopen, infer, ladbrokes, kalshi, manifoldmarkets, metaculus, polymarket, predictit, rootclaim, smarkets, wildeford, williamhill]
export const platformNames = [
  "betfair",
  "fantasyscotus",
  "foretold",
  "givewellopenphil",
  "goodjudgment",
  "goodjudmentopen",
  "kalshi",
  "ladbrokes",
  "manifoldmarkets",
  "metaculus",
  "polymarket",
  "predictit",
  "rootclaim",
  "smarkets",
  "wildeford",
  "williamhill",
  "xrisk",
];
// deprecated: "astralcodexten", "csetforetell", "coupcast", "elicit", "estimize", "hypermind", "omen", etc