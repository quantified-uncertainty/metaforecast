import {NextApiRequest, NextApiResponse} from "next";

// apollo-server-micro is problematic since v3, see https://github.com/apollographql/apollo-server/issues/5547, so we use graphql-yoga instead
import {createYoga} from "graphql-yoga";
import {useResponseCache} from '@graphql-yoga/plugin-response-cache'

import {schema} from "../../graphql/schema";

const server = createYoga < {
  req: NextApiRequest;
  res: NextApiResponse;
} > ({
  schema,
  graphqlEndpoint: '/api/graphql',
  plugins: [useResponseCache(
      { // global cache
        session: () => null,
        ttl: 2 * 60 * 60 * 1000,
        // ^ 2h * 60 mins per hour, 60 seconds per min 1000 miliseconds per second
      }
    )]
});

export default server;
