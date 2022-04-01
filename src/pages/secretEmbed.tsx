/* Imports */

import React from "react";

import { displayForecast } from "../web/display/displayForecasts";
import { FrontendForecast } from "../web/platforms";
import searchAccordingToQueryData from "../web/worker/searchAccordingToQueryData";

/* Helper functions */

export async function getServerSideProps(context) {
  let urlQuery = context.query; // this is an object, not a string which I have to parse!!

  let initialQueryParameters = {
    query: "",
    starsThreshold: 2,
    forecastsThreshold: 0,
    ...urlQuery,
  };

  let results: FrontendForecast[] = [];
  if (initialQueryParameters.query != "") {
    results = await searchAccordingToQueryData(initialQueryParameters, 1);
  }

  return {
    props: {
      results: results,
    },
  };
}

/* Body */
export default function Home({ results }) {
  /* Final return */
  let result = results ? results[0] : null;

  return (
    <>
      <div className="mb-4 mt-8 flex flex-row justify-center items-center ">
        <div className="w-6/12 place-self-center">
          <div>
            <div id="secretEmbed">
              {result
                ? displayForecast({
                    ...result,
                    showTimeStamp: true,
                    expandFooterToFullWidth: true,
                  })
                : null}
            </div>
            <br></br>
            <div id="secretObject">
              {result ? JSON.stringify(result.item, null, 4) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
