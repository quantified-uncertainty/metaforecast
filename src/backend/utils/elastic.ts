import { Client as ElasticClient } from "@elastic/elasticsearch";
import { Question } from "@prisma/client";

import { prisma } from "../database/prisma";
import { platformNameToLabel } from "../platforms/registry";

const client = new ElasticClient({
  node: process.env.ELASTIC_HOST,
  auth: {
    username: process.env.ELASTIC_USER!,
    password: process.env.ELASTIC_PASSWORD!,
  },
});

const INDEX_NAME = process.env.ELASTIC_INDEX!;

export type ElasticQuestion = Omit<Question, "fetched" | "firstSeen"> & {
  fetched: string;
  firstSeen: string;
  optionsstringforsearch?: string;
  platformLabel: string;
  objectID: string;
};

function getoptionsstringforsearch(record: Question): string {
  let result = "";
  if (!!record.options && (record.options as any[]).length > 0) {
    result = (record.options as any[])
      .map((option: any) => option.name || null)
      .filter((x: any) => x != null)
      .join(", ");
  }
  return result;
}

export function questionToElasticDocument(question: Question): ElasticQuestion {
  return {
    ...question,
    fetched: question.fetched.toISOString(),
    firstSeen: question.firstSeen.toISOString(),
    platformLabel: platformNameToLabel(question.platform),
    objectID: question.id,
    optionsstringforsearch: getoptionsstringforsearch(question),
  };
}

export async function rebuildElasticDatabase() {
  const questions = await prisma.question.findMany();

  if (!(await client.indices.exists({ index: INDEX_NAME }))) {
    console.log("Creating an index");
    await client.indices.create({ index: INDEX_NAME });
  } else {
    console.log("Index exists");
  }

  let count = 0;
  let operations: { id: string; document: ElasticQuestion }[] = [];

  const flush = async () => {
    if (!operations.length) return;
    await client.bulk({
      operations: operations.flatMap((op) => [
        { index: { _index: INDEX_NAME, _id: op.id } },
        op.document,
      ]),
    });
    count += operations.length;
    console.log(count);
    operations = [];
  };

  for (const question of questions) {
    operations.push({
      id: question.id,
      document: questionToElasticDocument(question),
    });
    if (operations.length >= 100) {
      await flush();
    }
  }
  await flush();

  console.log(`Pushed ${questions.length} records to Elasticsearch.`);
}
