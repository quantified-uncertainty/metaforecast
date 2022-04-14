import SchemaBuilder from "@pothos/core";
import PrismaPlugin from "@pothos/plugin-prisma";
import RelayPlugin from "@pothos/plugin-relay";
import { Question } from "@prisma/client";

import { prisma } from "../backend/database/prisma";
import { getFrontpage } from "../backend/frontpage";

import type PrismaTypes from "@pothos/plugin-prisma/generated";
const builder = new SchemaBuilder<{
  PrismaTypes: PrismaTypes;
  Scalars: {
    Date: {
      Input: Date;
      Output: Date;
    };
  };
}>({
  plugins: [PrismaPlugin, RelayPlugin],
  prisma: {
    client: prisma,
  },
  relayOptions: {
    clientMutationId: "omit",
    cursorType: "String",
    // these are required for some reason, though it's not documented and probably a bug
    brandLoadedObjects: undefined,
    encodeGlobalID: undefined,
    decodeGlobalID: undefined,
  },
});

builder.scalarType("Date", {
  description: "Date serialized as the Unix timestamp.",
  serialize: (d) => d.getTime() / 1000,
  parseValue: (d) => {
    return new Date(d as string); // not sure if this is correct, need to check
  },
});

const QuestionObj = builder.prismaObject("Question", {
  findUnique: (question) => ({ id: question.id }),
  fields: (t) => ({
    id: t.exposeID("id"),
    title: t.exposeString("title"),
    timestamp: t.field({
      type: "Date",
      resolve: (parent) => parent.timestamp,
    }),
  }),
});

builder.queryType({
  fields: (t) => ({
    firstQuestion: t.prismaField({
      type: "Question",
      resolve: async (query, root, args, ctx, info) =>
        prisma.question.findUnique({
          ...query,
          rejectOnNotFound: true,
          where: { id: "foretold-e1ca8cc6-33a4-4e38-9ef3-553a050ba0a9" },
        }),
    }),
  }),
});

builder.queryField("frontpage", (t) =>
  t.field({
    type: [QuestionObj],
    resolve: async () => {
      const legacyQuestions = await getFrontpage();
      const ids = legacyQuestions.map((q) => q.id);
      const questions = await prisma.question.findMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      const id2q: { [k: string]: Question } = {};
      for (const q of questions) {
        id2q[q.id] = q;
      }

      return ids.map((id) => id2q[id] || null).filter((q) => q !== null);
    },
  })
);

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

export const schema = builder.toSchema({});
