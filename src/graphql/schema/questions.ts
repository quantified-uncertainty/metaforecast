import { prisma } from "../../backend/database/prisma";
import { platforms, QualityIndicators } from "../../backend/platforms";
import { builder } from "../builder";

const PlatformObj = builder.objectRef<string>("Platform").implement({
  description: "Platform supported by metaforecast",
  fields: (t) => ({
    label: t.string({
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
    id: t.id({
      resolve: (x) => x,
    }),
  }),
});

export const QualityIndicatorsObj = builder
  .objectRef<QualityIndicators>("QualityIndicators")
  .implement({
    description: "Various indicators of the question's quality",
    fields: (t) => ({
      stars: t.exposeInt("stars"),
      numForecasts: t.int({
        nullable: true,
        resolve: (parent) =>
          parent.numforecasts === undefined
            ? undefined
            : Number(parent.numforecasts),
      }),
    }),
  });

export const ProbabilityOptionObj = builder
  .objectRef<{ name: string; probability: number }>("ProbabilityOption")
  .implement({
    fields: (t) => ({
      name: t.exposeString("name", { nullable: true }),
      probability: t.exposeFloat("probability", { nullable: true }), // number, 0 to 1
    }),
  });

export const QuestionObj = builder.prismaObject("Question", {
  findUnique: (question) => ({ id: question.id }),
  fields: (t) => ({
    id: t.exposeID("id"),
    title: t.exposeString("title"),
    description: t.exposeString("description"),
    url: t.exposeString("url"),
    timestamp: t.field({
      type: "Date",
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
      resolve: (parent) => (parent.extra as any)?.visualization,
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
