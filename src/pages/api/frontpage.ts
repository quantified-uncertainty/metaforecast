import { NextApiRequest, NextApiResponse } from "next/types";

import { getFrontpage } from "../../backend/frontpage";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let frontpageElements = await getFrontpage();
  console.log(frontpageElements.map((element) => element.title).slice(0, 5));
  console.log("...");
  res.status(200).json(frontpageElements);
}
