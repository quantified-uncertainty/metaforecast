import { Question } from "@prisma/client";

import { prisma } from "../../backend/database/prisma";
import { getFrontpage } from "../../backend/frontpage";
import { builder } from "../builder";
import { QuestionObj } from "./questions";

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
