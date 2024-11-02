"use client";
import "../styles/main.css";

import { PropsWithChildren, useMemo } from "react";

import PlausibleProvider from "next-plausible";

import { createClient, ssrExchange, UrqlProvider } from "@urql/next";

import { getUrqlClientOptions } from "../web/urql";

export default function Layout({ children }: PropsWithChildren) {
  const [client, ssr] = useMemo(() => {
    const ssr = ssrExchange({
      isClient: typeof window !== "undefined",
    });
    const client = createClient({
      ...getUrqlClientOptions(ssr),
      // this causes an infinite loop for some reason; also not sure if necessary with modern React
      //   suspense: true,
    });

    return [client, ssr];
  }, []);

  return (
    <html>
      <body>
        <PlausibleProvider domain="metaforecast.org">
          <UrqlProvider client={client} ssr={ssr}>
            {children}
          </UrqlProvider>
        </PlausibleProvider>
      </body>
    </html>
  );
}
