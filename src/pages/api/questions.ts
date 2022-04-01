import { NextApiRequest, NextApiResponse } from "next/types";

import { pgRead } from "../../backend/database/pg-wrapper";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let allQuestions = await pgRead({ tableName: "questions" });
  console.log(allQuestions.map((element) => element.title).slice(0, 5));
  console.log("...");
  res.status(200).json(allQuestions);
}
