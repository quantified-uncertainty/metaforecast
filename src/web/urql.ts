import { cacheExchange, fetchExchange } from "urql";

import customScalarsExchange from "@atmina/urql-custom-scalars-exchange";
import { createClient } from "@urql/core";
// import { initUrqlClient, SSRExchange } from "next-urql";
import { SSRExchange } from "@urql/next";
import { registerUrql } from "@urql/next/rsc";

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

export function getUrqlClientOptions(ssr: SSRExchange) {
  return {
    url: graphqlEndpoint,
    exchanges: [scalarsExchange, cacheExchange, ssr, fetchExchange],
  };
}

export function getUrqlRscClient() {
  const makeClient = () => {
    return createClient({
      url: graphqlEndpoint,
      exchanges: [scalarsExchange, cacheExchange, fetchExchange],
    });
  };

  const { getClient } = registerUrql(makeClient);

  return getClient();
}

// // for getServerSideProps/getStaticProps only
// export const ssrUrql = () => {
//   const ssrCache = ssrExchange({ isClient: false });
//   const client = initUrqlClient(getUrqlClientOptions(ssrCache), false);
//   if (!client) {
//     throw new Error("Expected non-null client instance from initUrqlClient");
//   }
//   return [ssrCache, client] as const;
// };
