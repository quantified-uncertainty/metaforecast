import { initUrqlClient } from "next-urql";
import { cacheExchange, dedupExchange, fetchExchange, ssrExchange } from "urql";

import { getBasePath } from "./utils";

export const graphqlEndpoint = `${getBasePath()}/api/graphql`;

// for getServerSideProps/getStaticProps only
export const ssrUrql = () => {
  const ssrCache = ssrExchange({ isClient: false });
  const client = initUrqlClient(
    {
      url: graphqlEndpoint,
      exchanges: [dedupExchange, cacheExchange, ssrCache, fetchExchange],
    },
    false
  );
  return [ssrCache, client] as const;
};
