import Head from "next/head";
import Link from "next/link";
import React, { ErrorInfo } from "react";

import { Logo2 } from "../icons/index";

/* Utilities */
const classNameSelected = (isSelected: boolean) =>
  `no-underline py-4 px-2 ml-4 text-md font-medium cursor-pointer border-b-2 border-transparent ${
    isSelected
      ? "text-blue-700 border-blue-700"
      : "text-gray-400 hover:text-blue-500 hover:border-blue-500"
  }`;

let calculateLastUpdate = () => {
  let today = new Date().toISOString();
  let yesterdayObj = new Date();
  yesterdayObj.setDate(yesterdayObj.getDate() - 1);
  let yesterday = yesterdayObj.toISOString();
  if (today.slice(11, 16) > "02:00") {
    return today.slice(0, 10);
  } else {
    return yesterday.slice(0, 10);
  }
};

// Error catcher
class ErrorBoundary extends React.Component<
  {},
  { error: any; errorInfo: any }
> {
  // https://reactjs.org/docs/error-boundaries.html
  constructor(props: {}) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Catch errors in any components below and re-render with error message
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
    // You can also log error messages to an error reporting service here
  }

  render() {
    if (this.state.errorInfo) {
      // Error path
      return (
        <div>
          <h2>Something went wrong. </h2>
          <details style={{ whiteSpace: "pre-wrap" }}>
            {
              "You should angrily tweet at @NunoSempere about this. or send an email to nuno.semperelh@gmail.com"
            }
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }
    // Normally, just render children
    return this.props.children;
  }
}

/* Main */
export default function Layout({ page, children }) {
  let lastUpdated = calculateLastUpdate();
  // The correct way to do this would be by passing a prop to Layout,
  // and to get the last updating using server side props.

  const refreshPage = () => {
    // window.location.reload(true);
    // window.location.replace(window.location.pathname);
    // window.location.reload();
    // https://developer.mozilla.org/en-US/docs/Web/API/Location/reload
    // https://developer.mozilla.org/en-US/docs/Web/API/Location/replace
    // https://developer.mozilla.org/en-US/docs/Web/API/Location/assign
    // window.location.hostname
    if (typeof window !== "undefined") {
      if ((window.location as any) != window.location.pathname) {
        window.location.assign(window.location.pathname);
      }
    }
  };
  return (
    <div>
      <Head>
        <title>Metaforecast</title>
        <link rel="icon" href="/icons/logo.svg" />
      </Head>
      <div>
        <nav className="bg-white shadow">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="items-center justify-between flex">
              <div className="flex sm:flex-row">
                <button onClick={refreshPage}>
                  <a className="no-underline font-md justify-center items-center flex">
                    <span className="mr-2 sm:text-lg text-blue-800">
                      <Logo2 className="mt-1 mr-1 h-8 w-8" />
                    </span>
                    <span className="text-sm sm:text-2xl text-gray-700">
                      Metaforecast
                    </span>
                  </a>
                </button>
                <div
                  className={`flex py-4 px-2 sm:ml-4 text-base text-gray-400 ${
                    lastUpdated || "hidden"
                  }`}
                >
                  <div className="hidden sm:inline-flex items-center text-gray-700">
                    <svg className="ml-4 mr-1 mt-1" height="10" width="16">
                      <circle cx="4" cy="4" r="4" fill="rgb(29, 78, 216)" />
                    </svg>

                    <span>{`Last updated: ${
                      lastUpdated && !!lastUpdated.slice
                        ? lastUpdated.slice(0, 10)
                        : "unknown"
                    }`}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-row-reverse items-start space-x-4 text-sm sm:text-lg md:text-lg lg:text-lg">
                <Link href={`/about`} passHref>
                  <a className={classNameSelected(page === "about")}>About</a>
                </Link>
                <Link href={`/tools`} passHref>
                  <a className={classNameSelected(page === "tools")}>Tools</a>
                </Link>
                <Link href={`/`} passHref>
                  <a className={classNameSelected(page === "search")}>Search</a>
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main>
          <ErrorBoundary>
            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left pt-5">
              {children}
            </div>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
