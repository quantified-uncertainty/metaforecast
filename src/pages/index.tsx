import { GetServerSideProps } from 'next';
import React from 'react';

import { getFrontpage } from '../backend/frontpage';
import CommonDisplay from '../web/display/commonDisplay';
import { displayForecastsWrapperForSearch } from '../web/display/displayForecastsWrappers';
import { platformsWithLabels } from '../web/platforms';
import searchAccordingToQueryData from '../web/worker/searchAccordingToQueryData';
import Layout from './layout';

/* get Props */

export const getServerSideProps: GetServerSideProps = async (context) => {
  let urlQuery = context.query;

  let initialQueryParameters = {
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
    !!initialQueryParameters &&
    initialQueryParameters.query != "" &&
    initialQueryParameters.query != undefined
      ? await searchAccordingToQueryData(initialQueryParameters)
      : frontPageForecasts;

  return {
    props: {
      initialQueryParameters: initialQueryParameters,
      initialResults: initialResults,
      defaultResults: frontPageForecasts, // different from initialResults!
      urlQuery: urlQuery,
    },
  };
};

/* Body */
export default function Home({
  initialResults,
  defaultResults,
  initialQueryParameters,
}) {
  return (
    <Layout page={"search"}>
      <CommonDisplay
        initialResults={initialResults}
        defaultResults={defaultResults}
        initialQueryParameters={initialQueryParameters}
        hasSearchbar={true}
        hasCapture={false}
        hasAdvancedOptions={true}
        placeholder={"Find forecasts about..."}
        displaySeeMoreHint={true}
        displayForecastsWrapper={displayForecastsWrapperForSearch}
      />
    </Layout>
  );
}
