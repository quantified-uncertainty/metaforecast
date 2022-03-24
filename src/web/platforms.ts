export const distinctColors = [
  "#3d674a",
  "#231149",
  "#62520b",
  "#32407e",
  "#7d4f1b",
  "#002455",
  "#223900",
  "#615691",
  "#003419",
  "#793466",
  "#006669",
  "#984158",
  "#00314e",
  "#460c00",
  "#0d1624",
  "#6f5b41",
  "#240d23",
  "#272600",
  "#755469",
  "#2a323d",
];

// https://medialab.github.io/iwanthue/ fancy light background
export const platformNames = [
  "Betfair",
  "FantasySCOTUS",
  "Foretold",
  "GiveWell/OpenPhilanthropy",
  "Good Judgment",
  "Good Judgment Open",
  "Guesstimate",
  "Infer",
  "Kalshi",
  "Manifold Markets",
  "Metaculus",
  "Peter Wildeford",
  "PolyMarket",
  "PredictIt",
  "Rootclaim",
  "Smarkets",
  "X-risk estimates",
];

export interface PlatformWithLabel {
  value: string;
  label: string;
  color: string;
}

export const platformsWithLabels: PlatformWithLabel[] = platformNames.map(
  (name, i) => ({
    value: name,
    label: name,
    color: distinctColors[i],
  })
);

export const platforms = platformsWithLabels;

// Deprecated: AstralCodexTen, CoupCast, CSET-foretell, Estimize, Elicit, Hypermind, Omen, WilliamHill
