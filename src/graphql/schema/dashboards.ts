import { Dashboard } from "@prisma/client";

import { prisma } from "../../backend/database/prisma";
import { hash } from "../../backend/utils/hash";
import { builder } from "../builder";
import { QuestionObj } from "./questions";

const DashboardObj = builder.objectRef<Dashboard>("Dashboard").implement({
  fields: (t) => ({
    id: t.exposeID("id"),
    title: t.exposeString("title"),
    description: t.exposeString("description"),
    creator: t.exposeString("creator"),
    questions: t.field({
      type: [QuestionObj],
      resolve: async (parent) => {
        return await prisma.question.findMany({
          where: {
            id: {
              in: parent.contents as string[],
            },
          },
        });
      },
    }),
  }),
});

builder.queryField("dashboard", (t) =>
  t.field({
    type: DashboardObj,
    args: {
      id: t.arg({ type: "ID", required: true }),
    },
    resolve: async (parent, args) => {
      return await prisma.dashboard.findUnique({
        where: {
          id: String(args.id),
        },
      });
    },
  })
);

const CreateDashboardResult = builder
  .objectRef<{ dashboard: Dashboard }>("CreateDashboardResult")
  .implement({
    fields: (t) => ({
      dashboard: t.field({
        type: DashboardObj,
        resolve: (parent) => parent.dashboard,
      }),
    }),
  });

const CreateDashboardInput = builder.inputType("CreateDashboardInput", {
  fields: (t) => ({
    title: t.string({ required: true }),
    description: t.string(),
    creator: t.string(),
    ids: t.idList({ required: true }),
  }),
});

builder.mutationField("createDashboard", (t) =>
  t.field({
    type: CreateDashboardResult,
    args: {
      input: t.arg({ type: CreateDashboardInput, required: true }),
    },
    resolve: async (parent, args) => {
      const id = hash(JSON.stringify(args.input.ids));
      const dashboard = await prisma.dashboard.create({
        data: {
          id,
          title: args.input.title,
          description: args.input.description || "",
          creator: args.input.creator || "",
          contents: args.input.ids,
          extra: [],
          timestamp: new Date(),
        },
      });
      return {
        dashboard,
      };
    },
  })
);
