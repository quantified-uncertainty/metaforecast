import "nprogress/nprogress.css";
import "../styles/main.css";

import Router from "next/router";
import NProgress from "nprogress";

import PlausibleProvider from "next-plausible";

Router.events.on("routeChangeStart", (as, { shallow }) => {
  console.log(shallow);
  if (!shallow) {
    NProgress.start();
  }
});
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

function MyApp({ Component, pageProps }) {
  return (
    <PlausibleProvider domain="metaforecast.org">
      <Component {...pageProps} />
    </PlausibleProvider>
  );
}

export default MyApp;
