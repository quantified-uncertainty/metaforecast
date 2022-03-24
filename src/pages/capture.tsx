import { GetServerSideProps } from 'next';
import React from 'react';

import { getFrontpage } from '../backend/frontpage';
import CommonDisplay, { QueryParameters } from '../web/display/commonDisplay';
import { displayForecastsWrapperForCapture } from '../web/display/displayForecastsWrappers';
import { platformsWithLabels } from '../web/platforms';
import searchAccordingToQueryData from '../web/worker/searchAccordingToQueryData';
import Layout from './layout';

/* get Props */

export const getServerSideProps: GetServerSideProps = async (context) => {
  let urlQuery = context.query;

  let initialQueryParameters: QueryParameters = {
    query: "",
    numDisplay: 21,
    starsThreshold: 2,
    forecastsThreshold: 0,
    forecastingPlatforms: platformsWithLabels, // weird key value format,
    ...urlQuery,
  };

  let frontPageForecasts = await getFrontpage();
  frontPageForecasts = frontPageForecasts.map((forecast) => ({
    ...forecast,
    item: {
      ...forecast.item,
      timestamp: forecast.item.timestamp.toJSON(),
    },
  }));

  let initialResults =
    initialQueryParameters.query != ""
      ? await searchAccordingToQueryData(initialQueryParameters)
      : frontPageForecasts;

  let props = {
    initialQueryParameters: initialQueryParameters,
    initialResults: initialResults,
    defaultResults: frontPageForecasts,
    urlQuery: urlQuery,
  };

  return {
    props: props,
  };
};

/* Body */
export default function Home({
  initialResults,
  defaultResults,
  initialQueryParameters,
}) {
  return (
    <Layout page={"capture"}>
      <CommonDisplay
        initialResults={initialResults}
        defaultResults={defaultResults}
        initialQueryParameters={initialQueryParameters}
        hasSearchbar={true}
        hasCapture={true}
        hasAdvancedOptions={false}
        placeholder={"Get best title match..."}
        displaySeeMoreHint={false}
        displayForecastsWrapper={displayForecastsWrapperForCapture}
      />
    </Layout>
  );
}
