import "nprogress/nprogress.css";
import "../styles/main.css";

import PlausibleProvider from "next-plausible";
import { withUrqlClient } from "next-urql";
import { AppProps } from "next/app";
import Router from "next/router";
import NProgress from "nprogress";

import { getUrqlClientOptions } from "../web/urql";

Router.events.on("routeChangeStart", (as, { shallow }) => {
  if (!shallow) {
    NProgress.start();
  }
});
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <PlausibleProvider domain="metaforecast.org">
      <Component {...pageProps} />
    </PlausibleProvider>
  );
}

export default withUrqlClient((ssr) => getUrqlClientOptions(ssr), {
  ssr: false,
})(MyApp);
