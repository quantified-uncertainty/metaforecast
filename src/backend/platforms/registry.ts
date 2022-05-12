import { betfair } from "./betfair";
import { fantasyscotus } from "./fantasyscotus";
import { foretold } from "./foretold";
import { givewellopenphil } from "./givewellopenphil";
import { goodjudgment } from "./goodjudgment";
import { goodjudgmentopen } from "./goodjudgmentopen";
import { guesstimate } from "./guesstimate";
import { Platform, PlatformConfig } from "./index";
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

export const platforms: Platform<string>[] = [
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

// get frontend-safe version of platforms data

export const getPlatformsConfig = (): PlatformConfig[] => {
  const platformsConfig = platforms.map((platform) => ({
    name: platform.name,
    label: platform.label,
    color: platform.color,
  }));

  return platformsConfig;
};
