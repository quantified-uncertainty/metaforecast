import { GetStaticProps, NextPage } from 'next';
import React from 'react';

import { getFrontpage } from '../backend/frontpage';
import CommonDisplay from '../web/display/commonDisplay';
import { displayForecastsWrapperForSearch } from '../web/display/displayForecastsWrappers';
import Layout from './layout';

/* get Props */

interface Props {
  defaultResults: any;
}

export const getStaticProps: GetStaticProps<Props> = async (context) => {
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
      defaultResults: frontPageForecasts,
    },
    revalidate: 3600 * 6,
  };
};

/* Body */
const IndexPage: NextPage<Props> = ({ defaultResults }) => {
  return (
    <Layout page={"search"}>
      <CommonDisplay
        defaultResults={defaultResults}
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

export default IndexPage;
