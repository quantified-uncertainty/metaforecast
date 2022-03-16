/* Imports */

import React from 'react';

import { getFrontpage } from '../backend/frontpage';
import CommonDisplay from '../web/display/commonDisplay';
import { displayForecastsWrapperForSearch } from '../web/display/displayForecastsWrappers';
import { platformsWithLabels } from '../web/platforms.js';
import searchAccordingToQueryData from '../web/worker/searchAccordingToQueryData.js';
import Layout from './layout.js';

/* get Props */

export async function getServerSideProps(context) {
  let urlQuery = context.query; // this is an object, not a string which I have to parse!!

  let initialQueryParameters = {
    query: "",
    starsThreshold: 2,
    numDisplay: 21, // 20
    forecastsThreshold: 0,
    forecastingPlatforms: platformsWithLabels, // weird key value format,
    ...urlQuery,
  };

  let frontPageForecasts = await getFrontpage();
  let initialResults;
  let props;
  switch (
    !!initialQueryParameters &&
    initialQueryParameters.query != "" &&
    initialQueryParameters.query != undefined
  ) {
    case true:
      initialResults = await searchAccordingToQueryData(initialQueryParameters);
      props = {
        initialQueryParameters: initialQueryParameters,
        initialResults: initialResults,
        defaultResults: frontPageForecasts, // different from initialResults!
        urlQuery: urlQuery,
      };
      break;
    default:
      initialResults = frontPageForecasts;
      props = {
        initialQueryParameters: initialQueryParameters,
        initialResults: initialResults,
        defaultResults: frontPageForecasts, // different from initialResults!
        urlQuery: urlQuery,
      };
      break;
  }

  return {
    props: props,
  };
}

/* Alternative: getStaticProps
export async function getStaticProps() {
  // get frontPageForecasts somehow.
  let lastUpdated = calculateLastUpdate(); // metaforecasts.find(forecast => forecast.platform == "Good Judgment Open").timestamp
  let initialQueryParameters = {
    query: "",
    processedUrlYet: false,
    starsThreshold: 2,
    numDisplay: 21, // 20
    forecastsThreshold: 0,
    forecastingPlatforms: platforms,
  };
  return {
    props: {
      frontPageForecasts,
      lastUpdated,
    },
  };
}
*/

/* Body */
export default function Home({
  initialResults,
  defaultResults,
  initialQueryParameters,
}) {
  return (
    <Layout key="index" page={"search"}>
      <CommonDisplay
        initialResults={initialResults}
        defaultResults={defaultResults}
        initialQueryParameters={initialQueryParameters}
        hasSearchbar={true}
        hasCapture={false}
        hasAdvancedOptions={true}
        placeholder={"Find forecasts about..."}
        setHasDisplayBeenCapturedOnChangeSearchInputs={() => null}
        displaySeeMoreHint={true}
        displayForecastsWrapper={displayForecastsWrapperForSearch}
      />
    </Layout>
  );
}
