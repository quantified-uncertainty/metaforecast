import algoliasearch from "algoliasearch";

import { Question } from "@prisma/client";

import { prisma } from "../database/prisma";
import { platforms } from "../platforms";

let cookie = process.env.ALGOLIA_MASTER_API_KEY || "";
const algoliaAppId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || "";
const client = algoliasearch(algoliaAppId, cookie);
const index = client.initIndex("metaforecast");

export type AlgoliaQuestion = Omit<Question, "timestamp"> & {
  timestamp: string;
  optionsstringforsearch?: string;
};

const getoptionsstringforsearch = (record: Question): string => {
  let result = "";
  if (!!record.options && (record.options as any[]).length > 0) {
    result = (record.options as any[])
      .map((option: any) => option.name || null)
      .filter((x: any) => x != null)
      .join(", ");
  }
  return result;
};

export async function rebuildAlgoliaDatabase() {
  const questions = await prisma.question.findMany();

  const platformNameToLabel = Object.fromEntries(
    platforms.map((platform) => [platform.name, platform.label])
  );

  const records: AlgoliaQuestion[] = questions.map(
    (question, index: number) => ({
      ...question,
      timestamp: `${question.timestamp}`,
      platformLabel:
        platformNameToLabel[question.platform] || question.platform,
      objectID: index,
      optionsstringforsearch: getoptionsstringforsearch(question),
    })
  );

  if (await index.exists()) {
    console.log("Index exists");
    await index.replaceAllObjects(records, { safe: true });
    console.log(
      `Pushed ${records.length} records. Algolia will update asynchronously`
    );
  }
}
