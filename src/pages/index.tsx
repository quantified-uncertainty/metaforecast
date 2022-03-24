import { GetServerSideProps, NextPage } from 'next';
import React from 'react';

import { getFrontpage } from '../backend/frontpage';
import CommonDisplay, { QueryParameters } from '../web/display/commonDisplay';
import { displayForecastsWrapperForSearch } from '../web/display/displayForecastsWrappers';
import { platformsWithLabels } from '../web/platforms';
import Layout from './layout';

/* get Props */

interface Props {
  initialQueryParameters: QueryParameters;
  defaultResults: any;
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
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

  return {
    props: {
      initialQueryParameters: initialQueryParameters,
      defaultResults: frontPageForecasts,
    },
  };
};

/* Body */
const Home: NextPage<Props> = ({ defaultResults, initialQueryParameters }) => {
  return (
    <Layout page={"search"}>
      <CommonDisplay
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
};

export default Home;
