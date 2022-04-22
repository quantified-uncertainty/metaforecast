import { initUrqlClient, SSRExchange } from "next-urql";
import { cacheExchange, dedupExchange, fetchExchange, ssrExchange } from "urql";
import customScalarsExchange from "urql-custom-scalars-exchange";

import schema from "../graphql/introspection.json";
import { getBasePath } from "./utils";

export const graphqlEndpoint = `${getBasePath()}/api/graphql`;

const scalarsExchange = customScalarsExchange({
  // Types don't match for some reason.
  // Related:
  // - https://github.com/apollographql/apollo-tooling/issues/1491
  // - https://spectrum.chat/urql/help/schema-property-kind-is-missing-in-type~29c8f416-068c-485a-adf1-935686b99d05
  schema: schema as any,
  scalars: {
    /* not compatible with next.js serialization limitations, unfortunately */
    // Date(value: number) {
    //   return new Date(value * 1000);
    // },
  },
});

export const getUrqlClientOptions = (ssr: SSRExchange) => ({
  url: graphqlEndpoint,
  exchanges: [
    dedupExchange,
    scalarsExchange,
    cacheExchange,
    ssr,
    fetchExchange,
  ],
});

// for getServerSideProps/getStaticProps only
export const ssrUrql = () => {
  const ssrCache = ssrExchange({ isClient: false });
  const client = initUrqlClient(getUrqlClientOptions(ssrCache), false);
  return [ssrCache, client] as const;
};
