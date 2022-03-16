import { NextApiRequest, NextApiResponse } from 'next/types';

import { downloadFrontpage } from '../../../backend/frontpage';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // TODO - check auth token
  if (req.method !== "POST") {
    res.status(400).send("Expected POST method");
    return;
  }
  await downloadFrontpage();
  res.status(200).send("Updated");
}
