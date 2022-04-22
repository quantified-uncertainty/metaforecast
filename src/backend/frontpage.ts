import { Question } from "@prisma/client";

import { measureTime } from "./utils/measureTime";

export async function getFrontpage(): Promise<Question[]> {
  const questions = await prisma.question.findMany({
    where: {
      onFrontpage: {
        isNot: null,
      },
    },
  });
  console.log(questions.length);
  return questions;
}

export async function rebuildFrontpage() {
  await measureTime(async () => {
    const rows = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM questions
      WHERE
        (qualityindicators->>'stars')::int >= 3
        AND description != ''
        AND JSONB_ARRAY_LENGTH(options) > 0
      ORDER BY RANDOM() LIMIT 50
    `;

    await prisma.$transaction([
      prisma.frontpageId.deleteMany({}),
      prisma.frontpageId.createMany({
        data: rows,
      }),
    ]);
  });
}
