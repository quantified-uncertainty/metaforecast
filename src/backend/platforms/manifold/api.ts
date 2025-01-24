import { z } from "zod";

// See https://docs.manifold.markets/api
const ENDPOINT = "https://api.manifold.markets/v0";

// via https://docs.manifold.markets/api#get-v0markets, LiteMarket type
const liteMarketSchema = z.object({
  // Unique identifier for this market
  id: z.string(),

  // Attributes about the creator
  creatorId: z.string(),
  creatorUsername: z.string(),
  creatorName: z.string(),
  creatorAvatarUrl: z.string().optional(),

  // Market attributes
  createdTime: z.number(), // When the market was created
  closeTime: z.number().optional(), // Min of creator's chosen date, and resolutionTime
  question: z.string(),

  // Note: This url always points to https://manifold.markets, regardless of what instance the api is running on.
  // This url includes the creator's username, but this doesn't need to be correct when constructing valid URLs.
  //   i.e. https://manifold.markets/Austin/test-market is the same as https://manifold.markets/foo/test-market
  url: z.string(),

  outcomeType: z.string(), // BINARY, FREE_RESPONSE, MULTIPLE_CHOICE, NUMERIC, PSEUDO_NUMERIC, BOUNTIED_QUESTION, POLL, or ...
  mechanism: z.string(), // dpm-2, cpmm-1, or cpmm-multi-1

  probability: z.number().optional(),
  pool: z.record(z.number()).optional(), // For CPMM markets, the number of shares in the liquidity pool. For DPM markets, the amount of mana invested in each answer.
  p: z.number().optional(), // CPMM markets only, probability constant in y^p * n^(1-p) = k
  totalLiquidity: z.number().optional(), // CPMM markets only, the amount of mana deposited into the liquidity pool

  value: z.number().optional(), // PSEUDO_NUMERIC markets only, the current market value, which is mapped from probability using min, max, and isLogScale.
  min: z.number().optional(), // PSEUDO_NUMERIC markets only, the minimum resolvable value
  max: z.number().optional(), // PSEUDO_NUMERIC markets only, the maximum resolvable value
  isLogScale: z.boolean().optional(), // PSEUDO_NUMERIC markets only, if true `number = (max - min + 1)^probability + minstart - 1`, otherwise `number = min + (max - min) * probability`

  volume: z.number(),
  volume24Hours: z.number(),

  isResolved: z.boolean(),
  resolutionTime: z.number().optional(),
  resolution: z.string().optional(),
  resolutionProbability: z.number().optional(), // Used for BINARY markets resolved to MKT
  uniqueBettorCount: z.number(),

  lastUpdatedTime: z.number().optional(),
  lastBetTime: z.number().optional(),

  token: z.enum(["MANA", "CASH"]).optional(), // mana or prizecash question
  siblingContractId: z.string().optional(), // id of the prizecash or mana version of this question that you get to by toggling.
});

export type ManifoldMarket = z.infer<typeof liteMarketSchema>;

async function fetchPage(endpoint: string): Promise<unknown> {
  const response = await fetch(endpoint);
  return response.json();
}

const v0MarketsSchema = z.array(liteMarketSchema);

export async function fetchAllMarkets(): Promise<ManifoldMarket[]> {
  const endpoint = `${ENDPOINT}/markets`;
  let lastId = "";
  let end = false;
  const allData = [];
  let counter = 1;
  while (!end) {
    const url = lastId ? `${endpoint}?before=${lastId}` : endpoint;
    console.log(`Query #${counter}: ${url}`);
    const newData = await fetchPage(url);

    const parsedData = v0MarketsSchema.parse(newData);

    allData.push(...parsedData);
    const hasReachedEnd =
      parsedData.length == 0 ||
      parsedData[parsedData.length - 1] == undefined ||
      parsedData[parsedData.length - 1].id == undefined;

    if (!hasReachedEnd) {
      lastId = parsedData[parsedData.length - 1].id;
    } else {
      end = true;
    }
    counter = counter + 1;
  }
  return allData;
}
