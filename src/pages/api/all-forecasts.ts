import { NextApiRequest, NextApiResponse } from 'next/types';

import { getFrontpageFullRaw } from '../../backend/frontpage';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let frontpageFull = await getFrontpageFullRaw();
  console.log(frontpageFull.map((element) => element.title).slice(0, 5));
  console.log("...");
  res.status(200).json(frontpageFull);
}
