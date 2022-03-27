import { betfair } from '../betfair-fetch';
import { fantasyscotus } from '../fantasyscotus-fetch';
import { foretold } from '../foretold-fetch';
import { goodjudgment } from '../goodjudgment-fetch';
import { goodjudgmentopen } from '../goodjudmentopen-fetch';
import { infer } from '../infer-fetch';
import { kalshi } from '../kalshi-fetch';
import { manifoldmarkets } from '../manifoldmarkets-fetch';
import { metaculus } from '../metaculus-fetch';
import { polymarket } from '../polymarket-fetch';
import { predictit } from '../predictit-fetch';
import { rootclaim } from '../rootclaim-fetch';
import { smarkets } from '../smarkets-fetch';
import { wildeford } from '../wildeford-fetch';

/* Deprecated
import { astralcodexten } from "../platforms/astralcodexten-fetch"
import { coupcast } from "../platforms/coupcast-fetch"
import { csetforetell } from "../platforms/csetforetell-fetch"
import { elicit } from "../platforms/elicit-fetch"
import { estimize } from "../platforms/estimize-fetch"
import { hypermind } from "../platforms/hypermind-fetch"
import { ladbrokes } from "../platforms/ladbrokes-fetch";
import { williamhill } from "../platforms/williamhill-fetch";
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
