import { NextApiRequest, NextApiResponse } from "next/types";

import { getFrontpage } from "../../backend/frontpage";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let frontpageElements = await getFrontpage();
  res.status(200).json(frontpageElements);
}
