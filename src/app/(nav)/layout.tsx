import React, { FC, PropsWithChildren } from "react";

import Link from "next/link";

import { ErrorBoundary } from "../../web/common/ErrorBoundary";
import { Logo2 } from "../../web/icons";
import { NavMenu } from "./NavMenu";

/* Utilities */
function calculateLastUpdate() {
  let today = new Date().toISOString();
  let yesterdayObj = new Date();
  yesterdayObj.setDate(yesterdayObj.getDate() - 1);
  let yesterday = yesterdayObj.toISOString();
  if (today.slice(11, 16) > "02:00") {
    return today.slice(0, 10);
  } else {
    return yesterday.slice(0, 10);
  }
}

/* Main */
const Layout: FC<PropsWithChildren> = ({ children }) => {
  const lastUpdated = calculateLastUpdate();
  // The correct way to do this would be by passing a prop to Layout,
  // and to get the last updating using server side props.

  return (
    <div>
      <div>
        <nav className="bg-white shadow">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex">
                <Link
                  href="/"
                  passHref
                  className="no-underline font-md justify-center items-center flex"
                >
                  <span className="mr-2">
                    <Logo2 className="mt-1 mr-1 h-8 w-8" />
                  </span>
                  <span className="text-sm sm:text-2xl text-gray-700">
                    Metaforecast
                  </span>
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

              <NavMenu />
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

export default Layout;
