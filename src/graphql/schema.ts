import SchemaBuilder from "@pothos/core";

import { getFrontpage } from "../backend/frontpage";
import { Question } from "../backend/platforms";

const builder = new SchemaBuilder({});

const QuestionObj = builder.objectRef<Question>("Question").implement({
  description: "Forecast question.",
  fields: (t) => ({
    id: t.exposeString("id", {}),
    title: t.exposeString("title", {}),
  }),
});

builder.queryField("frontpage", (t) =>
  t.field({
    type: [QuestionObj],
    resolve: async (parent) => {
      return await getFrontpage();
    },
  })
);

export const schema = builder.toSchema({});
