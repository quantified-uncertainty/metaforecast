import { prisma } from "../../database/prisma";

export async function updateHistory() {
  const questions = await prisma.question.findMany({});
  await prisma.history.createMany({
    data: questions.map((q) => ({
      ...q,
      idref: q.id,
    })),
  });
}
