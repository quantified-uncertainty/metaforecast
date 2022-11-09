import { NextApiRequest, NextApiResponse } from "next";

// apollo-server-micro is problematic since v3, see https://github.com/apollographql/apollo-server/issues/5547, so we use graphql-yoga instead
import { createYoga } from "@graphql-yoga";

import { schema } from "../../graphql/schema";

const server = createYoga<{
  req: NextApiRequest;
  res: NextApiResponse;
}>({ schema });

export default server;
