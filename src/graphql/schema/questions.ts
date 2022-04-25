import { prisma } from "../../backend/database/prisma";
import { platforms, QualityIndicators } from "../../backend/platforms";
import { builder } from "../builder";

const PlatformObj = builder.objectRef<string>("Platform").implement({
  description: "Forecasting platform supported by Metaforecast",
  fields: (t) => ({
    id: t.id({
      description: 'Short unique platform name, e.g. "xrisk"',
      resolve: (x) => x,
    }),
    label: t.string({
      description:
        'Platform name for displaying on frontend etc., e.g. "X-risk estimates"',
      resolve: (platformName) => {
        if (platformName === "metaforecast") {
          return "Metaforecast";
        }
        if (platformName === "guesstimate") {
          return "Guesstimate";
        }
        // kinda slow and repetitive, TODO - store a map {name => platform} somewhere and `getPlatform` util function?
        const platform = platforms.find((p) => p.name === platformName);
        if (!platform) {
          throw new Error(`Unknown platform ${platformName}`);
        }
        return platform.label;
      },
    }),
  }),
});

export const QualityIndicatorsObj = builder
  .objectRef<QualityIndicators>("QualityIndicators")
  .implement({
    description: "Various indicators of the question's quality",
    fields: (t) => {
      const maybeIntField = (name: keyof QualityIndicators) =>
        t.int({
          nullable: true,
          resolve: (parent) =>
            parent[name] === undefined ? undefined : Number(parent[name]),
        });
      const maybeFloatField = (name: keyof QualityIndicators) =>
        t.float({
          nullable: true,
          resolve: (parent) =>
            parent[name] === undefined ? undefined : Number(parent[name]),
        });

      return {
        stars: t.exposeInt("stars", {
          description: "0 to 5",
        }),
        numForecasts: maybeIntField("numforecasts"),
        numForecasters: maybeIntField("numforecasters"),
        volume: maybeFloatField("volume"),
        // yesBid: maybeNumberField("yes_bid"),
        // yesAsk: maybeNumberField("yes_ask"),
        spread: maybeFloatField("spread"),
        sharesVolume: maybeFloatField("shares_volume"),
        openInterest: maybeFloatField("open_interest"),
        liquidity: maybeFloatField("liquidity"),
        tradeVolume: maybeFloatField("trade_volume"),
      };
    },
  });

export const ProbabilityOptionObj = builder
  .objectRef<{ name: string; probability: number }>("ProbabilityOption")
  .implement({
    fields: (t) => ({
      name: t.exposeString("name", { nullable: true }),
      probability: t.exposeFloat("probability", {
        description: "0 to 1",
        nullable: true,
      }),
    }),
  });

export const QuestionObj = builder.prismaObject("Question", {
  findUnique: (question) => ({ id: question.id }),
  fields: (t) => ({
    id: t.exposeID("id", {
      description: "Unique string which identifies the question",
    }),
    title: t.exposeString("title"),
    description: t.exposeString("description"),
    url: t.exposeString("url", {
      description:
        "Non-unique, a very small number of platforms have a page for more than one prediction",
    }),
    timestamp: t.field({
      type: "Date",
      description: "Timestamp at which metaforecast fetched the question",
      resolve: (parent) => parent.timestamp,
    }),
    platform: t.field({
      type: PlatformObj,
      resolve: (parent) => parent.platform,
    }),
    qualityIndicators: t.field({
      type: QualityIndicatorsObj,
      resolve: (parent) => parent.qualityindicators as any as QualityIndicators,
    }),
    options: t.field({
      type: [ProbabilityOptionObj],
      resolve: ({ options }) => {
        if (!Array.isArray(options)) {
          return [];
        }
        return options as any[];
      },
    }),
    visualization: t.string({
      resolve: (parent) => (parent.extra as any)?.visualization, // used for guesstimate only, see searchGuesstimate.ts
      nullable: true,
    }),
  }),
});

builder.queryField("questions", (t) =>
  t.prismaConnection(
    {
      type: "Question",
      cursor: "id",
      maxSize: 1000,
      resolve: (query, parent, args, context, info) =>
        prisma.question.findMany({ ...query }),
    },
    {},
    {}
  )
);

builder.queryField("question", (t) =>
  t.field({
    type: QuestionObj,
    description: "Look up a single question by its id",
    args: {
      id: t.arg({ type: "ID", required: true }),
    },
    resolve: async (parent, args) => {
      return await prisma.question.findUnique({
        where: {
          id: String(args.id),
        },
      });
    },
  })
);
