import { GetStaticProps, NextPage } from 'next';
import React from 'react';

import { getFrontpage } from '../backend/frontpage';
import CommonDisplay from '../web/display/commonDisplay';
import { displayForecastsWrapperForCapture } from '../web/display/displayForecastsWrappers';
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
const CapturePage: NextPage<Props> = ({ defaultResults }) => {
  return (
    <Layout page={"capture"}>
      <CommonDisplay
        defaultResults={defaultResults}
        hasSearchbar={true}
        hasCapture={true}
        hasAdvancedOptions={false}
        placeholder={"Get best title match..."}
        displaySeeMoreHint={false}
        displayForecastsWrapper={displayForecastsWrapperForCapture}
      />
    </Layout>
  );
};

export default CapturePage;
