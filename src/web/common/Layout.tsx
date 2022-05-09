import Head from "next/head";
import Link from "next/link";
import React, { ErrorInfo } from "react";

import { Logo2 } from "../icons";

interface MenuItem {
  page: string;
  link: string;
  title: string;
}

const menu: MenuItem[] = [
  {
    page: "search",
    link: "/",
    title: "Search",
  },
  {
    page: "tools",
    link: "/tools",
    title: "Tools",
  },
  {
    page: "about",
    link: "/about",
    title: "About",
  },
];

/* Utilities */
const calculateLastUpdate = () => {
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

interface Props {
  page: string; // id used for menu
}

/* Main */
export const Layout: React.FC<Props> = ({ page, children }) => {
  let lastUpdated = calculateLastUpdate();
  // The correct way to do this would be by passing a prop to Layout,
  // and to get the last updating using server side props.

  return (
    <div>
      <Head>
        <title>Metaforecast</title>
        <link rel="icon" href="/icons/logo.svg" />
      </Head>
      <div>
        <nav className="bg-white shadow">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex">
                <Link href="/" passHref>
                  <a className="no-underline font-md justify-center items-center flex">
                    <span className="mr-2">
                      <Logo2 className="mt-1 mr-1 h-8 w-8" />
                    </span>
                    <span className="text-sm sm:text-2xl text-gray-700">
                      Metaforecast
                    </span>
                  </a>
                </Link>
                {lastUpdated ? (
                  <div className="flex py-4 px-2 sm:ml-4">
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
                ) : null}
              </div>

              <div className="flex space-x-4">
                {menu.map((item) => (
                  <Link href={item.link} passHref key={item.page}>
                    <a
                      className={`no-underline py-4 px-2 text-sm sm:text-lg font-medium cursor-pointer border-b-2 border-transparent ${
                        page === item.page
                          ? "text-blue-700 border-blue-700"
                          : "text-gray-400 hover:text-blue-500 hover:border-blue-500"
                      }`}
                    >
                      {item.title}
                    </a>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>
        <main>
          <ErrorBoundary>
            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 mb-10">
              {children}
            </div>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};
