import algoliasearch from "algoliasearch";

import { Question } from "@prisma/client";

import { prisma } from "../database/prisma";
import { platformNameToLabel } from "../platforms/registry";

const cookie = process.env.ALGOLIA_MASTER_API_KEY || "";
const algoliaAppId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || "";
const client = algoliasearch(algoliaAppId, cookie);
const index = client.initIndex("metaforecast");

export type AlgoliaQuestion = Omit<Question, "fetched" | "firstSeen"> & {
  fetched: string;
  firstSeen: string;
  optionsstringforsearch?: string;
  platformLabel: string;
  objectID: string;
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

export const questionToAlgoliaQuestion = (
  question: Question
): AlgoliaQuestion => {
  return {
    ...question,
    fetched: question.fetched.toISOString(),
    firstSeen: question.firstSeen.toISOString(),
    platformLabel: platformNameToLabel(question.platform),
    objectID: question.id,
    optionsstringforsearch: getoptionsstringforsearch(question),
  };
};

export async function rebuildAlgoliaDatabase() {
  const questions = await prisma.question.findMany();

  const records: AlgoliaQuestion[] = questions.map(questionToAlgoliaQuestion);

  if (await index.exists()) {
    console.log("Index exists");
    await index.replaceAllObjects(records, { safe: true });
    console.log(
      `Pushed ${records.length} records. Algolia will update asynchronously`
    );
  }
}
