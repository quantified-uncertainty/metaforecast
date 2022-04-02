import { NextApiRequest, NextApiResponse } from "next/types";

import { getFrontpageFull } from "../../backend/frontpage";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let frontpageFull = await getFrontpageFull();
  console.log(frontpageFull.map((element) => element.title).slice(0, 5));
  console.log("...");
  res.status(200).json(frontpageFull);
}
