import { Dashboard } from "@prisma/client";

import { prisma } from "../../backend/database/prisma";
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
